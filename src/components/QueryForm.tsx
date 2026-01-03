import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Camera } from 'lucide-react';
import { Message } from '../App';
import axios from 'axios';
import VoiceInput from './VoiceInput';


interface QueryFormProps {
  onMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
}

export function QueryForm({ onMessage }: QueryFormProps) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [crop, setCrop] = useState('');
  const [season, setSeason] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQueryId, setLastQueryId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const phone = localStorage.getItem('farmerPhone');

  useEffect(() => {
    if (phone) {
      fetch(`http://localhost:8000/api/profile/${phone}/`)
        .then(res => res.json())
        .then(data => {
          setRegion(data.region || '');
          setCrop(data.preferred_crop || '');
          setSeason(data.preferred_season || '');
        });
    }
  }, [phone]);

  useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("User location:", latitude, longitude); // Debug

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(res => res.json())
        .then(data => {
          console.log("Reverse geocode result:", data); // Debug
          const geoRegion = data.address.state || data.address.county;
          if (!region) setRegion(geoRegion);
        });
    },
    (error) => {
      console.error("Location error:", error);
    }
  );
}, []);


  const regionCropMap: Record<string, string[]> = {
    "Kerala": ["banana", "rice", "ginger", "turmeric"],
    "Maharashtra": ["cotton", "soybean", "chili", "turmeric"],
    "Punjab": ["wheat", "rice", "maize"],
    "Tamil Nadu": ["rice", "banana", "onion", "brinjal"],
    "Karnataka": ["ragi", "groundnut", "turmeric", "chili"],
    "Uttar Pradesh": ["wheat", "rice", "mustard", "chana"],
    "West Bengal": ["rice", "jute", "potato"],
  };

  const cropOptions = region ? regionCropMap[region] || [] : [];

  const sendFeedback = (pk: number, feedback: string) => {
    axios
      .post(`http://localhost:8000/api/feedback/${pk}/`, { feedback })
      .then(() => alert('आपकी प्रतिक्रिया के लिए धन्यवाद!'))
      .catch((err) => console.error('Feedback error:', err));
  };

  const saveToHistory = (query: string) => {
    const history = JSON.parse(localStorage.getItem('farmerHistory') || '[]');
    history.push({ query, timestamp: new Date().toISOString(), region });
    localStorage.setItem('farmerHistory', JSON.stringify(history));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('');
    setIsLoading(true);

    onMessage({ type: 'farmer', content: userMessage });
    saveToHistory(userMessage);
    console.log("Sending query:", { query_text: userMessage, region, crop, season, phone });

    try {
      const res = await fetch('http://localhost:8000/api/query/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_text: userMessage,
          region,
          crop,
          season,
          phone
        }),
      });

      const data = await res.json();
      setLastQueryId(data.id);

      onMessage({
        type: 'ai',
        content: data.response,
        confidence: data.confidence || 0.9,
        escalated: data.escalated || false,
      });
      
    } catch (err) {
      onMessage({
        type: 'ai',
        content: 'सर्वर से जवाब प्राप्त नहीं हुआ। कृपया बाद में प्रयास करें।',
        confidence: 0.0,
        escalated: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'hi-IN';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery((prev) => prev + transcript);
        };
        recognition.start();
        setIsRecording(true);

        setTimeout(() => {
          recognition.stop();
          setIsRecording(false);
        }, 5000);
      } else {
        alert('आपका ब्राउज़र वॉइस रिकॉर्डिंग को सपोर्ट नहीं करता');
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onMessage({
          type: 'farmer',
          content: 'मैंने एक फोटो भेजी है। कृपया इसे देखकर सलाह दें।',
          metadata: { imageUrl: reader.result as string },
        });

        setTimeout(() => {
          onMessage({
            type: 'ai',
            content:
              'फोटो का विश्लेषण करने के बाद, यह टमाटर के पत्तों पर फंगल रोग दिख रहा है। तुरंत उपचार:\n\n1. कॉपर ऑक्सीक्लोराइड (0.3%) का छिड़काव करें\n2. प्रभावित पत्तियों को हटाएं और जला दें\n3. खेत में हवा का संचार बढ़ाएं\n4. 10 दिन बाद दोहराएं\n\nयदि 15 दिन में सुधार न हो तो कृषि अधिकारी से मिलें।',
            confidence: 0.88,
          });
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">📍 Select Region</option>
          <option value="MH">Maharashtra</option>
          <option value="KL">Kerala</option>
          <option value="PB">Punjab</option>
          <option value="TN">Tamil Nadu</option>
        </select>

        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">🌿 Select Crop</option>
          {cropOptions.length > 0
            ? cropOptions.map(c => <option key={c} value={c}>{c}</option>)
            : ["banana", "rice", "wheat", "tomato", "cotton", "chili", "soybean", "onion", "brinjal", "turmeric", "ginger"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
        </select>

        <select
        value={season}
        onChange={(e) => setSeason(e.target.value)}
        className="border px-3 py-2 rounded w-full"
        >
        <option value="">🗓️ Select Season</option>
        <option value="kharif">Kharif</option>
        <option value="rabi">Rabi</option>
        <option value="summer">Summer</option>
        </select>

        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="अपना सवाल यहां लिखें... (हिंदी में)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>भेजें</span>
          </button>
        </div>



        <VoiceInput onTranscribe={(text: string) => setQuery(text)} />


        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {isRecording && (
          <div className="text-sm text-red-600 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <span>रिकॉर्डिंग... (5 सेकंड)</span>
          </div>
        )}

        {isLoading && (
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <span>AI सलाह तैयार कर रहा है...</span>
          </div>
        )}

        {lastQueryId && (
          <div className="mt-4 flex items-center space-x-3">
            <p className="text-sm font-medium">क्या यह सलाह उपयोगी थी?</p>
            <button
              onClick={() => sendFeedback(lastQueryId, '👍')}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              👍
            </button>
            <button
              onClick={() => sendFeedback(lastQueryId, '👎')}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              👎
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
