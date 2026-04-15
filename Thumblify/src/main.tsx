import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'

const GOOGLE_CLIENT_ID = "your_google_client_id_here"

createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AppProvider>
    </GoogleOAuthProvider>,
)