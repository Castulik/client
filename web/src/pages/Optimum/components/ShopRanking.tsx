import { ChevronDown, ChevronUp } from 'lucide-react';
import { type VysledekObchodu } from '../../../types/types';

interface Props {
  results: VysledekObchodu[];
  totalItemsCount: number;
  expandedIndex: number | null;
  onToggle: (index: number) => void;
}

export const ShopRanking = ({ results, totalItemsCount, expandedIndex, onToggle }: Props) => {
  return (
    <div className="results-container">
      {results.map((obchod, index) => {
        const isWinner = index === 0;
        const isExpanded = expandedIndex === index;

        return (
          <div key={index}
            onClick={() => onToggle(index)}
            className={`shop-card ${isWinner ? 'winner' : ''}`}
            style={{
              border: isWinner ? '2px solid #10b981' : '1px solid #eee',
              borderRadius: '12px',
              background: isWinner ? '#ecfdf5' : 'white',
              marginBottom: '15px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>

            {/* Hlavička karty */}
            <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ color: '#666' }}>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{obchod.nazevObchodu}</h3>
                  <small style={{ color: '#666' }}>
                    {obchod.pocetNalezenychPolozek}/{totalItemsCount} položek
                  </small>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#1f2937' }}>
                  {obchod.celkovaCena.toFixed(0)} Kč
                </div>
              </div>
            </div>

            {/* Detail rozbalení */}
            {isExpanded && (
              <div className="shop-detail-list">
                <div className="detail-header-row">
                  <span>Položka</span>
                  <span>Cena</span>
                </div>
                {obchod.detailNakupu.map((polozka, i) => (
                  <div key={i} className="detail-item-row">
                    <div className="detail-item-name">
                      <span style={{ fontWeight: 600 }}>{polozka.pocet}x {polozka.nazevZbozi}</span>
                      <br />
                      <span style={{ fontSize: 11, color: '#888' }}>
                        ({polozka.produktVDB.name})
                      </span>
                    </div>
                    <div className="detail-item-price">
                      {polozka.celkemZaPolozku.toFixed(2)} Kč
                    </div>
                  </div>
                ))}
                {obchod.chybejiciPolozky.length > 0 && (
                  <div className="missing-items-box">
                    <strong>Nenašli jsme:</strong> {obchod.chybejiciPolozky.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};