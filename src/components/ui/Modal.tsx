'use client';
import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function Modal({ open, onClose, children, title, className = '' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#23272F]/70 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl max-h-[90vh] md:p-6 p-4 ${className}`}
            style={{ boxShadow: '0 8px 32px 0 rgba(44, 62, 80, 0.25)' }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              className="absolute top-5 right-5 hover:cursor-pointer text-gray-400 hover:text-gray-700 text-3xl font-light"
              onClick={onClose}
              aria-label="Fermer la fenêtre modale"
            >
              &times;
            </button>
            {title && (
              <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
                {title}
              </h2>
            )}
            <div className="overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 