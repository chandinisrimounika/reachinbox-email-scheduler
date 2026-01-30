type Email = {
  id: string;
  toEmail: string;
  subject: string;
  scheduledAt: string;
  sentAt?: string | null;
};

export default function EmailList({
  emails,
  type,
}: {
  emails: Email[];
  type: "scheduled" | "sent";
}) {
  if (emails.length === 0) {
    return <p className="text-gray-500">No emails</p>;
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <div
          key={email.id}
          className="bg-white p-4 rounded shadow flex justify-between"
        >
          <div>
            <p className="font-semibold">{email.subject}</p>
            <p className="text-sm text-gray-500">To: {email.toEmail}</p>
          </div>

          <p className="text-sm text-gray-400">
            {type === "sent"
              ? email.sentAt
                ? new Date(email.sentAt).toLocaleString()
                : "-"
              : new Date(email.scheduledAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
