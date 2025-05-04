// src/pages/InterviewConfig.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  FileText,
  Briefcase,
  Building2,
  User,
  CheckCircle,
  ChevronRight,
  Text
} from "lucide-react";
import { summarizeText } from "../utils/summarizer";
import { personalityOptions } from "../data/personalityOptions";
import { convertTraits } from "../data/traits";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function InterviewConfig() {
  const [cvSummary, setCvSummary] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobDescSummary, setJobDescSummary] = useState("");
  const [personality, setPersonality] = useState("mentor");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function extractTextFromPdf(buffer) {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const { items } = await page.getTextContent();
      fullText += items.map((it) => it.str).join(" ") + "\n";
    }
    return fullText;
  }

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
    if (!jobTitle.trim() || !company.trim()) {
      alert("Preencha Cargo e Empresa.");
      return;
    }

    const base = personalityOptions[personality];
    const ficha = {
      cvSummary,
      jobTitle,
      company,
      jobDescSummary,
      interviewer: {
        ...base.interviewer,
        traits: convertTraits(base.interviewer.traits),
        level: personality,
        img: base.img,
        label: base.label,
        mbti: base.mbti,
        disc: base.disc,
      },
      timestamp: Date.now(),
    };

    await localforage.setItem("fichaEntrevista", ficha);
    navigate("/loaing");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-gray-900">
          <FileText className="w-8 h-8 text-blue-600" />
          Configuração da Entrevista
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          Etapa 1 de 3
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
        {/* CV Upload */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <label className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-4">
            <FileText size={24} className="text-blue-500" />
            Currículo (PDF)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              className="
                block w-full text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
              "
              required
            />
            {loading && <p className="text-blue-600 italic">Processando...</p>}
            {!loading && cvSummary && (
              <CheckCircle className="w-6 h-6 text-green-500 animate-bounce" />
            )}
          </div>
          {cvSummary && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md border-l-4 border-blue-300 text-gray-700">
              <strong className="block mb-2">Resumo do CV:</strong>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {cvSummary}
              </p>
            </div>
          )}
        </section>

        {/* Cargo & Empresa */}
        <section className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <Briefcase size={20} className="text-blue-500" />
              Cargo Desejado
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex.: Desenvolvedor Front-end"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <Building2 size={20} className="text-blue-500" />
              Empresa
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex.: PetLove"
              required
            />
          </div>
        </section>

        {/* Descrição da Vaga */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <label className="flex items-center gap-2 text-gray-700 mb-1">
            <Text size={20} className="text-blue-500" />
            Descrição da Vaga
          </label>
          <textarea
            value={jobDesc}
            onChange={handleJobDescChange}
            rows={6}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cole aqui a descrição completa da vaga"
            required
          />
          {jobDescSummary && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md border-l-4 border-blue-300 text-gray-700">
              <strong className="block mb-2">Resumo da Vaga:</strong>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {jobDescSummary}
              </p>
            </div>
          )}
        </section>

        {/* Perfil do Entrevistador */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <label className="flex items-center gap-2 text-gray-700 mb-1">
            <User size={20} className="text-blue-500" />
            Perfil do Entrevistador
          </label>
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(personalityOptions).map(([key, opt]) => (
              <option key={key} value={key}>
                {opt.label} — {opt.interviewer.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Escolha a personalidade que conduzirá a entrevista.
          </p>
        </section>

        {/* Botão Final */}
        <div className="text-center">
          <button
            type="submit"
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-gradient-to-r from-blue-600 to-teal-400
              text-white font-semibold rounded-md shadow-lg
              hover:from-blue-700 hover:to-teal-500 transition
            "
          >
              Enviar Dados
            <ChevronRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
