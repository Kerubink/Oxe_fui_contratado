// src/pages/InterviewConfig.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';

import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { summarizeText } from '../utils/summarizer';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const personalityOptions = {
    mentor: {
      label: 'Mentor Acolhedor',
      mbti: 'ISFJ',
      disc: 'SC',
      interviewer: {
        name: 'Ana Lúcia Fernandes',
        gender: 'Feminino',
        traits: ['Empático', 'Paciente', 'Observador', 'Encorajador'],
        description: "Líder técnica com 12 anos de experiência em formação de juniores. Valoriza crescimento gradual e dá feedbacks construtivos."
      }
    },
    estrategista: {
      label: 'Estrategista Visionário',
      mbti: 'ENTJ',
      disc: 'DC',
      interviewer: {
        name: 'Ricardo Almeida',
        gender: 'Masculino',
        traits: ['Analítico', 'Visionário', 'Decisivo', 'Exigente'],
        description: "Diretor de inovação que prioriza pensamento estratégico. Costuma criar cenários complexos durante a entrevista."
      }
    },
    dinamico: {
      label: 'Dinamizador Criativo',
      mbti: 'ENFP',
      disc: 'ID',
      interviewer: {
        name: 'Fernanda Castro',
        gender: 'Feminino',
        traits: ['Energético', 'Persuasivo', 'Adaptável', 'Curioso'],
        description: "Head de Produto em startup aceleradora. Testa capacidade de improviso com mudanças bruscas de contexto."
      }
    },
    tecnico: {
      label: 'Especialista Rigoroso',
      mbti: 'ISTP',
      disc: 'CD',
      interviewer: {
        name: 'Dr. Carlos Mendes',
        gender: 'Masculino',
        traits: ['Metódico', 'Preciso', 'Analítico', 'Detalhista'],
        description: "Arquiteto de sistemas com foco em soluções otimizadas. Perguntas técnicas profundas e casos extremos."
      }
    },
    negociador: {
      label: 'Diplomata Relacional',
      mbti: 'INFJ',
      disc: 'SI',
      interviewer: {
        name: 'Mariana Lima',
        gender: 'Feminino',
        traits: ['Diplomática', 'Empática', 'Colaborativa', 'Observadora'],
        description: "HRBP sênior especialista em fit cultural. Simula conflitos de equipe para avaliar soft skills."
      }
    },
    executor: {
      label: 'Executor Pragmático',
      mbti: 'ESTJ',
      disc: 'DC',
      interviewer: {
        name: 'Roberto Nascimento',
        gender: 'Masculino',
        traits: ['Prático', 'Direto', 'Decisivo', 'Orientado a Resultados'],
        description: "Gerente de operações que testa capacidade de ação sob pressão com perguntas curtas e objetivas."
      }
    }
  };

export default function InterviewConfig() {
  const [cvRaw, setCvRaw]                   = useState('');
  const [cvSummary, setCvSummary]           = useState('');
  const [jobDesc, setJobDesc]               = useState('');
  const [jobDescSummary, setJobDescSummary] = useState('');
  const [personality, setPersonality]       = useState('facil');
  const [loading, setLoading]               = useState(false);
  const navigate = useNavigate();

  const extractTextFromPdf = async (buffer) => {
    const pdf = await pdfjsLib
      .getDocument({ data: new Uint8Array(buffer) })
      .promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const { items } = await page.getTextContent();
      fullText += items.map((it) => it.str).join(' ') + '\n';
    }
    return fullText;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Selecione um PDF válido.');
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
        alert('Erro ao processar o PDF.');
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
      alert('Aguarde o processamento do CV.');
      return;
    }
    const ficha = {
      cvSummary,
      jobDescSummary,
      interviewer: { level: personality, ...personalityOptions[personality] },
      timestamp: Date.now(),
    };
    await localforage.setItem('fichaEntrevista', ficha);
    navigate('/interview', { state: { ficha } });
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
        {loading && (
          <p className="text-sm text-gray-500">Processando PDF...</p>
        )}
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
