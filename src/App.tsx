import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { QueryForm } from './components/QueryForm';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { WeatherWidget } from './components/WeatherWidget';
import { SchemeInfo } from './components/SchemeInfo';
import OfficerDashboard from './pages/OfficerDashboard';

export interface Message {
  id: string;
  type: 'farmer' | 'ai' | 'officer';
  content: string;
  timestamp: Date;
  confidence?: number;
  escalated?: boolean;
  region?: string; // ✅ Added for region filtering
  metadata?: {
    location?: string;
    crop?: string;
    season?: string;
    imageUrl?: string;
  };
}

function MainApp() {
  const [currentView, setCurrentView] = useState<'chat' | 'dashboard'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'नमस्कार! मैं आपका डिजिटल कृषि अधिकारी हूँ। आप मुझसे फसल, कीट, मौसम, सब्सिडी या किसी भी कृषि संबंधी सवाल पूछ सकते हैं। आप टेक्स्ट, आवाज़ या फोटो के द्वारा अपना सवाल पूछ सकते हैं।',
      timestamp: new Date(),
      confidence: 1.0
    }
  ]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {currentView === 'chat' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <ChatInterface messages={messages} />
                <QueryForm onMessage={addMessage} />
              </div>
            </div>
            
            <div className="space-y-6">
              <WeatherWidget />
              <SchemeInfo />
            </div>
          </div>
        ) : (
          <Dashboard messages={messages} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/officer" element={<OfficerDashboard />} />
    </Routes>
  );
}

export default App;

