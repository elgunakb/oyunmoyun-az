import { AlertCircle, Loader, User } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

const Login = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({ nickname: '' });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    success: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formState.errors[name]) {
      setFormState((p) => ({ ...p, errors: { ...p.errors, [name]: '' } }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nickname = formData.nickname.trim();

    // Sadə validation
    if (nickname.length < 3) {
      setFormState((p) => ({
        ...p,
        errors: { ...p.errors, nickname: 'Minimum 3 simvol' },
      }));
      return;
    }

    setFormState((p) => ({
      ...p,
      loading: true,
      errors: { ...p.errors, submit: '' },
    }));
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.GUEST, {
        nickname,
      });
      // server { user, expires } verir
      login(data); // token yoxdur
      window.location.href = '/'; // istədiyin səhifə
    } catch (error) {
      setFormState((p) => ({
        ...p,
        errors: {
          ...p.errors,
          submit: error?.response?.data?.message || 'Qonaq girişi alınmadı',
        },
      }));
    } finally {
      setFormState((p) => ({ ...p, loading: false }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) {
        setFormState((prev) => ({
          ...prev,
          errors: { ...prev.errors, submit: error.message },
        }));
      }
    } catch (e) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, submit: e.message || 'Google login xətası' },
      }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4">
      <div className="bg-[#212121] p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-2">
            Hesab yaradın
          </h2>
        </div>

        {/* sign in with google */}
        <div className="mb-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2"
            aria-label="Sign in with Google"
          >
            {/* Google icon SVG */}
            <svg width="18" height="18" viewBox="0 0 48 48" className="mr-2">
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303C33.607 32.329 29.223 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.537 5.116 29.566 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.814C14.6 16.108 18.938 13 24 13c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.537 5.116 29.566 3 24 3 16.318 3 9.676 7.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 43c5.166 0 9.86-1.977 13.393-5.197l-6.18-5.238C29.13 34.091 26.691 35 24 35c-5.192 0-9.567-3.292-11.157-7.892l-6.54 5.036C9.63 38.73 16.274 43 24 43z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-1.008 2.927-3.162 5.229-5.79 6.565l.001.001 6.18 5.238C37.242 41.246 44 36 44 23c0-1.341-.138-2.652-.389-3.917z"
              />
            </svg>
            Google ilə daxil ol
          </button>
        </div>

        {/* or */}
        <div className="my-6 flex items-center before:flex-1 before:border-t before:border-neutral-300 after:flex-1 after:border-t after:border-neutral-300">
          <p className="mx-4 text-center text-white">Və ya</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* nickname */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Ləqəb *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-4 text-white rounded-lg border ${
                  formState.errors.nickname
                    ? 'border-red-500'
                    : 'border-gray-700'
                } focus:outline-none focus:ring-0 focus:border-gray-500 transition-colors bg-transparent placeholder-gray-400`}
                placeholder="Oyunda görsənəcək ləqəb daxil et"
              />
            </div>
            {formState.errors.nickname && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.nickname}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {formState.errors.submit && (
            <div className="bg-red-50/10 border border-red-400/50 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {formState.errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button (guest) */}
          <button
            type="submit"
            disabled={formState.loading || formData.nickname.trim().length < 3}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {formState.loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Hesab yaradılır...</span>
              </>
            ) : (
              <span>Qonaq kimi daxil ol</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
