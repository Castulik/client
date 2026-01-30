import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { type VysledekObchodu, type VysledekHledani, type PolozkaKosiku } from '../../types/types'
import { spocitatCenyProSeznam, najitNejlepsiProduktyGlobalne } from '../../utils/ceny'
import './OptimumPage.css'
// Import nových komponent
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
            const vysledkyObchodu = spocitatCenyProSeznam(kosik);
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
        <div className="home-container">
            
            {/* 1. Rekapitulace košíku */}
            <CartRecap items={kosik} />

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div className="loader">⏳ Počítám nejlepší ceny...</div>
                </div>
            ) : (
                <>
                    {/* 2. Žebříček obchodů */}
                    <h2>🏆 Žebříček obchodů</h2>
                    <ShopRanking 
                        results={zebricekObchodu} 
                        totalItemsCount={kosik.length}
                        expandedIndex={rozbalenyObchodIndex}
                        onToggle={toggleObchod}
                    />

                    {/* 3. Detail produktů */}
                    <h2 style={{ marginTop: 30, marginBottom: 15 }}>🔍 Detailní srovnání cen</h2>
                    <ProductComparison results={vysledkyProduktu} />
                </>
            )}
        </div>
    )
}