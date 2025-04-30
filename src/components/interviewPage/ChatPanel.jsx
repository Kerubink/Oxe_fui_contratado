// src/components/interviewPage/ChatPanel.jsx
import React from "react";

const ChatPanel = ({
  chatVisible,
  chat,
  transcript,
  isSending,
  setTranscript,
  handleSend,
}) => (
  <div className="w-80 flex flex-col border-l border-gray-700 bg-neutral-800 h-full">
    <header className="flex-none bg-blue-800 p-2 text-white text-center">
      Chat da chamada
    </header>
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {chat.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.sender === "Você" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] rounded-lg px-3 py-2 transition-transform duration-200
              ${msg.sender === "Você" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}
              hover:scale-[1.02]
            `}
          >
            <strong className="block text-xs opacity-75 mb-1">
              {msg.sender}
            </strong>
            <p className="break-words">{msg.text}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="flex-none bg-neutral-700 p-2">
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={3}
        className="w-full p-2 rounded resize-none mb-2 bg-neutral-800 text-white placeholder:text-gray-400"
        placeholder="Fale sua resposta..."
      />
      <button
        onClick={handleSend}
        disabled={isSending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50 transition"
      >
        {isSending ? "Enviando..." : "Enviar"}
      </button>
    </div>
  </div>
);

export default ChatPanel;
