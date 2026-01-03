import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from 'lucide-react';

export function WeatherWidget() {
  // Simulated weather data
  const weatherData = {
    location: 'दिल्ली',
    temperature: 28,
    condition: 'partly-cloudy',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'आज', temp: 28, condition: 'sunny', rain: 10 },
      { day: 'कल', temp: 26, condition: 'cloudy', rain: 60 },
      { day: 'परसों', temp: 24, condition: 'rainy', rain: 80 }
    ]
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Cloud className="w-5 h-5 mr-2 text-blue-500" />
        मौसम पूर्वानुमान
      </h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{weatherData.location}</span>
          <span className="text-2xl font-bold text-gray-800">{weatherData.temperature}°C</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">नमी: {weatherData.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">हवा: {weatherData.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">3 दिन का पूर्वानुमान</h4>
        {weatherData.forecast.map((day, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getWeatherIcon(day.condition)}
              <span className="font-medium text-gray-700">{day.day}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-blue-600">{day.rain}% बारिश</span>
              <span className="font-medium text-gray-800">{day.temp}°C</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
        <p className="text-sm text-green-700">
          <strong>सुझाव:</strong> कल बारिश की संभावना है। फसल में दवा का छिड़काव आज ही करें।
        </p>
      </div>
    </div>
  );
}