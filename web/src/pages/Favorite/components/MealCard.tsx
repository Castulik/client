import { useMemo } from 'react';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { type PolozkaKosiku, type DbProdukt } from '../../../types/types'; // Přidán DbProdukt
import { spocitatCenyProObchody } from '../../../utils/ceny';

interface UlozeneJidlo {
  id: string;
  nazev: string;
  emoji: string;
  ingredience: PolozkaKosiku[];
}

interface Props {
  jidlo: UlozeneJidlo;
  dbData: DbProdukt[]; // <--- NOVÁ PROP: Tady přitečou data ze Supabase
  onBuy: (jidlo: UlozeneJidlo) => void;
}

export const MealCard = ({ jidlo, dbData, onBuy }: Props) => {
  
  // Optimalizace: Výpočet se provede, když se změní ingredience NEBO se načtou nová data
  const top3Obchody = useMemo(() => {
    // Pokud data ještě tečou (jsou prázdná), vrátíme prázdné pole nebo fallback
    if (dbData.length === 0) return [];

    // Tady posíláme DRUHÝ PARAMETR (dbData)
    const vysledky = spocitatCenyProObchody(jidlo.ingredience, dbData);
    return vysledky.slice(0, 3);
  }, [jidlo.ingredience, dbData]);

  return (
    <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm border border-gray-100">
      
      {/* Horní část: Název a ingredience */}
      <div className="flex gap-4 items-start mb-4">
        <div className="text-3xl bg-gray-100 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">
          {jidlo.emoji}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-1 text-gray-800 leading-none">
            {jidlo.nazev}
          </h3>
          <p className="text-sm text-gray-500 leading-snug">
            {jidlo.ingredience.map(i => i.nazev).join(', ')}
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 -mx-4 mb-4"></div>

      {/* Dolní část: 3 Nejlepší ceny */}
      <div className="mb-4">
        <span className="block text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wide">
          TOP Ceny dnes:
        </span>
        
        {/* Loading stav nebo data */}
        {top3Obchody.length === 0 ? (
           <div className="text-xs text-gray-400 italic">Načítám aktuální ceny...</div>
        ) : (
            <div className="flex gap-2">
            {top3Obchody.map((obchod, index) => {
                const isWinner = index === 0;
                return (
                <div 
                    key={obchod.nazevObchodu} 
                    className={`flex-1 border rounded-lg py-2 px-1 flex flex-col items-center justify-center transition-colors
                    ${isWinner 
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                >
                    <span className="text-[10px] uppercase font-bold mb-0.5">
                        {obchod.nazevObchodu}
                    </span>
                    <span className={`text-sm font-extrabold ${isWinner ? 'text-emerald-700' : 'text-gray-800'}`}>
                        {obchod.celkovaCena.toFixed(0)} Kč
                    </span>
                </div>
                )
            })}
            </div>
        )}
      </div>

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