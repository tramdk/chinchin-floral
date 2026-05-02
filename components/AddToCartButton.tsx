import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, Package, ShoppingCart } from 'lucide-react';

export const AddToCartButton = ({ onClick, className }: { onClick: () => void, className?: string }) => {
  const [status, setStatus] = useState<'idle' | 'dropping' | 'sliding' | 'success'>('idle');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== 'idle') return;
    
    // Trigger external onClick (e.g. adding to actual cart context)
    onClick();
    
    // Start Animation Sequence
    setStatus('dropping');
    
    setTimeout(() => {
      setStatus('sliding');
    }, 400); // Box finishes dropping
    
    setTimeout(() => {
      setStatus('success');
    }, 800); // Cart finishes sliding away
    
    setTimeout(() => {
      setStatus('idle');
    }, 2500); // Reset back to default after reading "Added"
  };

  const isGreen = status === 'success';

  return (
    <motion.button
      onClick={handleClick}
      className={`relative overflow-hidden flex items-center justify-center transition-colors duration-500 ${className} ${
        isGreen ? '!bg-emerald-500 !text-white hover:!bg-emerald-600' : ''
      }`}
      whileHover={status === 'idle' ? { y: -4 } : {}}
      whileTap={status === 'idle' ? { scale: 0.95 } : {}}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        
        {/* State: IDLE */}
        <AnimatePresence>
          {status === 'idle' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center gap-3"
            >
              <ShoppingCart size={20} />
              <span>THÊM VÀO GIỎ</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State: DROPPING & SLIDING (The Animation) */}
        {(status === 'dropping' || status === 'sliding') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={status === 'sliding' ? { x: 150, opacity: 0 } : { x: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeIn" }}
              className="relative flex items-center justify-center"
            >
              {/* Dropping Box */}
              <motion.div
                initial={{ y: -30, opacity: 0, scale: 0.5 }}
                animate={{ y: -5, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute z-10"
              >
                <Package size={14} className="text-white fill-white/20" />
              </motion.div>
              
              {/* Cart waiting to catch */}
              <ShoppingCart size={24} className="text-white mt-2" />
            </motion.div>
          </div>
        )}

        {/* State: SUCCESS */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center gap-2 font-bold"
            >
              <Check size={20} strokeWidth={3} />
              <span>ĐÃ THÊM THÀNH CÔNG</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.button>
  );
};
