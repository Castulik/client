import { type ProduktDefinice } from '../../../types/types'; // Uprav cestu dle potřeby

interface Props {
  produkty: ProduktDefinice[];
  onSelect: (produkt: ProduktDefinice) => void;
}

export const QuickAddBar = ({ produkty, onSelect }: Props) => {
  return (
    <div>
      <h3>QUICK ADD</h3>
      <div className="quick-add-bar">
        {produkty.map(prod => (
          <button key={prod.id} className="quick-btn" onClick={() => onSelect(prod)}>
            <span className="quick-icon">{prod.icon}</span>
            <span className="quick-name">{prod.nazev}</span>
          </button>
        ))}
      </div>
    </div>
  );
};