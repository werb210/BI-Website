import { useState } from "react";

export default function MayaChat() {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/maya-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#020C1C",
          color: "white",
          padding: "14px 18px",
          borderRadius: 30,
          cursor: "pointer",
          fontWeight: 600,
          zIndex: 9999
        }}
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
            style={{
              background: "#020C1C",
              color: "white",
              padding: 14,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              fontWeight: 600
            }}
          >
            Maya – Boreal Insurance
          </div>

          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: "auto",
              background: "#f7f9fc"
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
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    borderRadius: 18,
                    background: m.role === "user" ? "#020C1C" : "white",
                    color: m.role === "user" ? "white" : "#111",
                    border: m.role === "user" ? "none" : "1px solid #e5e7eb"
                  }}
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
                border: "1px solid #ddd"
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: 8,
                background: "#020C1C",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
