import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ServerDataProvider } from './contexts/ServerDataContext';
import App from './App';
import './styles/main.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Get initial data from SSR (if available)
const initialData = typeof window !== 'undefined' && window.__INITIAL_STATE__
  ? window.__INITIAL_STATE__
  : null;

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ServerDataProvider data={initialData}>
          <App />
        </ServerDataProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);




