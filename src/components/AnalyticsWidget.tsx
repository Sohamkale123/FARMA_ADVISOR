import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnalyticsWidget() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/stats/')
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats fetch error:", err));
  }, []);

  if (!stats) return <p className="text-gray-500">Loading analytics...</p>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
      <h2 className="text-xl font-bold text-green-700">📊 Dashboard Analytics</h2>
      <p>📈 Total Queries: {stats.total}</p>
      <p>🚨 Escalated: {stats.escalated}</p>
      <p>✅ Resolved: {stats.resolved}</p>
      <p>🎯 Avg Confidence: {stats.average_confidence}</p>
      <p>🌿 Top Diagnoses:</p>
      <ul className="list-disc ml-6">
        {stats.common_diagnoses.map((d: any, i: number) => (
          <li key={i}>{d.diagnosis || 'Unknown'} ({d.count})</li>
        ))}
      </ul>
    </div>
  );
}
