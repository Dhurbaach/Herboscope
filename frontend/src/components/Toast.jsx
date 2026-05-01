import React, { useEffect } from 'react';
import { SuccessIcon, CrossIcon } from './Icons';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'from-emerald-500 to-teal-500' : type === 'error' ? 'from-rose-500 to-red-500' : 'from-cyan-500 to-blue-500';
  const Icon = type === 'success' ? SuccessIcon : null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className={`bg-gradient-to-r ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] backdrop-blur-xl border border-white/15`}>
        {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
        <span className="flex-1 font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded p-1 transition"
            aria-label="Close"
          >
            <CrossIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
