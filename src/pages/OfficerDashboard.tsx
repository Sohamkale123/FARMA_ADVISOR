import { useEffect, useState } from 'react';
import axios from 'axios';
import AnalyticsWidget from '../components/AnalyticsWidget';
import OfficerStatsWidget from '../components/OfficerStatsWidget';
import FarmerHistory from '../components/FarmerHistory';

interface Query {
  model: string;
  pk: number;
  fields: {
    query_text: string;
    response: string;
    diagnosis: string | null;
    timestamp: string;
    escalated: boolean;
    resolved: boolean;
    resolution_note?: string;
  };
}

export default function OfficerDashboard() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<{ [key: number]: string }>({});
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/escalated/')
      .then((res: any) => {
        setQueries(res.data.escalated_queries);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error fetching queries:", err);
        setLoading(false);
      });
  }, []);

  const handleResolve = (pk: number) => {
    const note = notes[pk];
    axios.patch(`http://127.0.0.1:8000/api/query/${pk}/`, {
      resolved: true,
      resolution_note: note
    })
    .then(() => {
      alert('Query marked as resolved!');
      setQueries(prev => prev.filter(q => q.pk !== pk));
    })
    .catch(err => {
      console.error("Error resolving query:", err);
    });
  };

  const filteredQueries = queries.filter(q => {
    const diag = q.fields.diagnosis?.toLowerCase() || 'unknown';
    return filter === 'all' || diag === filter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-green-700">🧑‍🌾 Officer Dashboard</h1>

      <AnalyticsWidget />
      <OfficerStatsWidget />
      <FarmerHistory />

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-red-700">🚨 Escalated Farmer Queries</h2>

        <div className="mb-4">
          <label className="font-semibold mr-2">Filter by Diagnosis:</label>
          <select
            className="border rounded px-3 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="leaf blight">Leaf Blight</option>
            <option value="powdery mildew">Powdery Mildew</option>
            <option value="nutrient deficiency">Nutrient Deficiency</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading queries...</p>
        ) : filteredQueries.length === 0 ? (
          <p className="text-gray-600">No matching queries found.</p>
        ) : (
          <ul className="space-y-6">
            {filteredQueries.map((q) => {
              const { query_text, response, diagnosis, timestamp } = q.fields;
              return (
                <li key={q.pk} className="border border-gray-300 p-4 rounded-lg shadow-sm bg-white">
                  <p><strong>📝 Query:</strong> {query_text}</p>
                  <p><strong>💬 Response:</strong> {response}</p>
                  <p><strong>🌿 Diagnosis:</strong> {diagnosis || 'Not available'}</p>
                  <p><strong>⏰ Timestamp:</strong> {new Date(timestamp).toLocaleString()}</p>

                  <textarea
                    className="mt-4 w-full border rounded p-2"
                    placeholder="Add resolution note..."
                    value={notes[q.pk] || ''}
                    onChange={(e) => setNotes({ ...notes, [q.pk]: e.target.value })}
                  />

                  <button
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleResolve(q.pk)}
                  >
                    ✅ Mark as Resolved
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
