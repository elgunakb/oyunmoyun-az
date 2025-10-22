import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Auth/Login';
// import { AuthProvider } from './context/AuthContext';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Home/Home';
import MyProfile from './pages/MyProfile/MyProfile';
import ProtectedRoute from '../routes/ProtectedRoute';
import LandingPage from './pages/LandingPage/LandingPage';

const App = () => {
  return (
    <>
      {/* // <AuthProvider> */}
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* Login routes */}
          <Route element={<ProtectedRoute requiredRole="employer" />}>
            <Route path="/profile" element={<MyProfile />} />
          </Route>

          {/* not found page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        toastOptions={{
          className: '',
          style: {
            fontSize: '12px',
          },
        }}
      />
    </>
    // </AuthProvider>
  );
};

export default App;
