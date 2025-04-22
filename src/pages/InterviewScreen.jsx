// src/pages/InterviewScreen.jsx
import { useInterviewEngine } from "../hooks/useInterviewEngine";
import StartScreen from "../components/interviewPage/StartScreen";
import InterviewHeader from "../components/interviewPage/InterviewHeader";
import VideoSection from "../components/interviewPage/VideoSection";
import ChatPanel from "../components/interviewPage/ChatPanel";
import ControlsFooter from "../components/interviewPage/ControlsFooter";

export default function InterviewScreen() {
  const {
    videoRef,
    audioRef,
    micOn,
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
    startInterview,
    interviewStarted,
  } = useInterviewEngine();

  if (!interviewStarted) return <StartScreen onStart={startInterview} />;

  return (
    <div className="h-screen flex flex-col bg-neutral-900">
      <audio ref={audioRef} hidden />
      <InterviewHeader />
      <div className="flex flex-1 gap-2 p-2">
        <VideoSection videoRef={videoRef} />
        <ChatPanel
          chatVisible={chatVisible}
          chat={chat}
          transcript={transcript}
          setTranscript={setTranscript}
          handleSend={sendResponse}
          isSending={isSending}
        />
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
