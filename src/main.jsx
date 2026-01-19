import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// import AdminClientUI from "./Test/AdminClientUI";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
{/* <AdminClientUI/> */}
  </StrictMode>,
)
