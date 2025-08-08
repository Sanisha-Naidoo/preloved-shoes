
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center w-full space-x-2 text-sm font-medium text-center text-gray-500 sm:text-base">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 text-[11px] sm:text-xs font-bold transition-all duration-200",
                    isCompleted && "bg-green-600 border-green-600 text-white",
                    isCurrent && "bg-blue-600 border-blue-600 text-white",
                    isUpcoming && "border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-xs sm:text-sm font-medium transition-colors duration-200",
                    isCompleted && "text-green-600",
                    isCurrent && "text-blue-600 font-semibold",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 sm:mx-3 transition-colors duration-200",
                    isCompleted && "bg-green-600",
                    isUpcoming && "bg-gray-300"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
