import { type PolozkaKosiku } from '../../../types/types';
import { ShoppingBag } from 'lucide-react';

interface Props {
  items: PolozkaKosiku[];
}

export const CartRecap = ({ items }: Props) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag size={18} className="text-gray-400" />
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          Obsah košíku
        </h3>
      </div>
      
      <p className="text-gray-500 text-sm leading-relaxed">
        {items.length === 0 
          ? 'Nic tu není.' 
          : items.map(p => `${p.pocet}x ${p.nazev}`).join(', ')
        }
      </p>
    </div>
  );
};