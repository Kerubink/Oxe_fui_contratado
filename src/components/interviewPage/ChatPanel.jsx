// src/components/interviewPage/ChatPanel.jsx
const ChatPanel = ({
  chatVisible,
  chat,
  transcript,
  isSending,
  setTranscript,
  handleSend
}) => (
  chatVisible && (
    <div className="w-1/4 flex flex-col border-l border-gray-700 bg-neutral-800">
      <header className="flex-none bg-blue-800 p-2 text-white text-center">
        Chat da chamada
      </header>
      <div className="max-h-[600px] overflow-y-auto p-2">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 flex ${msg.sender === "Você" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block rounded-lg px-3 py-1 ${
                msg.sender === "Você"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              <strong className="block text-xs opacity-75">
                {msg.sender}
              </strong>
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>
      {/* área de envio fixa ao fundo */}
      <div className="flex-none bg-neutral-700 p-2">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={4}
          className="w-full h-24 p-2 rounded resize-none mb-2"
          placeholder="Fale sua resposta..."
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="w-full bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSending ? "Enviando..." : "Enviar Resposta"}
        </button>
      </div>
    </div>
  )
);

export default ChatPanel;
