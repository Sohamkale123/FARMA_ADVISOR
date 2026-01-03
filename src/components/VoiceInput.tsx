import { useState } from 'react';

export default function VoiceInput({ onTranscribe }: { onTranscribe: (text: string) => void }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ml-IN'; // Malayalam
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e: any) => console.error('Speech error:', e);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscribe(transcript); // Pass to parent component
    };

    recognition.start();
  };

  return (
    <button
      className={`px-4 py-2 rounded ${listening ? 'bg-red-500' : 'bg-blue-600'} text-white`}
      onClick={startListening}
    >
      🎙️ {listening ? 'Listening…' : 'Speak in Malayalam'}
    </button>
  );
}
