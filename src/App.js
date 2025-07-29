import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SoundProvider } from './contexts/SoundContext';
import { AuthProvider } from './hooks/useAuth';

// Import pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import GardenPage from './pages/GardenPage';
import LeaderboardPage from './pages/LeaderboardPage'; // CHANGED: Stats → Leaderboard
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PasswordChangeHandler from './components/PasswordResetDetector';
import FocusPage from './pages/FocusPage';


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SoundProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/garden" element={<GardenPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} /> {/* CHANGED: /stats → /leaderboard */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </SoundProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;