import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function VoteButtons({
  v,
  disablePos,
  disableNeg,
  cast,
  name,
  cat,
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Positive (like) */}
      <button
        disabled={disablePos}
        onClick={() => cast(name, cat, 'positive')}
        type="button"
        className={`flex items-center gap-1 border font-medium rounded-lg text-sm p-2.5 text-center transition-colors
          ${
            disablePos
              ? 'border-emerald-800 text-emerald-800/60 cursor-not-allowed'
              : 'text-emerald-500 border-emerald-500 hover:bg-emerald-500 hover:text-white'
          }`}
      >
        <ThumbsUp size={18} />
        <span>{v.positive || 0}</span>
      </button>

      {/* Negative (dislike) */}
      <button
        disabled={disableNeg}
        onClick={() => cast(name, cat, 'negative')}
        type="button"
        className={`flex items-center gap-1 border font-medium rounded-lg text-sm p-2.5 text-center transition-colors
          ${
            disableNeg
              ? 'border-rose-800 text-rose-800/60 cursor-not-allowed'
              : 'text-rose-500 border-rose-500 hover:bg-rose-500 hover:text-white'
          }`}
      >
        <ThumbsDown size={18} />
        <span>{v.negative || 0}</span>
      </button>
    </div>
  );
}
