
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { cn } from '../lib/utils';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if the prompt has been dismissed before
    const promptDismissed = localStorage.getItem('installPromptDismissed');
    
    // Only show the prompt if it hasn't been dismissed in the past 7 days
    const showPromptBasedOnTime = () => {
      if (!promptDismissed) return true;
      
      const dismissedTime = parseInt(promptDismissed, 10);
      const currentTime = new Date().getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      
      return currentTime - dismissedTime > sevenDaysInMs;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      
      // Show our custom prompt after a slight delay
      if (showPromptBasedOnTime()) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000); // Show after 2 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferred prompt
    setDeferredPrompt(null);
    dismissPrompt();
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Save the dismissal time to localStorage
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-20 sm:w-80 z-50',
            'bg-white rounded-lg shadow-xl p-4 border border-gray-200'
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Download size={20} className="text-green-500" />
              {navigator.language.includes('bn') ? 'অ্যাপ ইনস্টল করুন' : 'Install App'}
            </h3>
            <button 
              onClick={dismissPrompt}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            {navigator.language.includes('bn') 
              ? 'আপনি এই ওয়েবসাইটটি আপনার হোম স্ক্রিনে যোগ করতে পারেন এবং অফলাইনে অ্যাক্সেস করতে পারেন।'
              : 'Add this website to your home screen for quick access and offline use.'}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleInstall}
              className={cn(
                'px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2',
                'bg-green-600 text-white hover:bg-green-700 transition-colors flex-1',
                'focus:outline-none focus:ring-2 focus:ring-green-500'
              )}
            >
              <Download size={16} />
              {navigator.language.includes('bn') ? 'ইনস্টল করুন' : 'Install'}
            </button>
            
            <button
              onClick={dismissPrompt}
              className={cn(
                'px-4 py-2 rounded-md font-medium',
                'text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-gray-500'
              )}
            >
              {navigator.language.includes('bn') ? 'না, ধন্যবাদ' : 'Not now'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
