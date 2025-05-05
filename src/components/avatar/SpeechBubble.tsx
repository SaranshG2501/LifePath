
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  position: 'left' | 'right' | 'center';
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, position }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Typing animation effect
  useEffect(() => {
    setIsTyping(true);
    setDisplayText('');
    
    let index = 0;
    const typingInterval = setInterval(() => {
      setDisplayText((prev) => {
        if (index < text.length) {
          index++;
          return text.slice(0, index);
        }
        clearInterval(typingInterval);
        setIsTyping(false);
        return text;
      });
    }, 30); // Typing speed
    
    return () => clearInterval(typingInterval);
  }, [text]);
  
  // Set the bubble position
  const getBubbleStyle = () => {
    const baseStyle = "absolute z-20 max-w-[220px] bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-lg border-2 border-indigo-200 dark:border-indigo-900";
    
    switch (position) {
      case 'left':
        return `${baseStyle} bottom-[80%] left-[60%] speech-bubble-left`;
      case 'right':
        return `${baseStyle} bottom-[80%] right-[60%] speech-bubble-right`;
      case 'center':
        return `${baseStyle} bottom-[80%] left-1/2 -translate-x-1/2 speech-bubble-center`;
      default:
        return `${baseStyle} bottom-[80%] left-[60%] speech-bubble-left`;
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        className={getBubbleStyle()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {displayText}
          {isTyping && <span className="typing-cursor">|</span>}
        </div>
        
        <style jsx>{`
          /* Custom CSS for speech bubble tails */
          .speech-bubble-left:after {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 20%;
            border-width: 10px 10px 0;
            border-style: solid;
            border-color: rgb(199 210 254) transparent;
          }
          
          .speech-bubble-right:after {
            content: "";
            position: absolute;
            bottom: -10px;
            right: 20%;
            border-width: 10px 10px 0;
            border-style: solid;
            border-color: rgb(199 210 254) transparent;
          }
          
          .speech-bubble-center:after {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 10px 10px 0;
            border-style: solid;
            border-color: rgb(199 210 254) transparent;
          }
          
          .typing-cursor {
            animation: blink 1s infinite step-start;
          }
          
          @keyframes blink {
            50% {
              opacity: 0;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};
