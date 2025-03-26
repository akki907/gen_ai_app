import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AICompletionClientProps {
    text: string;
    speed: number;
}
const TypingEffect = ({ text="", speed = 50 }:AICompletionClientProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText((prev) => prev + text.charAt(index));
          index++;
        } else {
          clearInterval(timer);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(timer);
    }
  }, [text, speed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="whitespace-pre-wrap"
    >
      {displayedText}
      {!isComplete && (
        <motion.span 
          animate={{ opacity: [1, 0] }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className="inline-block w-1.5 h-5 bg-primary ml-1"
        />
      )}
    </motion.div>
  );
};

export default TypingEffect;