import React from 'react';


const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start items-start space-x-3">
       <img
          src="/images/logo.jpeg"
          alt="Stratsync Logo"
          className="h-10 w-auto"
        />
      
      <div className="max-w-xs sm:max-w-md">
        <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md">
          <div className="flex items-center space-x-1">
         
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '250ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default TypingIndicator;