import React from 'react';
import { Wheat, BarChart3, MessageCircle, User } from 'lucide-react';

interface HeaderProps {
  currentView: 'chat' | 'dashboard';
  onViewChange: (view: 'chat' | 'dashboard') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-md border-b-4 border-green-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-3 rounded-full">
              <Wheat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Digital Krishi Officer</h1>
              <p className="text-green-600 font-medium">डिजिटल कृषि अधिकारी</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="flex space-x-2">
              <button
                onClick={() => onViewChange('chat')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'chat'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">सलाह लें</span>
              </button>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">डैशबोर्ड</span>
              </button>
            </nav>

            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">किसान जी</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}