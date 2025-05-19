import React from 'react';
import { motion } from 'framer-motion';

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Étapes */}
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center ${index <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${index <= currentStep
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-600'
                }`}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="relative mt-2">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
        <motion.div
          className="absolute top-0 left-0 h-1 bg-primary"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
} 