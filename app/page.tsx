'use client';

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [darkMode, setDarkMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Handle theme toggle
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit();
      }
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-white dark:bg-gray-900">
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full dark:bg-gray-700"
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 text-yellow-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m4.243-3.243l.707-.707M4.95 4.95l.707.707M21 12h-1M4 12H3m3.243 4.243l.707.707M18.95 18.95l.707-.707"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 text-gray-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m4.243-3.243l.707-.707M4.95 4.95l.707.707M21 12h-1M4 12H3m3.243 4.243l.707.707M18.95 18.95l.707-.707"
            />
          </svg>
        )}
      </button>

      <div className="flex flex-col space-y-4 w-full max-w-4xl overflow-y-auto py-8 px-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "user" && (
              <div className="max-w-sm p-4 rounded-2xl bg-gray-200 text-black dark:bg-gray-800 dark:text-white">
                {m.content}
              </div>
            )}
            {m.role === "assistant" && (
              <div className="w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return !inline ? (
                        <div className="p-4 bg-gray-100 rounded-lg shadow-inner dark:bg-gray-700">
                          <pre>
                            <code {...props} className="text-sm text-gray-800 dark:text-gray-200">
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code className="bg-gray-200 px-1 rounded text-sm dark:bg-gray-600 dark:text-gray-600">
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2 text-black dark:text-white">{children}</p>;
                    },
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full max-w-4xl p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center bg-gray-100 border border-gray-300 rounded-3xl px-4 py-2 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <textarea
            ref={textareaRef}
            className="w-full resize-none bg-transparent outline-none text-black placeholder-gray-500 dark:text-white dark:placeholder-gray-400"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaInput}  // Adjust the height as the user types
            placeholder="Send a message..."
            rows={1}  // This allows the textarea to start with 1 row
          />
          <button
            type="submit"
            className="ml-4 text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}