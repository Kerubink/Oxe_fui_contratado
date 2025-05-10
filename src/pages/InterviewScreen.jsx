// src/pages/InterviewScreen.jsx
import React, { useState } from "react";
import { useInterviewEngine } from "../hooks/useInterviewEngine";
import StartScreen from "../components/interviewPage/StartScreen";
import InterviewHeader from "../components/interviewPage/InterviewHeader";
import VideoSection from "../components/interviewPage/VideoSection";
import ChatPanel from "../components/interviewPage/ChatPanel";
import ControlsFooter from "../components/interviewPage/ControlsFooter";

export default function InterviewScreen() {
  // estado local para controlar se o timer aparece ou não
  const [showTimer, setShowTimer] = useState(true);

  const {
    videoRef,
    micOn,
    ttsPlaying,
    camOn,
    setCamOn,
    chat,
    chatVisible,
    setChatVisible,
    transcript,
    setTranscript,
    toggleMic,
    sendResponse,
    isSending,
    userVisible,
    startInterview,
    interviewStarted,
  } = useInterviewEngine();

  // se ainda não iniciou, mostra a tela de início
  if (!interviewStarted) {
    return <StartScreen onStart={startInterview} />;
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-900 relative">
      {/* componente de áudio (TTS) */}
      <audio ref={videoRef} hidden />

      {/* Header recebe showTimer para exibir ou ocultar o cronômetro */}
      <InterviewHeader showTimer={showTimer} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Vídeo principal */}
        <VideoSection
          videoRef={videoRef}
          userVisible={userVisible}
          interviewerSpeaking={ttsPlaying}
          candidateSpeaking={micOn}
          chatVisible={chatVisible}
        />

        {/* Chat deslizante */}
        <div
          className={`
            absolute top-0 right-0 h-full
            w-80
            transform transition-transform duration-300 ease-in-out
            ${chatVisible ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <ChatPanel
            chatVisible={chatVisible}
            chat={chat}
            transcript={transcript}
            setTranscript={setTranscript}
            handleSend={sendResponse}
            isSending={isSending}
          />
        </div>
      </div>

      {/* Footer, agora com toggleTimerVisibility */}
      <ControlsFooter
        micOn={micOn}
        camOn={camOn}
        chatVisible={chatVisible}
        toggleMic={toggleMic}
        setCamOn={setCamOn}
        setChatVisible={setChatVisible}
        toggleTimerVisibility={() => setShowTimer((v) => !v)}
      />
    </div>
  );
}
