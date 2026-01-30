import { type VysledekHledani } from '../../../types/types';

interface Props {
  results: VysledekHledani[];
}

export const ProductComparison = ({ results }: Props) => {
  return (
    <div>
      {results.map((res, i) => (
        <div key={i} className="result-group">
          <h4 style={{
            margin: 0, padding: '12px 16px', background: '#f9fafb',
            borderBottom: '1px solid #eee', color: '#6b7280',
            textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em'
          }}>
            {res.hledano}
          </h4>
          
          {res.nalezeno.map((prod, index) => {
            const isBest = index === 0;
            return (
              <div key={prod.id} className={`product-card ${isBest ? 'best-deal' : ''}`}>
                <div className="product-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="shop-badge">{prod.shop}</span>
                    {prod.discount_percent > 0 && (
                      <span className="discount-badge">-{prod.discount_percent}%</span>
                    )}
                  </div>
                  <span className="product-name">{prod.name}</span>
                </div>
                <div className="price-box">
                  <div className="main-price">
                    {prod.shelf_price.toFixed(2)} Kč
                  </div>
                  <div className="unit-info">
                    <span>{prod.amount} {prod.unit}</span>
                    {prod.unit !== 'ks' && (
                      <span style={{ opacity: 0.8 }}> • {prod.current_price_per_unit.toFixed(1)} Kč/1{prod.unit}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {res.nalezeno.length === 0 && (
            <div style={{ padding: 15, color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>
              ❌ Žádný odpovídající produkt nenalezen.
            </div>
          )}
        </div>
      ))}
    </div>
  );
};