
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx starting...");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", !!rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  console.log("React root created successfully");
  
  root.render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error in main.tsx:", error);
}

// Less aggressive service worker registration to prevent React context issues
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Listen for updates but don't force immediate reloads
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker available, will activate on next navigation');
                // Don't force immediate activation to prevent React context loss
              }
            });
          }
        });
        
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
