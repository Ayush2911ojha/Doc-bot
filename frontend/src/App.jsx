import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [input, setInput] = useState(''); 
  const [messages, setMessages] = useState([]);  
  const [isLoading, setIsLoading] = useState(false); 
  const chatRef = useRef(null); 

  
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  
  const renderResponse = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('*')) {
        return <li key={index} className="ml-4 list-disc">{line.trim().slice(2)}</li>;
      }
      return line.trim() ? <p key={index}>{line}</p> : null;
    }).filter(Boolean);
  };

  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const botMessage = {
        role: 'bot',
        content: data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'bot',
        content: `Error: ${error.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
    
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-t-xl flex items-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/387/387569.png"
            alt="Bot"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <h2 className="text-xl font-bold">Medical Chatbot</h2>
            <p className="text-sm opacity-80">Your health assistant</p>
          </div>
        </div>

        
        <div className="h-[500px] overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/387/387569.png"
                      alt="Bot"
                      className="w-8 h-8 rounded-full mr-2 mt-2"
                    />
                  )}
                  <div
                    className={`p-3 rounded-lg max-w-[70%] ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.role === 'bot' ? renderResponse(msg.content) : <p>{msg.content}</p>}
                    <span className={`text-xs block mt-1 ${msg.role === 'user' ? 'text-gray-200' : 'text-gray-500'}`}>
                      {msg.time}
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <img
                      src="https://i.ibb.co/d5b84Xw/Untitled-design.png"
                      alt="User"
                      className="w-8 h-8 rounded-full ml-2 mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center mt-20">Ask a medical question to start!</div>
          )}
          {isLoading && (
            <div className="text-gray-500 text-center italic mt-4">
              <svg
                className="animate-spin h-5 w-5 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h-8z"
                ></path>
              </svg>
              Bot is typing...
            </div>
          )}
          <div ref={chatRef} />
        </div>


        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your medical question..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue- Stuart
              disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;