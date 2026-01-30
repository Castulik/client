import { type PolozkaKosiku } from '../../../types/types';

interface Props {
  items: PolozkaKosiku[];
}

export const CartRecap = ({ items }: Props) => {
  return (
    <div style={{ background: 'white', padding: 15, borderRadius: 16, marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>Obsah košíku:</h3>
      <p style={{ color: '#666' }}>
        {items.length === 0 
          ? 'Nic tu není.' 
          : items.map(p => `${p.pocet}x ${p.nazev}`).join(', ')
        }
      </p>
    </div>
  );
};