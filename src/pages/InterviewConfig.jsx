// src/pages/InterviewConfig.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { summarizeText } from "../utils/summarizer";
import { personalityOptions } from "../data/personalityOptions";
import { possibleTraits } from "../data/traits";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function InterviewConfig() {
  const [cvRaw, setCvRaw] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobDescSummary, setJobDescSummary] = useState("");
  const [personality, setPersonality] = useState("mentor");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const extractTextFromPdf = async (buffer) => {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
      .promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const { items } = await page.getTextContent();
      fullText += items.map((it) => it.str).join(" ") + "\n";
    }
    return fullText;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Selecione um PDF válido.");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = await extractTextFromPdf(reader.result);
        setCvRaw(text);
        setCvSummary(summarizeText(text, 5));
      } catch {
        alert("Erro ao processar o PDF.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleJobDescChange = (e) => {
    const txt = e.target.value;
    setJobDesc(txt);
    setJobDescSummary(summarizeText(txt, 3));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) {
      alert("Aguarde o processamento do CV.");
      return;
    }
    const ficha = {
      cvSummary,
      jobDescSummary,
      interviewer: {
        ...personalityOptions[personality].interviewer,
        level: personality,
        label: personalityOptions[personality].label,
        mbti: personalityOptions[personality].mbti,
        disc: personalityOptions[personality].disc,
      },
      timestamp: Date.now(),
    };
    await localforage.setItem("fichaEntrevista", ficha);
    navigate("/loading", { state: { ficha } });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CV (PDF)
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFile}
          required
        />
        {loading && <p className="text-sm text-gray-500">Processando PDF...</p>}
      </div>

      {/* {cvSummary && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resumo do CV (ajuste se quiser)
          </label>
          <textarea
            value={cvSummary}
            onChange={(e) => setCvSummary(e.target.value)}
            className="w-full h-32 p-2 border rounded-lg"
          />
        </div>
      )} */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição da Vaga
        </label>
        <textarea
          value={jobDesc}
          onChange={handleJobDescChange}
          className="w-full h-32 p-2 border rounded-lg"
          required
        />
      </div>

      {/* {jobDescSummary && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resumo da Vaga (ajuste se quiser)
          </label>
          <textarea
            value={jobDescSummary}
            onChange={(e) => setJobDescSummary(e.target.value)}
            className="w-full h-24 p-2 border rounded-lg"
          />
        </div>
      )} */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Perfil do Entrevistador
        </label>
        <select
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          {Object.entries(personalityOptions).map(([key, opt]) => (
            <option key={key} value={key}>
              {opt.label} – {opt.interviewer.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Salvar e Iniciar
      </button>
    </form>
  );
}
