import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import './debug/devOverlay'

console.log('[BOOT] main.jsx loaded');

// Initialize theme immediately to prevent flash
(function initTheme() {
  const stored = localStorage.getItem('theme');
  const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
})();
const rootEl = document.getElementById('root');
if(!rootEl){ 
  console.error('[BOOT] No #root element found');
  window.__DEV_OVERLAY__?.show('Mount error','No #root element in index.html'); 
  throw new Error('No #root'); 
}

try {
  console.log('[BOOT] Creating React root...');
  const root = ReactDOM.createRoot(rootEl);
  console.log('[BOOT] Rendering App component...');
  root.render(<React.StrictMode><App/></React.StrictMode>);
  window.__APP_MOUNTED__ = true;
  console.log('[BOOT] App mounted OK');
} catch (e) {
  console.error('[BOOT] Render error:', e);
  window.__DEV_OVERLAY__?.show('Render error', String(e));
  throw e;
}
