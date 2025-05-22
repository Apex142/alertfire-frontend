// modal/ModalContext.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface ModalOptions {
  title?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
}

interface ModalContextValues {
  isOpen: boolean;
  modalTitle: ReactNode;
  modalContent: ReactNode;
  modalFooter: ReactNode;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValues | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<ReactNode>(null);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [modalFooter, setModalFooter] = useState<ReactNode>(null);

  const openModal = useCallback(({ title, content, footer }: ModalOptions) => {
    setModalTitle(title || null);
    setModalContent(content);
    setModalFooter(footer || null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalTitle(null);
    setModalContent(null);
    setModalFooter(null);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalTitle,
        modalContent,
        modalFooter,
        openModal,
        closeModal,
      }}
    >
      {children}

      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="modal z-50">
            <motion.div
              className="fixed inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl p-6 z-50"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {modalTitle && (
                <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
              )}
              <div className="max-h-[60vh] overflow-y-auto mb-4">
                {modalContent}
              </div>
              {modalFooter && (
                <div className="pt-2 border-t mt-4">{modalFooter}</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextValues => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
