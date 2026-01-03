import React from 'react';
import { Gift, ExternalLink, Calendar, IndianRupee } from 'lucide-react';

export function SchemeInfo() {
  const schemes = [
    {
      name: 'PM किसान योजना',
      amount: '₹6,000/वर्ष',
      deadline: '31 मार्च',
      description: 'सभी किसान परिवारों को आर्थिक सहायता',
      status: 'active'
    },
    {
      name: 'फसल बीमा योजना',
      amount: 'प्रीमियम का 2%',
      deadline: '15 जुलाई',
      description: 'प्राकृतिक आपदाओं से फसल सुरक्षा',
      status: 'active'
    },
    {
      name: 'कृषि यंत्र सब्सिडी',
      amount: '50% तक छूट',
      deadline: '30 जून',
      description: 'कृषि उपकरण खरीदने पर सब्सिडी',
      status: 'ending-soon'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Gift className="w-5 h-5 mr-2 text-orange-500" />
        सरकारी योजनाएं
      </h3>
      
      <div className="space-y-4">
        {schemes.map((scheme, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-800">{scheme.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                scheme.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {scheme.status === 'active' ? 'सक्रिय' : 'जल्दी करें'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{scheme.amount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{scheme.deadline}</span>
                </div>
              </div>
              
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors">
                <span className="text-sm">विस्तार</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <p className="text-sm text-blue-700">
          <strong>नोट:</strong> सभी योजनाओं के लिए आधार कार्ड और भूमि दस्तावेज आवश्यक हैं।
        </p>
      </div>
    </div>
  );
}