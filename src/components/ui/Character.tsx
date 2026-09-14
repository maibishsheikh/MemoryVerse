'use client';

import React from 'react';
import { CharacterName } from '@/types/lesson';
import { motion } from 'framer-motion';

interface CharacterProps {
  name: CharacterName;
  emotion?: 'happy' | 'curious' | 'thinking' | 'cheering' | 'surprised';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Character({
  name,
  emotion = 'happy',
  size = 'md',
  className = '',
}: CharacterProps) {
  if (!name) return null;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28 sm:w-36 sm:h-36',
    lg: 'w-40 h-40 sm:w-52 sm:h-52',
    xl: 'w-56 h-56 sm:w-64 sm:h-64',
  }[size];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`relative flex items-center justify-center select-none ${sizeClasses} ${className}`}
    >
      {name === 'mia' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          {/* Mia: Energetic girl with space buns and bright yellow sweater */}
          <circle cx="60" cy="60" r="54" fill="#EFF6FC" />
          {/* Hair buns */}
          <circle cx="28" cy="36" r="14" fill="#4E2E1E" />
          <circle cx="92" cy="36" r="14" fill="#4E2E1E" />
          {/* Head & Face */}
          <ellipse cx="60" cy="62" rx="34" ry="32" fill="#FCD3B6" />
          {/* Hair bangs */}
          <path d="M 28 50 Q 60 25 92 50 Q 75 42 60 44 Q 45 42 28 50 Z" fill="#4E2E1E" />
          {/* Eyes */}
          {emotion === 'thinking' ? (
            <>
              <ellipse cx="48" cy="58" rx="4" ry="2" fill="#2E2A4A" />
              <ellipse cx="72" cy="56" rx="4" ry="4" fill="#2E2A4A" />
            </>
          ) : emotion === 'curious' ? (
            <>
              <ellipse cx="48" cy="58" rx="5" ry="6" fill="#2E2A4A" />
              <ellipse cx="72" cy="56" rx="5" ry="6" fill="#2E2A4A" />
              <circle cx="50" cy="56" r="2" fill="#FFFFFF" />
              <circle cx="74" cy="54" r="2" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <ellipse cx="48" cy="58" rx="5" ry="6" fill="#2E2A4A" />
              <ellipse cx="72" cy="58" rx="5" ry="6" fill="#2E2A4A" />
              <circle cx="50" cy="56" r="2" fill="#FFFFFF" />
              <circle cx="74" cy="56" r="2" fill="#FFFFFF" />
            </>
          )}
          {/* Cheeks */}
          <circle cx="40" cy="66" r="6" fill="#FFB27A" opacity="0.6" />
          <circle cx="80" cy="66" r="6" fill="#FFB27A" opacity="0.6" />
          {/* Mouth */}
          <path
            d={
              emotion === 'thinking'
                ? "M 54 75 Q 60 72 66 74"
                : "M 50 72 Q 60 84 70 72"
            }
            stroke="#2E2A4A"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Yellow Collar */}
          <path d="M 38 92 Q 60 102 82 92 L 88 114 Q 60 120 32 114 Z" fill="#FFC85C" />
        </svg>
      )}

      {name === 'aarav' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          {/* Aarav: Funny, curly haired boy with cool blue hoodie */}
          <circle cx="60" cy="60" r="54" fill="#F3F0FB" />
          {/* Curly Hair back */}
          <circle cx="36" cy="38" r="16" fill="#2D1F1A" />
          <circle cx="60" cy="30" r="18" fill="#2D1F1A" />
          <circle cx="84" cy="38" r="16" fill="#2D1F1A" />
          {/* Face */}
          <ellipse cx="60" cy="64" rx="34" ry="32" fill="#E8B896" />
          {/* Curly bangs */}
          <circle cx="46" cy="42" r="10" fill="#2D1F1A" />
          <circle cx="64" cy="40" r="11" fill="#2D1F1A" />
          <circle cx="78" cy="44" r="9" fill="#2D1F1A" />
          {/* Eyes */}
          <ellipse cx="48" cy="62" rx="5" ry="6" fill="#2E2A4A" />
          <ellipse cx="72" cy="62" rx="5" ry="6" fill="#2E2A4A" />
          <circle cx="50" cy="60" r="2" fill="#FFFFFF" />
          <circle cx="74" cy="60" r="2" fill="#FFFFFF" />
          {/* Eyebrows */}
          <path d="M 42 54 Q 48 50 54 53" stroke="#2D1F1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 66 53 Q 72 50 78 54" stroke="#2D1F1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <circle cx="42" cy="70" r="5" fill="#FFB27A" opacity="0.6" />
          <circle cx="78" cy="70" r="5" fill="#FFB27A" opacity="0.6" />
          {/* Big smile */}
          <path d="M 48 74 Q 60 88 72 74" stroke="#2E2A4A" strokeWidth="3.5" strokeLinecap="round" fill="#FF8A80" />
          {/* Blue Hoodie */}
          <path d="M 34 94 Q 60 106 86 94 L 92 116 Q 60 120 28 116 Z" fill="#6C9BD8" />
        </svg>
      )}

      {name === 'professor_piko' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          {/* Professor Piko: Wise, playful owl-like / whimsical mentor with big round glasses */}
          <circle cx="60" cy="60" r="54" fill="#FFF5EC" />
          {/* Fluffy white/silver hair & ears */}
          <ellipse cx="32" cy="52" rx="14" ry="18" fill="#E2DCF0" />
          <ellipse cx="88" cy="52" rx="14" ry="18" fill="#E2DCF0" />
          {/* Face */}
          <ellipse cx="60" cy="62" rx="36" ry="32" fill="#F8DEC8" />
          {/* Big round glasses */}
          <circle cx="46" cy="60" r="14" fill="rgba(255,255,255,0.7)" stroke="#6C9BD8" strokeWidth="3.5" />
          <circle cx="74" cy="60" r="14" fill="rgba(255,255,255,0.7)" stroke="#6C9BD8" strokeWidth="3.5" />
          <path d="M 59 60 L 61 60" stroke="#6C9BD8" strokeWidth="4" strokeLinecap="round" />
          {/* Eyes behind glasses */}
          <ellipse cx="46" cy="60" rx="4" ry="5" fill="#2E2A4A" />
          <ellipse cx="74" cy="60" rx="4" ry="5" fill="#2E2A4A" />
          <circle cx="48" cy="58" r="1.5" fill="#FFFFFF" />
          <circle cx="76" cy="58" r="1.5" fill="#FFFFFF" />
          {/* Mustache */}
          <path d="M 44 76 Q 60 74 60 78 Q 60 74 76 76 Q 60 84 44 76 Z" fill="#E2DCF0" />
          {/* Smile */}
          <path d="M 54 82 Q 60 87 66 82" stroke="#2E2A4A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Academic Bowtie & Vest */}
          <path d="M 38 96 L 82 96 L 86 116 L 34 116 Z" fill="#B79FE0" />
          <polygon points="54,94 66,94 60,102" fill="#FFC85C" />
        </svg>
      )}

      {name === 'byte' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          {/* Byte: Cute, animated companion robot with glowing antenna */}
          <circle cx="60" cy="60" r="54" fill="#EFF6FC" />
          {/* Antenna */}
          <line x1="60" y1="26" x2="60" y2="40" stroke="#6C9BD8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="24" r="7" fill="#FFC85C" className="animate-pulse" />
          {/* Robot Head Body */}
          <rect x="30" y="40" width="60" height="50" rx="14" fill="#7BC9A0" stroke="#57A87E" strokeWidth="3" />
          {/* Screen Visor */}
          <rect x="38" y="48" width="44" height="24" rx="8" fill="#2E2A4A" />
          {/* Glowing Eyes */}
          <circle cx="48" cy="60" r="4" fill="#FFDA8F" />
          <circle cx="72" cy="60" r="4" fill="#FFDA8F" />
          {/* Cute digital smile */}
          <path d="M 56 64 Q 60 67 64 64" stroke="#FFDA8F" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Bolt ears */}
          <circle cx="27" cy="65" r="4" fill="#B79FE0" />
          <circle cx="93" cy="65" r="4" fill="#B79FE0" />
          {/* Body */}
          <rect x="42" y="93" width="36" height="20" rx="6" fill="#8FB8E8" />
          <circle cx="60" cy="103" r="4" fill="#FF8A80" />
        </svg>
      )}
    </motion.div>
  );
}
