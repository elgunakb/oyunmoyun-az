import { AlertCircle, Loader, User } from 'lucide-react';
import React, { useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    nickname: '',
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4">
      <div className="bg-[#212121] p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-2">
            Hesab yaradın
          </h2>
        </div>

        {/* sign in with google  */}
        <div className="mb-2">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-transparent border border-gray-700 rounded-xl hover:bg-gray-800 text-white font-medium mb-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              class="inline"
              viewBox="0 0 512 512"
            >
              <path
                fill="#fbbd00"
                d="M120 256c0-25.367 6.989-49.13 19.131-69.477v-86.308H52.823C18.568 144.703 0 198.922 0 256s18.568 111.297 52.823 155.785h86.308v-86.308C126.989 305.13 120 281.367 120 256z"
                data-original="#fbbd00"
              />
              <path
                fill="#0f9d58"
                d="m256 392-60 60 60 60c57.079 0 111.297-18.568 155.785-52.823v-86.216h-86.216C305.044 385.147 281.181 392 256 392z"
                data-original="#0f9d58"
              />
              <path
                fill="#31aa52"
                d="m139.131 325.477-86.308 86.308a260.085 260.085 0 0 0 22.158 25.235C123.333 485.371 187.62 512 256 512V392c-49.624 0-93.117-26.72-116.869-66.523z"
                data-original="#31aa52"
              />
              <path
                fill="#3c79e6"
                d="M512 256a258.24 258.24 0 0 0-4.192-46.377l-2.251-12.299H256v120h121.452a135.385 135.385 0 0 1-51.884 55.638l86.216 86.216a260.085 260.085 0 0 0 25.235-22.158C485.371 388.667 512 324.38 512 256z"
                data-original="#3c79e6"
              />
              <path
                fill="#cf2d48"
                d="m352.167 159.833 10.606 10.606 84.853-84.852-10.606-10.606C388.668 26.629 324.381 0 256 0l-60 60 60 60c36.326 0 70.479 14.146 96.167 39.833z"
                data-original="#cf2d48"
              />
              <path
                fill="#eb4132"
                d="M256 120V0C187.62 0 123.333 26.629 74.98 74.98a259.849 259.849 0 0 0-22.158 25.235l86.308 86.308C162.883 146.72 206.376 120 256 120z"
                data-original="#eb4132"
              />
            </svg>
            Google ilə giriş edin
          </button>
        </div>

        {/* or */}
        <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
          <p className="mx-4 text-center text-white">Və ya</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* nickname */}
          <div>
            <label className="block text-sm font-medium bg-transparent mb-2 text-white">
              Ləqəb *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-4 text-white rounded-lg border-gray-700 border ${
                  formState.errors.nickname
                    ? 'border-red-500'
                    : 'border-gray-300'
                } focus:outline-none focus:ring-0 focus:border-gray-700 transition-colors`}
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {formState.errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formState.loading || formData.nickname.trim().length < 3}
            className="w-full text- bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {formState.loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Hesab yaradılır...</span>
              </>
            ) : (
              <span>Hesab yaradın</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
