import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Auth/Login';
import MyProfile from './pages/MyProfile/MyProfile';
import ProtectedRoute from '../routes/ProtectedRoute';
import GuestRoute from '../routes/GuestRoute';
import LandingPage from './pages/LandingPage/LandingPage';
import { AuthProvider } from './context/AuthContext';
import AuthCallback from './pages/Auth/AuthCallBack';
import Header from './components/Header/Header';
import WaitingRoom from './pages/WaitingRoom/WaitingRoom';
import GameRoom from './pages/Gameroom/GamerRoom';
import GameStat from './pages/GameStat/GameStat';

const App = () => {
  return (
    <>
      <AuthProvider>
        <Header />

        <Router>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Login routers */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/waiting-room/:code" element={<WaitingRoom />} />
              <Route path="/game/:code" element={<GameRoom />} />
              <Route path="/game-stat/:code" element={<GameStat />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        <Toaster
          toastOptions={{
            className: '',
            style: { fontSize: '12px' },
          }}
        />
      </AuthProvider>
    </>
  );
};

export default App;
