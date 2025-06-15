import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function Stepper({
  steps,
  currentStep,
  className = "",
}: StepperProps) {
  return (
    <div className={`w-full select-none ${className}`}>
      <div className="flex items-center justify-between mb-4 relative">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center min-w-[68px]">
                <div className="relative">
                  {/* Pastille */}
                  <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors z-10
                      ${
                        isCurrent
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                          : isDone
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-gray-100 border-gray-200 text-gray-400"
                      }
                    `}
                    animate={
                      isCurrent
                        ? { scale: 1.13, boxShadow: "0 0 0 6px #3b82f620" }
                        : { scale: 1, boxShadow: "none" }
                    }
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {isDone ? (
                      <motion.svg
                        viewBox="0 0 24 24"
                        fill="none"
                        width={24}
                        height={24}
                        className="text-primary"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.07,
                          type: "spring",
                          stiffness: 300,
                        }}
                      >
                        <motion.path
                          d="M6 12l4 4 8-8"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    ) : (
                      <span className="font-bold">{idx + 1}</span>
                    )}
                  </motion.div>
                  {/* Petit halo animé */}
                  <AnimatePresence>
                    {isCurrent && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary/20 z-0"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 0.9, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.44,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                        style={{ filter: "blur(4px)" }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={`text-xs mt-2 font-medium transition-colors
                    ${
                      isCurrent
                        ? "text-primary"
                        : isDone
                        ? "text-primary/70"
                        : "text-gray-400"
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>
              {/* Trait entre les étapes */}
              {idx !== steps.length - 1 && (
                <div className="flex-1 h-1 relative flex items-center">
                  <motion.div className="w-full h-1 rounded bg-gray-200" />
                  <motion.div
                    className="absolute h-1 rounded bg-primary"
                    style={{
                      left: 0,
                      top: 0,
                      width: isDone || isCurrent ? "100%" : "0%",
                    }}
                    animate={{
                      width: isDone ? "100%" : isCurrent ? "50%" : "0%",
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar (fine ligne en dessous pour look progressif) */}
      <div className="relative h-1 mt-4">
        <div className="absolute left-0 top-0 w-full h-1 rounded bg-gray-200" />
        <motion.div
          className="absolute left-0 top-0 h-1 rounded bg-primary"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
