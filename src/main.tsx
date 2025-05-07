
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, initInstallPrompt } from './pwa';

// Register service worker for PWA functionality
registerServiceWorker();

// Initialize install prompt functionality
initInstallPrompt();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
