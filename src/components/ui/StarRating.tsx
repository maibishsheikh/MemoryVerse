'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  stars: 1 | 2 | 3;
  size?: number;
  className?: string;
}

export default function StarRating({
  stars,
  size = 48,
  className = '',
}: StarRatingProps) {
  const starElements = [1, 2, 3];

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {starElements.map((i) => {
        const isEarned = i <= stars;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{
              scale: isEarned ? 1 : 0.7,
              rotate: 0,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
              delay: i * 0.25,
            }}
          >
            <motion.svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className="drop-shadow-md"
              animate={
                isEarned
                  ? {
                      filter: [
                        'drop-shadow(0 0 4px rgba(255, 200, 92, 0.3))',
                        'drop-shadow(0 0 12px rgba(255, 200, 92, 0.7))',
                        'drop-shadow(0 0 4px rgba(255, 200, 92, 0.3))',
                      ],
                    }
                  : {}
              }
              transition={isEarned ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={isEarned ? '#FFC85C' : 'rgba(210, 195, 238, 0.3)'}
                stroke={isEarned ? '#E8AC2E' : 'rgba(210, 195, 238, 0.5)'}
                strokeWidth="1"
                strokeLinejoin="round"
              />
              {isEarned && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="url(#starShine)"
                  opacity="0.3"
                />
              )}
              <defs>
                <linearGradient id="starShine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="white" stopOpacity="0" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </motion.svg>
          </motion.div>
        );
      })}
    </div>
  );
}
