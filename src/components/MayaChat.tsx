import { useState } from "react";

export default function MayaChat() {
  const mayaEnabled = true;

  if (!mayaEnabled) return null;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hi, I'm Maya. Ask me about Personal Guarantee Insurance."
    }
  ]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/maya/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "bot", text: data.reply || "Sorry, something went wrong." }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Unable to connect to Maya right now." }
      ]);
    }

    setInput("");
  }

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-brand-bg text-white py-3.5 px-[18px] rounded-[30px] cursor-pointer font-semibold z-[9999]"
      >
        Chat CB – Powered by Maya
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 360,
            height: 500,
            background: "white",
            borderRadius: 14,
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999
          }}
        >
          <div
            className="bg-brand-bg text-white p-[14px] rounded-t-[14px] font-semibold"
          >
            Maya – Boreal Insurance
          </div>

          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: "auto",
              background: "rgb(247 249 252)"
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  textAlign: m.role === "user" ? "right" : "left"
                }}
              >
                <span
                  className={m.role === "user" ? "inline-block py-2 px-[14px] rounded-[18px] bg-brand-bg text-white" : "inline-block py-2 px-[14px] rounded-[18px] bg-white text-black border border-gray-200"}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", padding: 12 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Maya..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid rgb(221 221 221)"
              }}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-brand-bg text-white border-none py-2.5 px-4 rounded-lg cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
