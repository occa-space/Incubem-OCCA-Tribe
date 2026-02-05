import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-32 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
      <button onClick={onZoomIn} className="bg-slate-800 p-2 rounded-full border border-slate-600 text-white hover:bg-slate-700 shadow-lg">
        <ZoomIn size={24} />
      </button>
      <button onClick={onZoomOut} className="bg-slate-800 p-2 rounded-full border border-slate-600 text-white hover:bg-slate-700 shadow-lg">
        <ZoomOut size={24} />
      </button>
    </div>
  );
}
