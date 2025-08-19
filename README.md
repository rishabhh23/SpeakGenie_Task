Genie – Real-Time AI Voice English Tutor 🎙️🤖

An AI-powered English tutor built with Next.js (TypeScript), TailwindCSS, and AI APIs.
Students can practice English in real-time voice conversations, roleplay daily scenarios, and even listen in their native languages.

--- Features ---

🎤 Voice Input (STT) – Speak into the mic, speech is converted to text

💬 AI Chatbot (GPT) – Child-friendly tutor replies

🔊 Voice Output (TTS) – Tutor speaks back with natural voice

🎭 Roleplay Mode – Practice English in real-life scenarios (school, store, home)

🌐 Native Language Playback – Hear replies in Hindi, Marathi, Gujarati, Tamil, etc.

📝 Chat Log – Scrollable chat history with feedback emojis & tips

⭐ Child-Safe Personality – Encouraging and friendly AI tutor

--- Tech Stack ---

Next.js 14 (App Router, TypeScript)

TailwindCSS (UI styling)

STT: OpenAI Whisper API (or Google STT)

TTS: ElevenLabs / Google Cloud TTS

AI: GPT model (OpenAI)

Translation: Google Translate API (or similar)

--- Getting Started ---

1. Clone & Install
   git clone https://github.com/your-username/genie-voice-tutor.git
   cd genie-voice-tutor
   npm install

2. Environment Variables

Create a .env.local file:

OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key # if using Google STT/TTS/Translate
ELEVENLABS_API_KEY=your_elevenlabs_key # if using ElevenLabs TTS

3. Run Dev Server
   npm run dev

Now open http://localhost:3000

--- Screens ---
Screens

Tutor Mode: Free Q&A with AI Genie

Roleplay Mode: Practice scenarios (School, Store, Home)

Native Language: Bot replies also appear in Hindi/Marathi/etc.
