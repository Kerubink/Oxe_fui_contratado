
<p align="center"><h1 align="center">OXE_FUI_CONTRATADO</h1></p>
<p align="center">
    <em><code>Simulador de Entrevistas com IA</code></em>
</p>
<p align="center">
    <img src="https://img.shields.io/github/license/Kerubink/Oxe_fui_contratado?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
    <img src="https://img.shields.io/github/last-commit/Kerubink/Oxe_fui_contratado?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
    <img src="https://img.shields.io/github/languages/top/Kerubink/Oxe_fui_contratado?style=default&color=0080ff" alt="repo-top-language">
    <img src="https://img.shields.io/github/languages/count/Kerubink/Oxe_fui_contratado?style=default&color=0080ff" alt="repo-language-count">
</p>

## 🔗 Tabela de Conteúdos

- [📍 Visão Geral](#-visão-geral)
- [👾 Funcionalidades](#-funcionalidades)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
  - [📂 Índice do Projeto](#-índice-do-projeto)
- [🚀 Começando](#-começando)
  - [☑️ Pré-requisitos](#-pré-requisitos)
  - [⚙️ Instalação](#-instalação)
  - [🤖 Uso](#-uso)
  - [🧪 Testes](#-testes)
- [📌 Roadmap do Projeto](#-roadmap-do-projeto)
- [🔰 Contribuição](#-contribuição)
- [🎗 Licença](#-licença)
- [🙌 Agradecimentos](#-agradecimentos)

---

## 📍 Visão Geral

A aplicação **OXE_FUI_CONTRATADO** é um simulador de entrevistas técnicas que roda totalmente no navegador. Com base no currículo em PDF, descrição de vaga e perfil do entrevistador selecionado, a IA gera perguntas dinâmicas e contextuais, oferecendo uma experiência de preparação realista. Após a entrevista, é apresentada uma avaliação detalhada com pontuações e feedback usando modelos de linguagem.

---

## 👾 Funcionalidades

- 📄 **Upload de Currículo (PDF):** Processamento de arquivos PDF com extração e resumo automático do conteúdo (via pdf.js e sumarização).
- 🔖 **Inserção de Cargo e Empresa:** Campos para especificar o cargo desejado e a empresa alvo.
- 📋 **Análise da Descrição da Vaga:** Recebe texto da vaga e gera um resumo conciso para orientar as perguntas.
- 🧑‍💼 **Perfis de Entrevistador:** Selecione personalidades diferentes (mentor, avaliador técnico, etc.) que influenciam o estilo das perguntas.
- 🎯 **Geração de Perguntas Dinâmicas:** Combina informações de currículo, vaga e respostas anteriores para criar follow-ups contextuais.
- 🚀 **Modo “Super Entrevista”:** Intercala um roteiro fixo de 8 perguntas com perguntas geradas pela IA em slots de follow-up. (em desenvolvimento)
- 🎥 **Verificação de Vídeo e Áudio:** Antes de iniciar, testa câmera e microfone para garantir qualidade.
- 📹 **Entrevista em Vídeo com TTS:** Reproduz voz do entrevistador via Text-to-Speech e captura respostas com reconhecimento de fala.
- 📊 **Avaliação Pós-Entrevista:** Exibe pontuações (Técnica, Afinidade, Geral) e feedback detalhado usando Gemini API.
- 💾 **Persistência Local:** Armazena configurações e resumo de entrevistas no IndexedDB (via localforage).
- 🌐 **Sem Backend:** Toda a lógica roda no cliente, sem necessidade de servidor adicional.

---

## 📁 Estrutura do Projeto

```sh
└── Oxe_fui_contratado/
    ├── README.md
    ├── api
    │   ├── tts-local.cjs
    │   └── tts.js
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── public
    │   ├── entrevistadores
    │   ├── models
    │   ├── perguntas.json
    │   ├── reforcadores.json
    │   └── vite.svg
    ├── src
    │   ├── App.jsx
    │   ├── assets
    │   ├── components
    │   ├── data
    │   ├── hooks
    │   ├── index.css
    │   ├── main.jsx
    │   ├── pages
    │   ├── services
    │   └── utils
    ├── vercel.json
    └── vite.config.js
```

### 📂 Índice do Projeto

<details open>
  <summary><b>OXE_FUI_CONTRATADO/</b></summary>
  <!-- Detalhes do índice do projeto, mantenha conforme o original -->
</details>

---

## 🚀 Começando

### ☑️ Pré-requisitos

- **Node.js** (v14 ou superior)
- **npm** (ou **yarn**)
- Navegador compatível com WebAssembly e IndexedDB

### ⚙️ Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Kerubink/Oxe_fui_contratado.git
   cd Oxe_fui_contratado
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

### 🤖 Uso

Inicie a aplicação em modo de desenvolvimento:
```bash
npm run dev
```
Abra `http://localhost:5173` no navegador.

### 🧪 Testes

Execute a suíte de testes:
```bash
npm test
```

---

## 📌 Roadmap do Projeto

- [X] **Configuração de CV e Vaga:** Upload e resumo automático
- [X] **Geração de Entrevista:** perguntas contextuais
- [X] **Verificação de Hardware:** Checagem de vídeo e áudio
- [ ] **Suporte a mais perfis de entrevistador**
- [ ] **Exportar relatório de avaliação**
- [ ] **Versão mobile responsiva**

---

## 🔰 Contribuição

Contribuições são bem-vindas! Por favor, siga as etapas:

1. Fork deste repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 🎗 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙌 Agradecimentos

- [pdf.js](https://mozilla.github.io/pdf.js/) para extração de texto de PDFs
- Comunidade React e Tailwind CSS
