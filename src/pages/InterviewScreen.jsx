// src/pages/InterviewScreen.jsx
import React from "react";
import { useInterviewEngine } from "../hooks/useInterviewEngine";
import StartScreen from "../components/interviewPage/StartScreen";
import InterviewHeader from "../components/interviewPage/InterviewHeader";
import VideoSection from "../components/interviewPage/VideoSection";
import ChatPanel from "../components/interviewPage/ChatPanel";
import ControlsFooter from "../components/interviewPage/ControlsFooter";

export default function InterviewScreen() {
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

  if (!interviewStarted) return <StartScreen onStart={startInterview} />;

  return (
    <div className="h-screen flex flex-col bg-neutral-900 relative">
      <audio ref={videoRef} hidden />

      <InterviewHeader />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Vídeo: passa chatVisible para ajustar largura */}
        <VideoSection
          videoRef={videoRef}
          userVisible={userVisible}
          interviewerSpeaking={ttsPlaying}
          candidateSpeaking={micOn}
          chatVisible={chatVisible}
        />

        {/* Chat absoluto que desliza por cima/parcialmente */}
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

      <ControlsFooter
        micOn={micOn}
        camOn={camOn}
        chatVisible={chatVisible}
        toggleMic={toggleMic}
        setCamOn={setCamOn}
        setChatVisible={setChatVisible}
      />
    </div>
  );
}
