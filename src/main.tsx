
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx starting...");

// Ensure React loads first before any service worker interference
const initializeApp = () => {
  try {
    const rootElement = document.getElementById("root");
    console.log("Root element found:", !!rootElement);
    
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    const root = createRoot(rootElement);
    console.log("React root created successfully");
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error in main.tsx:", error);
  }
};

// Initialize app immediately
initializeApp();

// Register service worker after React is fully loaded and running
if ('serviceWorker' in navigator) {
  // Wait for the page to be fully loaded before registering SW
  window.addEventListener('load', () => {
    // Give React time to fully initialize
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }, 1000); // 1 second delay to ensure React is stable
  });
}
