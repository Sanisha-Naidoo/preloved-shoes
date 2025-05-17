
import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4 text-center">
      <div>
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
        <p className="mb-2">{error}</p>
        <p className="text-sm text-gray-300">Using mock code scanner...</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
