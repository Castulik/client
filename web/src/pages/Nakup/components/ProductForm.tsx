import { type ProduktDefinice } from '../../../types/types';

interface Props {
  // Stavy z rodiče
  vstup: string;
  setVstup: (v: string) => void;
  nalezeProdukty: ProduktDefinice[];
  vybranyProdukt: ProduktDefinice | null;
  
  // Funkce
  onVybratZNaspetavace: (p: ProduktDefinice) => void;
  
  // Stavy pro detail formuláře
  pocet: number;
  setPocet: (n: number) => void;
  jednotka: string;
  setJednotka: (s: string) => void;
  aktivniStitky: string[];
  toggleStitek: (s: string) => void;
  
  // Akce
  onConfirm: () => void;
  onCancel: () => void;
}

export const ProductForm = ({
  vstup, setVstup, nalezeProdukty, vybranyProdukt, onVybratZNaspetavace,
  pocet, setPocet, jednotka, setJednotka, aktivniStitky, toggleStitek,
  onConfirm, onCancel
}: Props) => {

  return (
    <div className="form-wrapper">
      <div className="search-box">
        <input
          type="text"
          placeholder="Co hledáš? (začni psát...)"
          value={vstup}
          onChange={(e) => setVstup(e.target.value)}
          className="main-input"
        />
        
        {/* Našeptávač */}
        {nalezeProdukty.length > 0 && !vybranyProdukt && (
          <div className="suggestions-dropdown">
            {nalezeProdukty.map(prod => (
              <div key={prod.id} className="suggestion-item" onClick={() => onVybratZNaspetavace(prod)}>
                {prod.icon} {prod.nazev}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {vybranyProdukt && (
        <div className="details-panel">
          {vybranyProdukt.stitky && (
            <div className="tags-container">
              <span className="tags-label">Upřesnit:</span>
              <div className="tags-list">
                {vybranyProdukt.stitky.map(stitek => (
                  <button
                    key={stitek}
                    type="button"
                    className={`tag-btn ${aktivniStitky.includes(stitek) ? 'active' : ''}`}
                    onClick={() => toggleStitek(stitek)}
                  >
                    {stitek}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="amount-row">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={pocet}
              onChange={e => setPocet(parseFloat(e.target.value))}
              className="amount-input"
            />
            <select
              value={jednotka}
              onChange={e => setJednotka(e.target.value)}
              className="unit-select"
            >
              {vybranyProdukt.mozneJednotky.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            <button onClick={onConfirm} className="confirm-add-btn">
              Vložit
            </button>

            <button onClick={onCancel} className="cancel-btn">
              Zrusit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};