import { type PolozkaKosiku } from '../../../types/types';
import { Trash2 } from 'lucide-react';

interface Props {
  items: PolozkaKosiku[];
  onDelete: (id: string) => void;
}

export const ShoppingList = ({ items, onDelete }: Props) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 bg-white/50 rounded-2xl border border-dashed border-gray-200">
        <p>Košík zeje prázdnotou...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {items.map((polozka) => (
        <div key={polozka.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
          
          {/* Levá část: Název a štítky */}
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-gray-800 text-[15px] leading-tight">
              {polozka.nazev}
            </span>
            {polozka.vybraneStitky.length > 0 && (
              <span className="text-[11px] text-gray-500">
                {polozka.vybraneStitky.join(', ')}
              </span>
            )}
          </div>

          {/* Pravá část: Množství a smazat */}
          <div className="flex items-center gap-3">
            <span className="bg-blue-50 text-primary font-bold px-2 py-1 rounded-md text-xs whitespace-nowrap">
              {polozka.pocet} {polozka.jednotka}
            </span>
            
            <button 
              onClick={() => onDelete(polozka.id)} 
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
            >
              <Trash2 size={18} />
            </button>
          </div>

        </div>
      ))}
    </div>
  );
};