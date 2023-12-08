import React, { MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type IToggleButtonProps = {
  isActive: boolean;
  onClick: (event?: MouseEvent) => any;
  children: any;
};

export default function ToggleButton({ isActive, onClick, children }: IToggleButtonProps) {
  return (
    <AnimatePresence mode='wait'>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`${isActive ? 'bg-gradient-to-r from-[#FBAA19] to-[#ee710b] rounded-[30px] text-[#fff]' : 'bg-transparent text-[#fff]'
          } py-3 px-6 flex justify-center text-[1.2em] font-Syne font-[400]`}
        onClick={onClick}
      >
        {children}
      </motion.button>
    </AnimatePresence>
  );
}
