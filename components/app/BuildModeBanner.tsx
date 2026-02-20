import React from 'react';
import { Hammer } from 'lucide-react';
import { BuildingType } from '../../types';
import { BUILDING_METADATA } from '../../constants';

interface BuildModeBannerProps {
  buildMode: BuildingType | null;
}

export default function BuildModeBanner({ buildMode }: BuildModeBannerProps) {
  if (!buildMode) return null;
  const label = BUILDING_METADATA[buildMode]?.title || buildMode.replace('_', ' ');
  return (
    <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 text-white px-6 py-2 rounded-full shadow-xl font-bold animate-pulse z-30 flex items-center gap-2 pointer-events-none ${buildMode === BuildingType.SQUAD_HQ ? 'bg-red-600' : 'bg-green-600'}`}>
      <Hammer size={20} /> CONSTRUINDO: {label} - CLIQUE NO CHÃO
    </div>
  );
}
