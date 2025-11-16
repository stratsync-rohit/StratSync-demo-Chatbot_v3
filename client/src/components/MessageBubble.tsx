import React from "react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  table?: Array<Record<string, any>>;

  originalRequestPayload?: any;
  
  canSummarize?: boolean;
 
  isError?: boolean;
}

interface MessageBubbleProps {
  message: Message;

  onSummarize?: () => void;

  isSummarizing?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSummarize,
  isSummarizing,
}) => {
  
  const isUser = message.sender === "user";
  
  const summarizeDisabled = !!isSummarizing || message.canSummarize === false;
  const showSummarizeButton = !message.isError && message.canSummarize !== false;

  const renderTable = (rows: Array<Record<string, any>>) => {
    if (!rows || rows.length === 0) return null;

    
    const colSet = new Set<string>();
    rows.forEach((row) => Object.keys(row).forEach((k) => colSet.add(k)));
    const columns = Array.from(colSet);

    return (
      <div className="overflow-x-auto">
        
        <table className="min-w-min table-auto">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b sticky top-0 z-10 bg-gray-100 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2 text-sm text-gray-800 align-top border-b whitespace-nowrap"
                  >
                    {row[col] !== undefined && row[col] !== null
                      ? String(row[col])
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } items-start space-x-3`}
    >
      {!isUser && (
        <img
          src="/images/logo.jpeg"
          alt="Stratsync Logo"
          className="h-10 w-auto"
        />
      )}

      <div
        className={`${
          message.table
            ? "w-auto w-max-fits max-h-[60vh] overflow-y-auto inline-block"
            : "max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl"
        } ${isUser ? "order-first" : ""}`}
      >
       

        <div
          className={`px-4 py-30 rounded-2xl ${
          
            message.isError
              ? "bg-red-50 border border-red-200 text-red-700"
              : isUser
              ? "bg-gray-100 text-gray-900 py-2 rounded-br-md"
              : "bg-gray-100 text-gray-900 rounded-bl-md"
          }`}
        >
          {message.isError ? (
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {message.content || "No data found. Please try a different prompt."}
            </p>
          ) : message.table ? (
            
            renderTable(message.table)
          ) : (
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div
            className={`text-xs text-gray-500 ${
              isUser ? "text-right" : "text-left"
            }`}
          />

        
          {!isUser && (
            <div>
              {showSummarizeButton && (
                <button
                  onClick={onSummarize}
                  
                  disabled={summarizeDisabled}
                  className={`text-xs px-3 py-1 rounded-full border ${
                    summarizeDisabled
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-black border-cyan-500 hover:bg-cyan-50"
                  }`}
                >
                  {isSummarizing ? "Summarizing..." : "Summarize"}
                </button>
              )}

            
              {message.canSummarize === false && (
                <div className="text-sm text-red-500 mt-0.5">
                  No data found. Please try different prompt.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isUser}
    </div>
  );
};

export default MessageBubble;
