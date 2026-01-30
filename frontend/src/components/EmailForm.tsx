import { useState } from "react";

export default function EmailForm({ onSuccess }: { onSuccess: () => void }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState("");
  const [delayBetween, setDelayBetween] = useState(2000);

  // Handle CSV / TXT upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsedEmails = text
        .split(/\r?\n|,/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));

      setEmails(parsedEmails);
    };
    reader.readAsText(file);
  };

  const submit = async () => {
    const emailList =
      emails.length > 0
        ? emails
        : manualEmail
        ? [manualEmail]
        : [];

    if (!emailList.length || !subject || !body || !startTime) {
      alert("Please fill all required fields");
      return;
    }

    await fetch("http://localhost:4000/schedule-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emails: emailList,
        subject,
        body,
        startTime,
        delayBetween,
      }),
    });

    setEmails([]);
    setManualEmail("");
    setSubject("");
    setBody("");
    setStartTime("");

    onSuccess();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="font-semibold mb-3">Compose Email</h2>

      {/* Manual email */}
      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="Recipient email (optional if CSV used)"
        value={manualEmail}
        onChange={(e) => setManualEmail(e.target.value)}
      />

      {/* CSV Upload */}
      <input
        type="file"
        accept=".csv,.txt"
        className="mb-2"
        onChange={(e) =>
          e.target.files && handleFileUpload(e.target.files[0])
        }
      />

      {emails.length > 0 && (
        <p className="text-sm text-gray-600 mb-2">
          {emails.length} email(s) detected from file
        </p>
      )}

      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2 rounded h-24"
        placeholder="Write your email..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="flex gap-2 items-center">
        <input
          type="datetime-local"
          className="border p-2 rounded"
          onChange={(e) =>
            setStartTime(new Date(e.target.value).toISOString())
          }
        />

        <input
          type="number"
          className="border p-2 rounded w-32"
          value={delayBetween}
          onChange={(e) => setDelayBetween(Number(e.target.value))}
          title="Delay between emails (ms)"
        />

        <button
          onClick={submit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Schedule
        </button>
      </div>
    </div>
  );
}
