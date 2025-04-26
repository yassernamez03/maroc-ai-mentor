
# DarijaCode Hub

An AI-powered platform helping Moroccan developers learn coding in Darija, Arabic, French, and English.

## Features

- **Multilingual Support**: Content in Darija, Arabic, French, and English
- **AI Chatbot**: Ask coding questions in multiple languages
- **Learning Resources**: AI-generated explanations for coding concepts
- **Learning Paths**: Personalized learning journeys 
- **Project Ideas**: AI-suggested coding projects
- **Community Forum**: Connect with other Moroccan developers
- **Voice Input**: Speak your questions instead of typing

## Technologies Used

- React with TypeScript
- TailwindCSS for styling
- Groq API for LLaMA3-70b-chat AI model
- Whisper API for audio transcription
- Mermaid.js for flowcharts and diagrams
- LocalStorage for saving user progress

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_GROQ_API_KEY=your_groq_api_key
VITE_OPENAI_API_KEY=your_openai_api_key_for_whisper
```

### Installation

1. Clone this repository
2. Install dependencies
   ```
   npm install
   ```
3. Start the development server
   ```
   npm run dev
   ```

## API Key Setup

1. Get a Groq API key from [Groq](https://console.groq.com/)
2. Get an OpenAI API key from [OpenAI](https://platform.openai.com/) for Whisper audio transcription
3. Add both keys to your `.env` file

## Usage

- **Chat**: Ask coding questions in your preferred language
- **Learning**: Browse AI-generated lessons on various topics
- **Learning Path**: Get a personalized roadmap based on your goals
- **Projects**: Explore project ideas with detailed instructions
- **Community**: Connect with other developers and share experiences

## License

MIT
