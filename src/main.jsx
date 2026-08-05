import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ArchetypesPreviewApp from './archetypes-preview/App';
import './styles.css';

const pathname = window.location.pathname;
const isPreviewArchetypesRoute = pathname === '/preview-arquetipos' || pathname.startsWith('/preview-arquetipos/');
const RootComponent = isPreviewArchetypesRoute ? ArchetypesPreviewApp : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);