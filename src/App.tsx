import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { StartseitePage } from './pages/StartseitePage'
import { JournalPage } from './pages/JournalPage'
import { StatistikPage } from './pages/StatistikPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<StartseitePage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/statistik/live" element={<StatistikPage account="live" />} />
            <Route path="/statistik/propfirm" element={<StatistikPage account="propfirm" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
