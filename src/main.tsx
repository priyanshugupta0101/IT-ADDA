import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAntiTamperProtection } from './utils/antiTamperSecurity';

// Initialize anti-tamper security immediately
initAntiTamperProtection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
