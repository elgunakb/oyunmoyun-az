// src/pages/Auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
  const { login } = useAuth();
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setErr('Supabase session not found');
          return;
        }

        const { data } = await axiosInstance.post(API_PATHS.AUTH.GOOGLE, {
          access_token: session.access_token,
        });

        login(data);
        window.location.replace('/');
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || 'Auth error');
      }
    })();
  }, [login]);

  return <div className="p-6 text-white">{err || 'Signing you in...'}</div>;
}
