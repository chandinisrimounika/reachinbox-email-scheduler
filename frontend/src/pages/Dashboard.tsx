import { useEffect, useState } from "react";
import EmailForm from "../components/EmailForm";
import EmailList from "../components/EmailList";
import { getScheduledEmails, getSentEmails } from "../api/email";

type Email = {
  id: string;
  toEmail: string;
  subject: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: string;
};

export default function Dashboard({
  user,
  onLogout,
}: {
  user: { name: string; email: string; picture: string };
  onLogout: () => void;
}) {
  const [scheduled, setScheduled] = useState<Email[]>([]);
  const [sent, setSent] = useState<Email[]>([]);
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");

  const load = async () => {
    const s = await getScheduledEmails();
    const d = await getSentEmails();
    setScheduled(s.emails);
    setSent(d.emails);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-4">
        <div className="flex items-center gap-3 mb-6">
          <img src={user.picture} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <button className="w-full bg-green-500 text-white py-2 rounded mb-4">
          Compose
        </button>

        <nav className="space-y-2 text-sm">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`w-full text-left px-3 py-2 rounded ${
              activeTab === "scheduled"
                ? "bg-green-100 text-green-700"
                : "hover:bg-gray-100"
            }`}
          >
            Scheduled
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`w-full text-left px-3 py-2 rounded ${
              activeTab === "sent"
                ? "bg-green-100 text-green-700"
                : "hover:bg-gray-100"
            }`}
          >
            Sent
          </button>
        </nav>

        <button
          onClick={onLogout}
          className="absolute bottom-4 left-4 right-4 border py-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">
          {activeTab === "scheduled" ? "Scheduled Emails" : "Sent Emails"}
        </h1>

        <EmailForm onSuccess={load} />

        <EmailList
          emails={activeTab === "scheduled" ? scheduled : sent}
          type={activeTab}
        />
      </main>
    </div>
  );
}
