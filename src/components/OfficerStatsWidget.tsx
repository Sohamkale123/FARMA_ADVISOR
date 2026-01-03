import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OfficerStatsWidget() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/officer_stats/')
      .then(res => setStats(res.data.officers))
      .catch(err => {
        console.error("Error fetching officer stats:", err);
        setStats([]);
      });
  }, []);

  if (!stats.length) return <p className="text-gray-500">Loading officer stats...</p>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
      <h2 className="text-xl font-bold text-green-700">👨‍🌾 Officer Performance</h2>
      {stats.map((officer, i) => (
        <div key={i} className="border p-3 rounded">
          <p><strong>👤 Officer:</strong> {officer.assigned_to || 'Unassigned'}</p>
          <p><strong>📋 Total Queries:</strong> {officer.total}</p>
          <p><strong>✅ Resolved:</strong> {officer.resolved}</p>
          <p><strong>🎯 Avg Confidence:</strong> {officer.avg_conf?.toFixed(2) || 'N/A'}</p>
        </div>
      ))}
    </div>
  );
}
