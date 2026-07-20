/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Sparkles, CheckCircle, Award, AlertCircle, X } from 'lucide-react';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'loyalty' | 'reminder' | 'review';
}

interface NotificationBannerProps {
  toast: NotificationToast | null;
  onClose: () => void;
}

export default function NotificationBanner({ toast, onClose }: NotificationBannerProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'booking':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'loyalty':
        return <Award className="h-5 w-5 text-amber-400" />;
      case 'review':
        return <Sparkles className="h-5 w-5 text-indigo-400" />;
      case 'system':
      default:
        return <Bell className="h-5 w-5 text-amber-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'booking':
        return 'bg-slate-900/95 border-emerald-500/30';
      case 'loyalty':
        return 'bg-slate-900/95 border-amber-500/30';
      case 'review':
        return 'bg-slate-900/95 border-indigo-500/30';
      default:
        return 'bg-slate-900/95 border-amber-600/30';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-full max-w-sm px-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${getBgColor()}`}
        >
          <div className="p-1.5 rounded-lg bg-white/5 shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 font-sans tracking-tight">
              {toast.title}
            </h4>
            <p className="text-xs text-slate-350 font-sans mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors shrink-0 p-1 rounded-md hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
