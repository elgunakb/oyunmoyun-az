// src/pages/Auth/AuthCallback.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [err, setErr] = useState('');
  const ran = useRef(false); // StrictMode üçün qoruma

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token)
          throw new Error('Supabase session not found');

        const { data } = await axiosInstance.post(API_PATHS.AUTH.GOOGLE, {
          access_token: session.access_token,
        });

        await login(data);
        const to = location.state?.from?.pathname || '/';
        navigate(to, { replace: true });
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || 'Auth error');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
      {err && <p className="mt-4 text-red-500 text-sm">{err}</p>}
    </div>
  );
}
