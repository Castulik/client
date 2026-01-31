import { useMemo } from 'react';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { type PolozkaKosiku } from '../../../types/types'; 
import { spocitatCenyProObchody } from '../../../utils/ceny';

interface UlozeneJidlo {
  id: string;
  nazev: string;
  emoji: string;
  ingredience: PolozkaKosiku[];
}

interface Props {
  jidlo: UlozeneJidlo;
  onBuy: (jidlo: UlozeneJidlo) => void;
}

export const MealCard = ({ jidlo, onBuy }: Props) => {
  // Optimalizace: Výpočet ceny se provede jen když se změní ingredience
  const top3Obchody = useMemo(() => {
    const vysledky = spocitatCenyProObchody(jidlo.ingredience);
    return vysledky.slice(0, 3);
  }, [jidlo.ingredience]);

  return (
    <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm border border-gray-100">
      
      {/* Horní část: Název a ingredience */}
      <div className="flex gap-4 items-start mb-4">
        {/* Ikona */}
        <div className="text-3xl bg-gray-100 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">
          {jidlo.emoji}
        </div>
        
        {/* Texty */}
        <div>
          <h3 className="text-lg font-semibold mb-1 text-gray-800 leading-none">
            {jidlo.nazev}
          </h3>
          <p className="text-sm text-gray-500 leading-snug">
            {jidlo.ingredience.map(i => i.nazev).join(', ')}
          </p>
        </div>
      </div>

      {/* Divider (vytažený do krajů pomocí negativního marginu) */}
      <div className="h-px bg-gray-100 -mx-4 mb-4"></div>

      {/* Dolní část: 3 Nejlepší ceny */}
      <div className="mb-4">
        <span className="block text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wide">
          TOP Ceny dnes:
        </span>
        
        <div className="flex gap-2">
          {top3Obchody.map((obchod, index) => {
            const isWinner = index === 0;
            return (
              <div 
                key={obchod.nazevObchodu} 
                className={`flex-1 border rounded-lg py-2 px-1 flex flex-col items-center justify-center transition-colors
                  ${isWinner 
                    ? 'bg-green-50 border-green-400 text-green-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
              >
                 <span className="text-[10px] uppercase font-bold mb-0.5">
                    {obchod.nazevObchodu}
                 </span>
                 <span className={`text-sm font-extrabold ${isWinner ? 'text-green-700' : 'text-gray-800'}`}>
                    {obchod.celkovaCena.toFixed(0)} Kč
                 </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tlačítko akce */}
      <button 
        className="w-full bg-white border border-gray-200 p-3 rounded-xl text-gray-800 font-semibold flex items-center justify-between hover:bg-gray-50 active:scale-[0.98] transition-all" 
        onClick={() => onBuy(jidlo)}
      >
        <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary"/>
            <span>Koupit tento recept</span>
        </div>
        <ChevronRight size={18} className="text-gray-400"/>
      </button>

    </div>
  );
};