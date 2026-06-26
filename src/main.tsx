import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // A importação obrigatória que omitiste
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)