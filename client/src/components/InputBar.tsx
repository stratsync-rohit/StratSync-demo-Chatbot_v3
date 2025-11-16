import React, { useState, useRef, useEffect } from "react";
import { Loader2, MoveRight } from "lucide-react";

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  isCentered?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  isDisabled = false,
  isCentered = false,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`${
        isCentered
          ? "bg-transparent px-4 py-4"
          : "border-t border-gray-200 bg-white px-4 py-4 sm:px-6"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isCentered
                  ? "Ask anything to get started..."
                  : "Type your message to StratSync..."
              }
              disabled={isDisabled}
              rows={1}
              className={`
        w-full min-h-[56px] max-h-[120px]
        resize-none pr-14 px-6 py-3.5 text-sm sm:text-base
        border-2 focus:outline-none
        transition-all duration-300
        text-gray-900 placeholder-gray-500
        disabled:bg-gray-50 disabled:text-gray-400
        ${
          isCentered
            ? "rounded-full border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-gray-50 hover:bg-white shadow-lg"
            : "rounded-xl border-cyan-500 focus:ring-2 focus:ring-cyan-400"
        }
      `}
            />

            <button
              type="submit"
              disabled={!message.trim() || isDisabled}
              className={`
        absolute right-2.5 top-1/2 -translate-y-[55%]
        w-12 h-10 rounded-full flex items-center justify-center
        text-white transition duration-200
        ${
          !message.trim() || isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-400 to-emerald-400 hover:opacity-90 shadow-md hover:shadow-lg"
        }
      `}
            >
              {isDisabled ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MoveRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputBar;
