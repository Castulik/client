import { type PolozkaKosiku } from '../../../types/types';

interface Props {
  items: PolozkaKosiku[];
  onDelete: (id: string) => void;
}

export const ShoppingList = ({ items, onDelete }: Props) => {
  if (items.length === 0) {
    return <p className="empty-msg">Košík zeje prázdnotou...</p>;
  }

  return (
    <div className="list-container">
      {items.map((polozka) => (
        <div key={polozka.id} className="item-row">
          <div className="item-info">
            <span className="item-name">
              {polozka.nazev}
              {polozka.vybraneStitky.length > 0 && (
                <span className="item-tags"> ({polozka.vybraneStitky.join(', ')})</span>
              )}
            </span>
          </div>
          <div className="item-right">
            <span className="item-amount">{polozka.pocet} {polozka.jednotka}</span>
            <button onClick={() => onDelete(polozka.id)} className="delete-btn">❌</button>
          </div>
        </div>
      ))}
    </div>
  );
};