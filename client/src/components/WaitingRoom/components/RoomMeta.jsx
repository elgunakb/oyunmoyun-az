import React from 'react';

export default function RoomMeta({ room }) {
  return (
    <section className="bg-[#0c161e] p-4 rounded-lg mb-4 max-w-lg mx-auto border border-gray-800 shadow-sm">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-left col-span-2 pb-2 border-b border-gray-700">
          <p className="text-white mb-1">Oyun kateqoriyası</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="inline-flex items-center px-2 py-1 font-semibold rounded-full text-xs  bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              {room?.categories}
            </span>
          </div>
        </div>
        <div className="text-left p-1 rounded">
          <p className="text-white text-xs">Hərflər</p>
          <p className="font-semibold text-gray-400">
            {room?.letters?.join(', ')}
          </p>
        </div>
        <div className="text-left p-1 rounded">
          <p className="text-white text-xs">Vaxt</p>
          <p className="font-semibold text-gray-400">
            {room?.game_time} saniye
          </p>
        </div>
        <div className="text-left p-1 rounded">
          <p className="text-white text-xs">Opsiyonlar</p>
          <p className="font-semibold text-gray-400">
            {room?.options?.length
              ? room.options.join(', ').charAt(0).toUpperCase() +
                room.options.join(', ').slice(1)
              : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
