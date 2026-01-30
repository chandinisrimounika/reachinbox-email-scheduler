import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { prisma } from "../config/prisma";
import { transporter } from "../utils/mailer";
import * as nodemailer from "nodemailer";

const MAX_EMAILS_PER_HOUR = Number(process.env.MAX_EMAILS_PER_HOUR || 5);
const MIN_DELAY_MS = Number(process.env.MIN_DELAY_BETWEEN_EMAILS_MS || 2000);

function getHourKey(date = new Date()) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}-${hh}`;
}

new Worker(
  "email-queue",
  async (job: Job) => {
    const { emailId } = job.data;

    // 1️⃣ Fetch email from DB
    const email = await prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!email || email.status !== "scheduled") {
      return;
    }

    // 2️⃣ Redis-based hourly rate limiting
    const hourKey = getHourKey();
    const redisKey = `email_count:global:${hourKey}`;

    const count = await redis.incr(redisKey);

    if (count === 1) {
      // auto-expire after 1 hour
      await redis.expire(redisKey, 60 * 60);
    }

    if (count > MAX_EMAILS_PER_HOUR) {
      console.log("⏳ Hourly limit reached. Rescheduling:", email.toEmail);

      // move job to next hour
      const nextHour = new Date();
      nextHour.setUTCMinutes(0, 0, 0);
      nextHour.setUTCHours(nextHour.getUTCHours() + 1);

      const delay = nextHour.getTime() - Date.now();
      await job.moveToDelayed(delay);

      return;
    }

    console.log("📧 Sending email to:", email.toEmail);

    // 3️⃣ Send email
    const info = await transporter.sendMail({
      from: '"ReachInbox" <no-reply@reachinbox.dev>',
      to: email.toEmail,
      subject: email.subject,
      text: email.body,
    });

    // 4️⃣ Preview URL (demo proof)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("📨 Ethereal Preview URL:", previewUrl);

    // 5️⃣ Update DB
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    console.log("✅ Email sent:", email.toEmail);

    // 6️⃣ Throttle between sends
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS));
  },
  {
    connection: redis,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  }
);
