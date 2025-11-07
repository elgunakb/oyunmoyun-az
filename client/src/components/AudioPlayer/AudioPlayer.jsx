import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ src, autoPlay = true }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  // Avtomatik play və stop nəzarəti
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (autoPlay && src) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      audio.pause();
    };
  }, [src]);

  // Proqres yeniləməsi
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(e.target.value);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !muted;
    setMuted(newMuted);
    audio.muted = newMuted;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume === 0) setMuted(true);
    else setMuted(false);
  };

  return (
    <div className="w-full bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col gap-2">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Progress Bar */}
        <input
          type="range"
          value={progress}
          onChange={handleSeek}
          className="flex-1 mx-3 accent-orange-500 cursor-pointer"
        />

        {/* Volume */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          {muted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 accent-orange-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
