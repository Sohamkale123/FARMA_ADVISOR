import { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { Message } from '../App';
import FarmerHistory from './FarmerHistory';

interface DashboardProps {
  messages: Message[];
}

export function Dashboard({ messages }: DashboardProps) {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [feedbackStats, setFeedbackStats] = useState({
    low_confidence: 0,
    escalated: 0,
    flagged_combos: [],
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/feedback-stats/')
      .then(res => res.json())
      .then(data => setFeedbackStats(data));
  }, []);

  const filteredMessages = messages.filter(m => {
    const matchRegion = selectedRegion ? m.region === selectedRegion : true;
    const matchCrop = selectedCrop ? m.metadata?.crop === selectedCrop : true;
    const matchSeason = selectedSeason ? m.metadata?.season === selectedSeason : true;
    return matchRegion && matchCrop && matchSeason;
  });

  const totalQueries = filteredMessages.filter(m => m.type === 'farmer').length;
  const escalatedQueries = filteredMessages.filter(m => m.escalated).length;
  const avgConfidence = filteredMessages
    .filter(m => m.type === 'ai' && m.confidence)
    .reduce((acc, m) => acc + (m.confidence || 0), 0) /
    (filteredMessages.filter(m => m.type === 'ai' && m.confidence).length || 1);

  const queryCategories = [
    { category: 'पेड़-पौधे की बीमारी', count: 45, color: 'bg-red-500' },
    { category: 'मौसम जानकारी', count: 38, color: 'bg-blue-500' },
    { category: 'सब्सिडी योजना', count: 32, color: 'bg-green-500' },
    { category: 'कीट नियंत्रण', count: 28, color: 'bg-yellow-500' },
    { category: 'अन्य', count: 15, color: 'bg-gray-500' }
  ];

  const recentEscalations = [
    { id: 1, query: 'धान में झुलसा रोग का इलाज', time: '2 घंटे पहले', status: 'pending' },
    { id: 2, query: 'आम के बागान में कीड़े की समस्या', time: '4 घंटे पहले', status: 'resolved' },
    { id: 3, query: 'गेहूं की नई किस्म की जानकारी', time: '6 घंटे पहले', status: 'resolved' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <div className="text-sm text-gray-500">आज तक की रिपोर्ट</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-start">
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">🌍 सभी क्षेत्र</option>
          <option value="MH">📍 महाराष्ट्र</option>
          <option value="KL">📍 केरल</option>
          <option value="PB">📍 पंजाब</option>
          <option value="TN">📍 तमिलनाडु</option>
        </select>

        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">🌿 सभी फसलें</option>
          <option value="banana">केला</option>
          <option value="rice">धान</option>
          <option value="wheat">गेंहू</option>
          <option value="tomato">टमाटर</option>
          <option value="cotton">कपास</option>
          <option value="maize">मक्का</option>
          <option value="chili">मिर्च</option>
          <option value="soybean">सोयाबीन</option>
          <option value="groundnut">मूंगफली</option>
          <option value="onion">प्याज</option>
          <option value="brinjal">बैंगन</option>
          <option value="turmeric">हल्दी</option>
          <option value="ginger">अदरक</option>
        </select>

        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">🗓️ सभी मौसम</option>
          <option value="kharif">खरीफ</option>
          <option value="rabi">रबी</option>
          <option value="summer">गर्मी</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">कुल प्रश्न</p>
              <p className="text-2xl font-bold text-gray-800">{totalQueries}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI सटीकता</p>
              <p className="text-2xl font-bold text-gray-800">{Math.round(avgConfidence * 100)}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">एस्केलेशन</p>
              <p className="text-2xl font-bold text-gray-800">{escalatedQueries}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">सक्रिय किसान</p>
              <p className="text-2xl font-bold text-gray-800">1,247</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Feedback Loop Alerts */}
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h3 className="text-red-700 font-semibold mb-2">⚠️ Feedback Loop Alerts</h3>
        <p>Low-confidence responses: <strong>{feedbackStats.low_confidence}</strong></p>
        <p>Escalated queries: <strong>{feedbackStats.escalated}</strong></p>
        <p className="mt-2 font-medium">Flagged crop-season combos:</p>
        <ul className="list-disc ml-5 text-sm">
          {feedbackStats.flagged_combos.map((combo: any, i: number) => (
            <li key={i}>{combo.crop} - {combo.season} ({combo.count})</li>
          ))}
        </ul>
      </div>


        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">सक्रिय किसान</p>
              <p className="text-2xl font-bold text-gray-800">1,247</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      

      {/* Query Categories & Recent Escalations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            प्रश्न श्रेणियां
          </h3>
          <div className="space-y-4">
            {queryCategories.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            हाल की एस्केलेशन
          </h3>
          <div className="space-y-4">
            {recentEscalations.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  item.status === 'resolved' ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.query}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">{item.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.status === 'resolved' ? 'हल हो गया' : 'प्रतीक्षित'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Farmer History Viewer */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📞 किसान इतिहास देखें</h3>
        <FarmerHistory />
      </div>
    </div>
  );
}
