import { useState } from 'react';
import axios from 'axios';

export default function FarmerHistory() {
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = () => {
    if (!phone.trim()) {
      alert('कृपया किसान का फ़ोन नंबर दर्ज करें');
      return;
    }

    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/api/history/${phone}/?region=${region}`)
      .then((res) => setHistory(res.data))
      .catch((err) => {
        console.error('Error fetching history:', err);
        setHistory({ error: 'Farmer not found' });
      })
      .finally(() => setLoading(false));
  };

  const clearHistory = () => {
    setHistory(null);
    setPhone('');
    setRegion('');
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold text-green-700 mb-2">📜 Farmer Query History</h2>

      <div className="space-y-2 mb-4">
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

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter farmer phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={fetchHistory}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            🔍 Fetch
          </button>
          <button
            onClick={clearHistory}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            🧹 Clear
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">⏳ Loading history...</p>
      )}

      {history && history.error && (
        <p className="text-red-500 mt-2">{history.error}</p>
      )}

      {history && history.history && (
        <div className="mt-4 space-y-4">
          <h3 className="font-semibold">👤 Farmer: {history.farmer}</h3>
          {history.history.map((q: any, i: number) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p><strong>📝 Query:</strong> {q.query_text}</p>
              <p><strong>💬 Response:</strong> {q.response}</p>
              <p><strong>🌿 Diagnosis:</strong> {q.diagnosis || 'N/A'}</p>
              <p><strong>🎯 Confidence:</strong> {Math.round(q.confidence * 100)}%</p>
              <p><strong>🚨 Escalated:</strong> {q.escalated ? 'Yes' : 'No'}</p>
              <p><strong>✅ Resolved:</strong> {q.resolved ? 'Yes' : 'No'}</p>
              <p><strong>👨‍🌾 Officer:</strong> {q.officer_name || 'Unassigned'}</p>
              <p><strong>⏱️ Resolution Time:</strong> {q.resolution_time ? `${q.resolution_time} hrs` : 'N/A'}</p>
              <p><strong>⭐ Feedback:</strong> {q.feedback || 'No feedback'}</p>
              <p><strong>📍 Region:</strong> {q.region || region || 'Unknown'}</p>
              <p><strong>⏰ Timestamp:</strong> {new Date(q.timestamp).toLocaleString('hi-IN')}</p>
              <p><strong>🌿 Crop:</strong> {q.metadata?.crop || 'Unknown'}</p>
              <p><strong>🗓️ Season:</strong> {q.metadata?.season || 'Unknown'}</p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
