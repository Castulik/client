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

  // 1. ZMĚNA: Inicializace košíku z LocalStorage
  const [kosik, setKosik] = useState<PolozkaKosiku[]>(() => {
    // Pokusíme se načíst data z prohlížeče
    const ulozenaData = localStorage.getItem('nakupni_kosik');
    if (ulozenaData) {
      try {
        return JSON.parse(ulozenaData);
      } catch (e) {
        console.error("Chyba při čtení košíku", e);
        return [];
      }
    }
    // Pokud nic nemáme, vrátíme prázdné pole (už žádná testovací data)
    return [];
  });

  // 2. ZMĚNA: Automatické ukládání při každé změně
  useEffect(() => {
    localStorage.setItem('nakupni_kosik', JSON.stringify(kosik));
  }, [kosik]); // Spustí se vždy, když se změní 'kosik'

  const [databazePotravin, setDatabazePotravin] = useState<ProduktDefinice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- EFEKT: NAČTENÍ DAT ZE SUPABASE ---
  useEffect(() => {
    const fetchProdukty = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('global_products').select('*');

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

  const [upravovaneId, setUpravovaneId] = useState<string | null>(null);

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

  const editovatPolozku = (polozka: PolozkaKosiku) => {
    setUpravovaneId(polozka.id);
    const definice = databazePotravin.find(p => p.nazev === polozka.nazev);

    if (definice) {
      setVybranyProdukt(definice);
    } else {
      setVybranyProdukt({
        id: 'custom-item',
        nazev: polozka.nazev,
        icon: '✏️',
        vychoziJednotka: polozka.jednotka,
        mozneJednotky: ['ks', 'kg', 'l', 'g', 'balení'],
        stitky: []
      });
    }

    setVstup(polozka.nazev);
    setPocet(polozka.pocet);
    setJednotka(polozka.jednotka);
    setAktivniStitky(polozka.vybraneStitky);

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (vybranyProdukt.id === 'custom-item' && !upravovaneId) {
      supabase.from('user_suggestions').insert([{ nazev: vybranyProdukt.nazev }])
        .then(() => console.log('Odesláno do návrhů'));
    }

    if (upravovaneId) {
      setKosik(kosik.map(p => p.id === upravovaneId ? {
        ...p,
        pocet: pocet,
        jednotka: jednotka,
        vybraneStitky: aktivniStitky
      } : p));
    }
    else {
      const novaPolozka: PolozkaKosiku = {
        id: crypto.randomUUID(),
        nazev: vybranyProdukt.nazev,
        pocet: pocet,
        jednotka: jednotka,
        vybraneStitky: aktivniStitky
      };
      setKosik([...kosik, novaPolozka]);
    }

    ResetFormulare();
  }

  const ResetFormulare = () => {
    setVstup('');
    setVybranyProdukt(null);
    setAktivniStitky([]);
    setPocet(1);
    setJednotka('ks');
    setUpravovaneId(null);
  }

  const smazPolozku = (id: string) => {
    setKosik(kosik.filter(p => p.id !== id));
    if (upravovaneId === id) ResetFormulare();
  }

  const jitNaVysledky = () => navigate('/optimum', { state: { kosik: kosik } })


  // --- VZHLED (RENDER) ---
  return (
    <div className="pb-32">
      {isLoading && (
        <div className="flex justify-center p-4">
          <span className="text-gray-400 text-sm animate-pulse">Načítám databázi potravin...</span>
        </div>
      )}

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
        submitLabel={upravovaneId ? '💾 Uložit změny' : undefined}
      />

      {!isLoading && databazePotravin.length > 0 && !upravovaneId && (
        <QuickAddBar
          produkty={databazePotravin.slice(0, 8)}
          onSelect={vyberProdukt}
        />
      )}

      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
          V košíku ({kosik.length})
        </h3>
        <ShoppingList
          items={kosik}
          onDelete={smazPolozku}
          onEdit={editovatPolozku}
        />
      </div>

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