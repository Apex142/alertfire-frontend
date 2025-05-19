'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const funnyMessages = [
  "Les hamsters font tourner les serveurs...",
  "On cherche les clés de la base de données...",
  "Les pixels sont en train de se brosser les dents...",
  "On réveille les serveurs qui font la sieste...",
  "Les données font leur yoga...",
  "On attend que les 0 et les 1 se réveillent...",
  "Les serveurs font leur café...",
  "On cherche les données dans le canapé...",
  "Les serveurs font leur pause déjeuner...",
  "Le GPS est en train de se perdre...",
  "Google est en train de chercher les données...",
];

export function Loading({ message, size = 'md', className = '' }: LoadingProps) {
  const [showFunnyMessage, setShowFunnyMessage] = useState(false);
  const [funnyMessage, setFunnyMessage] = useState('');
  const currentIndexRef = useRef(0);

  useEffect(() => {
    // Premier message après 1 seconde
    const initialTimer = setTimeout(() => {
      setShowFunnyMessage(true);
      currentIndexRef.current = Math.floor(Math.random() * funnyMessages.length);
      setFunnyMessage(funnyMessages[currentIndexRef.current]);
    }, 1000);

    // Changement de message toutes les 5 secondes
    const intervalTimer = setInterval(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % funnyMessages.length;
      setFunnyMessage(funnyMessages[currentIndexRef.current]);
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []); // Plus de dépendance à funnyMessage

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center space-y-4 ${className}`}
    >
      {message && (
        <div className={`text-gray-500 ${textSize[size]}`}>
          {message}
        </div>
      )}
      {showFunnyMessage && (
        <motion.div
          key={funnyMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`text-primary/60 ${textSize[size]} italic`}
        >
          {funnyMessage}
        </motion.div>
      )}
      <div className="flex justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`${dotSize[size]} bg-primary rounded-full mx-1`}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
          className={`${dotSize[size]} bg-primary rounded-full mx-1`}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
          className={`${dotSize[size]} bg-primary rounded-full mx-1`}
        />
      </div>
    </motion.div>
  );
} 