import React from 'react';
import { Move } from 'lucide-react';

interface MoveModeBannerProps {
  visible: boolean;
}

export default function MoveModeBanner({ visible }: MoveModeBannerProps) {
  if (!visible) return null;
  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-6 py-2 rounded-full shadow-xl font-bold animate-pulse z-30 flex items-center gap-2 pointer-events-none">
      <Move size={20} /> MODO DE MOVIMENTAÇÃO ATIVO - CLIQUE NO CHÃO PARA POSICIONAR
    </div>
  );
}
