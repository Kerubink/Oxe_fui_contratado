import { ShieldCheck, Grid3X3 } from "lucide-react";

const InterviewHeader = () => (
    <header className="flex items-center justify-between p-2">
      <div className="flex items-center gap-1 text-white">
        <ShieldCheck />
        <span className="font-semibold">Sala segura, oxe!</span>
      </div>
      <button className="flex items-center gap-1 rounded-lg bg-blue-700 p-1.5 text-white hover:bg-blue-800">
        <Grid3X3 size={20} /> View
      </button>
    </header>
  );

  export default InterviewHeader;