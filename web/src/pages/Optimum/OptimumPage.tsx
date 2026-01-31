import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { type VysledekObchodu, type VysledekHledani, type PolozkaKosiku, type DbProdukt } from '../../types/types'
import { spocitatCenyProObchody, najitNejlepsiProduktyGlobalne } from '../../utils/ceny'
import { supabase } from '../supabaseClient'

import { CartRecap } from './components/CartRecap'
import { ShopRanking } from './components/ShopRanking'
import { ProductComparison } from './components/ProductComparison'

export default function OptimumPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const kosik: PolozkaKosiku[] = location.state?.kosik || [];

    // STAVY
    const [zebricekObchodu, setZebricekObchodu] = useState<VysledekObchodu[]>([])
    const [vysledkyProduktu, setVysledkyProduktu] = useState<VysledekHledani[]>([])
    const [loading, setLoading] = useState(true)
    const [rozbalenyObchodIndex, setRozbalenyObchodIndex] = useState<number | null>(null);

    useEffect(() => {
        if (kosik.length === 0) {
            navigate('/');
            return;
        }
        spustitVypoctySRealnymiDaty();
    }, []);

    const spustitVypoctySRealnymiDaty = async () => {
        setLoading(true);

        // 1. Stáhneme data ze Supabase
        const { data, error } = await supabase
            .from('products') 
            .select('*');

        if (error) {
            console.error("Chyba při stahování slev:", error);
            setLoading(false);
            return;
        }

        if (!data) {
             setLoading(false);
             return;
        }

        // 2. MAPPING (PŘEKLADAČ): Supabase DB -> Naše aplikace
        const realnaDataAkci: DbProdukt[] = data.map((row: any) => {
            // Zkusíme odhadnout cenu po slevě
            // Pokud je v DB 'current_price', bereme tu.
            const cena = parseFloat(row.current_price_per_unit) || 0;

            return {
                id: String(row.id),  // Převedeme číslo na string
                name: row.name,
                shop: row.shop,
                category: row.category || 'Neurčeno',
                
                // CENA: Převedeme string "10.73" na číslo 10.73
                shelf_price: cena, 
                current_price_per_unit: cena,
                regular_price_per_unit: parseFloat(row.regular_price_per_unit) || 0,
                
                // SLEVA: Odstraníme mínus a převedeme na číslo ("-39.0" -> 39)
                discount_percent: Math.abs(parseFloat(row.discount_percent)) || 0,
                
                deal_score: row.deal_score || 0,
                
                // TODO: V budoucnu přidej do DB sloupce 'amount' a 'unit'
                // Zatím budeme předstírat, že všechno je "1 ks"
                amount: 1, 
                unit: 'ks' 
            };
        });

        // 3. Výpočty
        setTimeout(() => {
            const vysledkyObchodu = spocitatCenyProObchody(kosik, realnaDataAkci);
            setZebricekObchodu(vysledkyObchodu);

            const vysledkyProd = najitNejlepsiProduktyGlobalne(kosik, realnaDataAkci);
            setVysledkyProduktu(vysledkyProd);

            setLoading(false);
        }, 500);
    }

    const toggleObchod = (index: number) => {
        setRozbalenyObchodIndex(rozbalenyObchodIndex === index ? null : index);
    }

    return (
        <div className="pb-24">
            <CartRecap items={kosik} />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <span className="text-sm font-medium animate-pulse">Stahuji aktuální letáky...</span>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">
                            🏆 Žebříček obchodů
                        </h2>
                        <ShopRanking 
                            results={zebricekObchodu} 
                            totalItemsCount={kosik.length}
                            expandedIndex={rozbalenyObchodIndex}
                            onToggle={toggleObchod}
                        />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 flex items-center gap-2">
                            <span>🔍</span> Detailní srovnání
                        </h2>
                        <ProductComparison results={vysledkyProduktu} />
                    </div>
                </div>
            )}
        </div>
    )
}