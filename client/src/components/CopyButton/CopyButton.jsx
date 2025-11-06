import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama uğursuz oldu:', err);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="relative">
        <input
          type="text"
          value={textToCopy}
          readOnly
          disabled
          className="col-span-6 bg-gray-50 border border-gray-300 text-blue-400 text-sm rounded-lg 
          focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-4 
          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 
          dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />

        <button
          onClick={handleCopy}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-400 
          hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 
          rounded-lg py-2 px-2.5 inline-flex items-center justify-center bg-white 
          border-gray-200 border h-8 transition-all"
        >
          {!copied ? (
            <span className="inline-flex items-center">
              <Clipboard className="w-3 h-3 mr-1.5" />
              <span className="text-xs font-semibold">Kopyala</span>
            </span>
          ) : (
            <span className="inline-flex items-center">
              <Check className="w-3 h-3 text-blue-700 dark:text-blue-500 mr-1.5" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-500">
                Kopyalandı
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CopyButton;
