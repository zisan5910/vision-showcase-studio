
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
}

// Function to show install prompt as a popup
export function initInstallPrompt() {
  let deferredPrompt: any;
  
  // Create popup elements
  const createInstallPopup = () => {
    // Check if popup already exists
    if (document.getElementById('pwa-install-popup')) return;
    
    const popup = document.createElement('div');
    popup.id = 'pwa-install-popup';
    popup.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in';
    popup.style.display = 'none';
    
    const popupContent = document.createElement('div');
    popupContent.className = 'bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full animate-scale-in';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold text-slate-900 dark:text-white mb-2';
    title.textContent = 'Install App';
    
    const description = document.createElement('p');
    description.className = 'text-slate-600 dark:text-slate-300 mb-4';
    description.textContent = 'Install this application on your device for quick access and offline use.';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end gap-3';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors';
    cancelButton.textContent = 'Not Now';
    
    const installButton = document.createElement('button');
    installButton.className = 'bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition-colors';
    installButton.textContent = 'Install';
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(installButton);
    
    popupContent.appendChild(title);
    popupContent.appendChild(description);
    popupContent.appendChild(buttonContainer);
    popup.appendChild(popupContent);
    
    document.body.appendChild(popup);
    
    // Event listeners
    cancelButton.addEventListener('click', () => {
      hidePopup();
      // Store in localStorage that user dismissed the popup
      localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    });
    
    installButton.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          hidePopup();
          deferredPrompt = null;
        });
      }
    });
    
    return popup;
  };
  
  const showPopup = () => {
    const popup = document.getElementById('pwa-install-popup') || createInstallPopup();
    if (popup) {
      popup.style.display = 'flex';
    }
  };
  
  const hidePopup = () => {
    const popup = document.getElementById('pwa-install-popup');
    if (popup) {
      popup.classList.add('animate-fade-out');
      setTimeout(() => {
        popup.style.display = 'none';
        popup.classList.remove('animate-fade-out');
      }, 300);
    }
  };

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Check if user has previously dismissed the prompt
    const promptDismissed = localStorage.getItem('pwa-install-prompt-dismissed');
    
    // Only show popup if not previously dismissed
    if (!promptDismissed) {
      // Delay showing the popup for a better user experience
      setTimeout(() => {
        showPopup();
      }, 2000); // Show after 2 seconds
    }
    
    // Still make the install button in the UI available
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.classList.remove('hidden');
      
      installButton.addEventListener('click', () => {
        hidePopup();
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            installButton.classList.add('hidden');
          } else {
            console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
        });
      });
    }
  });

  // Listen for the appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hidePopup();
    const installButton = document.getElementById('install-button');
    if (installButton) installButton.classList.add('hidden');
  });
}
