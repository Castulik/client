import { type VysledekHledani } from '../../../types/types';

interface Props {
  results: VysledekHledani[];
}

export const ProductComparison = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      {results.map((res, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Nadpis skupiny */}
          <h4 className="bg-gray-50 px-4 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
            {res.hledano}
          </h4>
          
          <div className="divide-y divide-gray-50">
            {res.nalezeno.map((prod, index) => {
                const isBest = index === 0;
                return (
                <div key={prod.id} className={`p-4 flex justify-between items-center ${isBest ? 'bg-emerald-50/30' : ''}`}>
                    
                    {/* Informace o produktu */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                {prod.shop}
                            </span>
                            {prod.discount_percent > 0 && (
                            <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                                -{prod.discount_percent}%
                            </span>
                            )}
                        </div>
                        <span className={`font-semibold text-[15px] ${isBest ? 'text-emerald-900' : 'text-gray-800'}`}>
                            {prod.name}
                        </span>
                    </div>

                    {/* Cena */}
                    <div className="text-right">
                        <div className={`text-base font-extrabold ${isBest ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {prod.shelf_price.toFixed(2)} Kč
                        </div>
                        <div className="text-xs text-gray-400">
                            <span>{prod.amount} {prod.unit}</span>
                            {prod.unit !== 'ks' && (
                                <span className="opacity-70 ml-1">
                                    • {prod.current_price_per_unit.toFixed(1)}/1{prod.unit}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                );
            })}
          </div>
          
          {res.nalezeno.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm italic bg-gray-50/50">
              ❌ Žádný odpovídající produkt nenalezen.
            </div>
          )}
        </div>
      ))}
    </div>
  );
};