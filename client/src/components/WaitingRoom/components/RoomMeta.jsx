import React from 'react';

export default function RoomMeta() {
  // TODO: real meta backenddən gəldikcə doldur
  return (
    <section className="bg-[#0c161e] p-4 rounded-lg mb-4 max-w-lg mx-auto border border-gray-800 shadow-sm">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-left col-span-2 pb-2 border-b border-gray-700">
          <p className="text-white mb-1">Kateqoriya</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="inline-flex items-center px-2 py-1 font-semibold rounded-full text-xs  bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              Bütün kateqoriyalar
            </span>
          </div>
        </div>
        <div className="text-left p-1 rounded">
          <p className="text-white text-xs">Sual sayı</p>
          <p className="font-semibold text-gray-400">10 sual</p>
        </div>
        <div className="text-left p-1 rounded">
          <p className="text-white text-xs">Vaxt</p>
          <p className="font-semibold text-gray-400">60 saniyə</p>
        </div>
      </div>
    </section>
  );
}
