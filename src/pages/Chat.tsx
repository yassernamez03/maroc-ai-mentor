import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, UserCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Hugging Face token - Normally you would store this in .env but for demo purposes
  const HF_TOKEN = "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";

  const languages = [
    { id: "en", name: "English" },
    { id: "fr", name: "Français" },
    { id: "ar", name: "العربية" },
    { id: "darija", name: "دارجة" }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    } else {
      // Add welcome message if no history exists
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: "Marhaba! I'm your DarijaCode assistant. Ask me any coding question in Darija, Arabic, French, or English!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    // Save messages to localStorage whenever messages change
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create system prompt based on selected language
      let systemPrompt = "You are DarijaCode Hub's assistant, helping Moroccan developers learn to code. ";
      
      switch (selectedLanguage) {
        case "darija":
          systemPrompt += "Please respond in Moroccan Darija using Latin script. Use Moroccan cultural references when explaining coding concepts.";
          break;
        case "ar":
          systemPrompt += "Please respond in Arabic. Use Moroccan or Arab cultural references when explaining coding concepts.";
          break;
        case "fr":
          systemPrompt += "Veuillez répondre en français. Utilisez des références culturelles marocaines pour expliquer les concepts de programmation.";
          break;
        default:
          systemPrompt += "Please respond in English. Feel free to use Moroccan cultural references when explaining coding concepts.";
      }

      // Use GROQ API for chat completion
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || "PLACEHOLDER_API_KEY"}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: input }
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.choices[0]?.message?.content || "Sorry, I couldn't process that request.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message to API:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please make sure your API key is set up correctly.",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudioWithHuggingFace(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const transcribeAudioWithHuggingFace = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      // Using Hugging Face's ASR API
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");
      
      // Use a specific ASR model from Hugging Face - openai/whisper-large-v3 is a good choice
      const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error(`Transcription API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.text) {
        setInput(data.text);
      } else {
        throw new Error("No transcription returned");
      }
    } catch (error) {
      console.error("Error transcribing audio with Hugging Face:", error);
      alert("Could not transcribe audio. Please check your Hugging Face API token or try typing your message instead.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        AI Coding Assistant
      </h1>
      
      {/* Language selector */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {languages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-4 py-2 text-sm font-medium border ${
                selectedLanguage === lang.id 
                  ? 'bg-morocco-blue text-white border-morocco-blue' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
              } ${lang.id === 'en' ? 'rounded-l-lg' : ''} ${lang.id === 'darija' ? 'rounded-r-lg' : ''}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
        <div className="h-96 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-morocco-blue text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === "user" ? (
                    <UserCircle size={18} className="mr-1" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-morocco-blue to-morocco-mint flex items-center justify-center text-white text-xs font-bold mr-1">
                      DC
                    </div>
                  )}
                  <span className="font-semibold mr-2">
                    {message.role === "user" ? "You" : "DarijaCode"}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                <div className="flex items-center mb-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-morocco-blue to-morocco-mint flex items-center justify-center text-white text-xs font-bold mr-1">
                    DC
                  </div>
                  <span className="font-semibold mr-2">DarijaCode</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-morocco-blue rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-morocco-blue rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-morocco-blue rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a coding question..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isLoading || isRecording}
          />
        </div>
        
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-lg ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          }`}
          disabled={isLoading}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button
          type="submit"
          className="p-2 rounded-lg bg-morocco-blue hover:bg-morocco-blue/90 text-white"
          disabled={isLoading || isRecording || input.trim() === ""}
        >
          <Send size={20} />
        </button>
      </form>
      
      <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        <p>
          Powered by Groq LLaMA3 and Hugging Face Whisper. Your API keys are required for full functionality.
        </p>
      </div>
    </div>
  );
};

export default Chat;