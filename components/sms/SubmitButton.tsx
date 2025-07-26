"use client";

import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const SubmitButton = ({
  sending,
  onStop,
}: {
  sending: boolean;
  onStop: () => void;
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sending) {
      setElapsedTime(0); // Reset when sending starts
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sending]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="relative w-full space-y-2">
      <div className="flex items-center gap-2 w-full">
        {/* Submit Button */}
        <div className="relative flex-1">
          <button
            type="submit"
            disabled={sending}
            className={`relative w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition-all duration-300 overflow-hidden ${
              sending
                ? "bg-gray-200 cursor-progress"
                : "bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                  <span className="text-gray-700">
                    Sending... Please wait, don’t close it
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send WhatsApp</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Stop Button */}
        {sending && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onStop();
            }}
            className="flex items-center justify-center py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md transition-colors duration-200 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
            Stop
          </button>
        )}
      </div>

      {/* Timer */}
      {sending && (
        <p className="text-sm text-gray-500 text-center">
          Elapsed Time: <strong>{formatTime(elapsedTime)}</strong>
        </p>
      )}
    </div>
  );
};
