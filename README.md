# AI Chat - Proof of Concept

An intelligent, high-performance RAG (Retrieval-Augmented Generation) chat assistant designed for a fictitious company named **SolarNova Energia**. This application provides simple answers about solar energy based on a curated FAQ knowledge base.

## 🚀 Features

- **RAG Architecture**: Uses local vector embeddings to retrieve relevant context before answering.
- **AI-Powered**: Integrates with LLMs (Gemma 3:4b) via Ollama for local natural language processing.
- **Interactive Suggestions**: Recommends follow-up questions and provides category-based browsing.
- **Modern UI**: Modern dark-mode interface built with Next.js 16, Tailwind CSS 4, and Ark UI.
- **Source Transparency**: Shows exactly which FAQ entries were consulted to generate the answer.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/886b0f6e-9592-404f-baca-44ea43b470e6" />
<img width="1920" height="1080" alt="chrome_sWyzx2ao7P" src="https://github.com/user-attachments/assets/dc674bb6-4e65-4b2b-a218-a23e07f1c90d" />

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: [Next.js 16](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Components**: [Ark UI](https://ark-ui.com/) (Headless)
- **Icons**: [Tabler Icons](https://tabler.io/icons)

### Backend (Server)
- **Framework**: [AdonisJS 6](https://adonisjs.com/)
- **AI Orchestration**: [LangChain](https://js.langchain.com/)
- **Vector Database**: [Vectra](https://github.com/YousefED/Vectra) (Local index)
- **LLM Engine**: [Ollama](https://ollama.com/) (Running `gemma3:4b` and `nomic-embed-text`)

## ⚙️ How it Works

1. **Information Retrieval**: When a user asks a question, the server converts the query into a vector embedding using Ollama's `nomic-embed-text`.
2. **Context Search**: It searches the local Vectra index for the most relevant FAQ entries from `solar-faq.json`.
3. **Augmentation**: The retrieved context is injected into a specialized prompt.
4. **Generation**: The `gemma3:4b` model generates a response strictly based on the provided context, ensuring factual accuracy.

## 🏁 Getting Started

### Prerequisites
- Node.js (v20+)
- `pnpm` (recommended)
- At least 4GB of VRAM  
  - although less memory might be used and the model might be loaded into the RAM if not enough VRAM, but for slower responses

### 1. Setup Backend
```bash
cd server
pnpm install
# Copy .env.example to .env and configure if necessary
cp .env.example .env 
pnpm run dev
```

### 2. Setup Frontend
```bash
cd client
pnpm install
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## 📝 Important Notes

- **Language**: The assistant is configured to respond in Portuguese (Brazil).
- **Knowledge Base**: To update the AI's knowledge, modify the `server/solar-faq.json` file and restart the server (the vector index will re-seed automatically if empty).
- **Inference**: Performance depends on your local hardware since the LLM runs locally via Ollama.
