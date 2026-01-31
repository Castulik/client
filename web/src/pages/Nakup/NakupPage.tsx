import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ProduktDefinice, type PolozkaKosiku } from '../../types/types'
import { supabase } from '../supabaseClient'

// Import komponent
import { QuickAddBar } from './components/QuickAddBar'
import { ShoppingList } from './components/ShoppingList'
import { ProductForm } from './components/ProductForm'

export default function NakupPage() {
  const navigate = useNavigate();

  // --- STAVY (LOGIKA) ---
  const [kosik, setKosik] = useState<PolozkaKosiku[]>([
    { id: 'test-1', nazev: 'Pivo', pocet: 10, jednotka: 'ks', vybraneStitky: [] },
    { id: 'test-2', nazev: 'Máslo', pocet: 2, jednotka: 'ks', vybraneStitky: [] },
    { id: 'test-3', nazev: 'Mléko', pocet: 4, jednotka: 'l', vybraneStitky: ['Trvanlivé'] },
    { id: 'test-4', nazev: 'Kuřecí prsa', pocet: 1, jednotka: 'kg', vybraneStitky: [] },
    { id: 'test-5', nazev: 'Tuňák', pocet: 3, jednotka: 'ks', vybraneStitky: [] }
  ])

  const [databazePotravin, setDatabazePotravin] = useState<ProduktDefinice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- EFEKT: NAČTENÍ DAT ZE SUPABASE ---
  useEffect(() => {
    const fetchProdukty = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('global_products')
        .select('*');

      if (error) {
        console.error('Chyba při načítání:', error);
      } else if (data) {
        const mappedData: ProduktDefinice[] = data.map((item: any) => ({
          id: item.id,
          nazev: item.nazev,
          icon: item.icon,
          vychoziJednotka: item.vychozi_jednotka,
          mozneJednotky: item.mozne_jednotky,
          stitky: item.stitky || []
        }));

        setDatabazePotravin(mappedData);
      }
      setIsLoading(false);
    };

    fetchProdukty();
  }, []);

  // Stavy formuláře
  const [vstup, setVstup] = useState('')
  const [naseptavacProdukty, setnaseptavacProdukty] = useState<ProduktDefinice[]>([])
  const [vybranyProdukt, setVybranyProdukt] = useState<ProduktDefinice | null>(null)

  // Detail produktu
  const [pocet, setPocet] = useState(1)
  const [jednotka, setJednotka] = useState('ks')
  const [aktivniStitky, setAktivniStitky] = useState<string[]>([])

  // --- EFEKTY ---
  useEffect(() => {
    if (vstup.trim() === '') {
      setnaseptavacProdukty([])
      if (!vybranyProdukt) return
    }
    const nalezene = databazePotravin.filter(p =>
      p.nazev.toLowerCase().includes(vstup.toLowerCase())
    )
    setnaseptavacProdukty(nalezene)
  }, [vstup, databazePotravin])

  // --- FUNKCE ---
  const vyberProdukt = (produkt: ProduktDefinice) => {
    setVybranyProdukt(produkt)
    setVstup(produkt.nazev)
    setJednotka(produkt.vychoziJednotka)
    setPocet(1)
    setAktivniStitky([])
    setnaseptavacProdukty([])
  }

  const vyberVlastni = () => {
    const novyProdukt: ProduktDefinice = {
      id: 'custom-item',
      nazev: vstup,
      icon: '🛒',
      vychoziJednotka: 'ks',
      mozneJednotky: ['ks', 'kg', 'l', 'g', 'balení']
    };

    setVybranyProdukt(novyProdukt);
    setnaseptavacProdukty([]);
    setJednotka('ks');
  }

  const toggleStitek = (stitek: string) => {
    if (aktivniStitky.includes(stitek)) {
      setAktivniStitky(aktivniStitky.filter(s => s !== stitek))
    } else {
      setAktivniStitky([...aktivniStitky, stitek])
    }
  }

  const pridatDoKosiku = async () => {
    if (!vybranyProdukt) return;

    if (vybranyProdukt.id === 'custom-item') {
      supabase.from('user_suggestions').insert([
        { nazev: vybranyProdukt.nazev }
      ]).then(() => console.log('Odesláno do návrhů'));
    }

    const novaPolozka: PolozkaKosiku = {
      id: crypto.randomUUID(),
      nazev: vybranyProdukt.nazev,
      pocet: pocet,
      jednotka: jednotka,
      vybraneStitky: aktivniStitky
    };

    setKosik([...kosik, novaPolozka]);
    ResetFormulare();
  }

  const ResetFormulare = () => {
    setVstup(''); setVybranyProdukt(null); setAktivniStitky([]); setPocet(1); setJednotka('ks');
  }

  const smazPolozku = (id: string) => setKosik(kosik.filter(p => p.id !== id))

  const jitNaVysledky = () => navigate('/optimum', { state: { kosik: kosik } })


  // --- VZHLED (RENDER) ---
  return (
    <div className="pb-32"> {/* Extra padding dole, aby tlačítko nepřekrylo poslední item */}

      {isLoading && (
        <div className="flex justify-center p-4">
          <span className="text-gray-400 text-sm animate-pulse">Načítám databázi potravin...</span>
        </div>
      )}

      {/* 1. Komponenta Formuláře */}
      <ProductForm
        vstup={vstup}
        setVstup={setVstup}
        naseptavacProdukty={naseptavacProdukty}
        vybranyProdukt={vybranyProdukt}
        onVybratZNaspetavace={vyberProdukt}
        onVybratVlastni={vyberVlastni}
        pocet={pocet}
        setPocet={setPocet}
        jednotka={jednotka}
        setJednotka={setJednotka}
        aktivniStitky={aktivniStitky}
        toggleStitek={toggleStitek}
        onConfirm={pridatDoKosiku}
        onCancel={ResetFormulare}
      />

      {/* Rychlá volba */}
      {!isLoading && databazePotravin.length > 0 && (
        <QuickAddBar
          produkty={databazePotravin.slice(0, 8)}
          onSelect={vyberProdukt}
        />
      )}

      {/* 3. Komponenta Seznamu */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
            V košíku ({kosik.length})
        </h3>
        <ShoppingList
            items={kosik}
            onDelete={smazPolozku}
        />
      </div>

      {/* Tlačítko akce - FIXNÍ DOLE */}
      {kosik.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <button 
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform" 
            onClick={jitNaVysledky}
          >
            <span>🚀 Přejít k hledání cen</span>
          </button>
        </div>
      )}

    </div>
  )
}