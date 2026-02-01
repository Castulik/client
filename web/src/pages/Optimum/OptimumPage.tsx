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
            // Cena za měrnou jednotku (např. za 1 roli, 1 litr)
            const unitPrice = parseFloat(row.current_price_per_unit) || 0;

            // Pokusíme se zjistit cenu za balení (shelf_price)
            // A) Máme ji v DB? Použijeme ji.
            // B) Nemáme? Použijeme unitPrice (a doufáme, že to algorimus v ceny.ts dopočítá přes regex)
            const shelfPrice = row.shelf_price ? parseFloat(row.shelf_price) : unitPrice;

            // Pokusíme se zjistit velikost balení (amount)
            const amount = row.amount ? parseFloat(row.amount) : 1;

            return {
                id: String(row.id),
                name: row.name,
                shop: row.shop,
                category: row.category || 'Neurčeno',

                // OPRAVENO: Pokud v DB existuje shelf_price, použijeme ji. 
                // Jinak tam zatím dáme unitPrice, ale algoritmus v ceny.ts to pozná a zkusí dopočítat.
                shelf_price: shelfPrice,

                current_price_per_unit: unitPrice,
                regular_price_per_unit: parseFloat(row.regular_price_per_unit) || 0,

                discount_percent: parseFloat(row.discount_percent) || 0,

                deal_score: row.deal_score || 0,

                // OPRAVENO: Bereme množství z DB, pokud existuje. Jinak 1.
                amount: amount,

                // Jednotka - ideálně by měla být taky v DB (např. 'l', 'kg', 'ks')
                unit: row.unit || 'ks'
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