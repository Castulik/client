import { ChevronRight, ShoppingCart } from 'lucide-react';
import { type PolozkaKosiku } from '../../../types/types'; // Uprav cestu dle potřeby
import { spocitatCenyProObchody } from '../../../utils/ceny'; // Uprav cestu dle potřeby

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
  // Výpočet proběhne pro každou kartu zvlášť
  const vysledky = spocitatCenyProObchody(jidlo.ingredience);
  const top3Obchody = vysledky.slice(0, 3);

  return (
    <div className="meal-card">
      
      {/* Horní část: Název a ingredience */}
      <div className="meal-info">
        <div className="meal-icon">{jidlo.emoji}</div>
        <div>
          <h3 className="meal-title">{jidlo.nazev}</h3>
          <p className="meal-ingredients">
            {jidlo.ingredience.map(i => i.nazev).join(', ')}
          </p>
        </div>
      </div>

      <div className="divider"></div>

      {/* Dolní část: 3 Nejlepší ceny */}
      <div className="price-comparison">
        <span className="price-label">TOP Ceny dnes:</span>
        
        <div className="shops-row">
          {top3Obchody.map((obchod, index) => {
            const isWinner = index === 0;
            return (
              <div key={obchod.nazevObchodu} className={`mini-shop-price ${isWinner ? 'winner' : ''}`}>
                 <span className="shop-name">{obchod.nazevObchodu}</span>
                 <span className="shop-val">{obchod.celkovaCena.toFixed(0)} Kč</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tlačítko akce */}
      <button className="buy-meal-btn" onClick={() => onBuy(jidlo)}>
        <ShoppingCart size={16} style={{marginRight: 6}}/>
        Koupit tento recept
        <ChevronRight size={16} style={{marginLeft: 'auto'}}/>
      </button>

    </div>
  );
};