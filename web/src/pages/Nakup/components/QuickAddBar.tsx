import { type ProduktDefinice } from '../../../types/types';

interface Props {
  produkty: ProduktDefinice[];
  onSelect: (produkt: ProduktDefinice) => void;
}

export const QuickAddBar = ({ produkty, onSelect }: Props) => {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
        Rychlý výběr
      </h3>
      
      {/* Horizontální scroll kontejner */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
        {produkty.map(prod => (
          <button 
            key={prod.id} 
            className="snap-start shrink-0 flex flex-col items-center justify-center min-w-20 h-20 bg-white border border-gray-100 rounded-2xl shadow-sm active:scale-95 active:bg-gray-50 transition-all" 
            onClick={() => onSelect(prod)}
          >
            <span className="text-2xl mb-1 filter drop-shadow-sm">{prod.icon}</span>
            <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight px-1 truncate w-full">
              {prod.nazev}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};