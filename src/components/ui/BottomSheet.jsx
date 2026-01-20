import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomSheet = ({ children, onClose, isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 card-bg rounded-t-[2rem] shadow-2xl overflow-hidden pb-safe flex flex-col max-h-[85vh]"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing" onClick={onClose} >
                            <div className="w-12 h-1.5 bg-gray-300/50 rounded-full" />
                        </div>

                        {/* Content (Scrollable) */}
                        <div className="overflow-y-auto px-6 pb-8 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
