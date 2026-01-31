import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { type VysledekObchodu, type VysledekHledani, type PolozkaKosiku } from '../../types/types'
import { spocitatCenyProObchody, najitNejlepsiProduktyGlobalne } from '../../utils/ceny'

// Import komponent
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
    const [loading, setLoading] = useState(false)
    const [rozbalenyObchodIndex, setRozbalenyObchodIndex] = useState<number | null>(null);

    // EFEKTY
    useEffect(() => {
        if (kosik.length > 0) {
            spustitVypocty();
        } else {
            navigate('/');
        }
    }, []);

    const spustitVypocty = () => {
        setLoading(true);
        setTimeout(() => {
            const vysledkyObchodu = spocitatCenyProObchody(kosik);
            setZebricekObchodu(vysledkyObchodu);

            const vysledkyProd = najitNejlepsiProduktyGlobalne(kosik);
            setVysledkyProduktu(vysledkyProd);

            setLoading(false);
        }, 600);
    }

    const toggleObchod = (index: number) => {
        setRozbalenyObchodIndex(rozbalenyObchodIndex === index ? null : index);
    }

    // RENDER
    return (
        <div className="pb-24">
            
            {/* 1. Rekapitulace košíku */}
            <CartRecap items={kosik} />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <span className="text-sm font-medium animate-pulse">Počítám nejlepší ceny...</span>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    {/* 2. Žebříček obchodů */}
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

                    {/* 3. Detail produktů */}
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