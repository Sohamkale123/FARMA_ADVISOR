import { useRef, useEffect, memo } from 'react';
import { Bot, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { Message } from '../App';

interface ChatInterfaceProps {
  messages: Message[];
}

export const ChatInterface = memo(({ messages }: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'farmer' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex space-x-3 max-w-[80%] ${
              message.type === 'farmer' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'farmer'
                  ? 'bg-blue-500'
                  : message.type === 'ai'
                  ? 'bg-green-500'
                  : 'bg-orange-500'
              }`}
            >
              {message.type === 'farmer' ? (
                <User className="w-6 h-6 text-white" />
              ) : (
                <Bot className="w-6 h-6 text-white" />
              )}
            </div>

            <div className={`flex flex-col ${message.type === 'farmer' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-2 rounded-lg whitespace-pre-line ${
                  message.type === 'farmer'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-sm border'
                }`}
              >
                {message.metadata?.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={message.metadata.imageUrl}
                      alt="Uploaded crop image"
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>

                {message.type === 'ai' && message.confidence !== undefined && (
                  <div className="flex items-center space-x-1">
                    {message.confidence > 0.7 ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {Math.round(message.confidence * 100)}% विश्वसनीय
                    </span>
                  </div>
                )}

                {message.escalated && (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600">अधिकारी को भेजा गया</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});
