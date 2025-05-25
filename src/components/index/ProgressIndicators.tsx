
import React from "react";
import { CheckCircle, Circle, Camera, FileText } from "lucide-react";

interface ProgressIndicatorsProps {
  hasShoeDetails: boolean;
  hasSolePhoto: boolean;
}

export const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({
  hasShoeDetails,
  hasSolePhoto
}) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
        {hasShoeDetails ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400" />
        )}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span className={`text-sm ${hasShoeDetails ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
            Shoe Details {hasShoeDetails ? 'Complete' : 'Required'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
        {hasSolePhoto ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400" />
        )}
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-gray-600" />
          <span className={`text-sm ${hasSolePhoto ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
            Sole Photo {hasSolePhoto ? 'Complete' : 'Required'}
          </span>
        </div>
      </div>
    </div>
  );
};
