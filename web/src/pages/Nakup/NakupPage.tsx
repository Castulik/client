import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ProduktDefinice, type PolozkaKosiku } from '../../types/types'
import { supabase } from '../supabaseClient'
// 👇 DŮLEŽITÉ: Import nové vyhledávací funkce
import { searchProductsFuzzy } from '../../utils/ceny';

// Import komponent
import { QuickAddBar } from './components/QuickAddBar'
import { ShoppingList } from './components/ShoppingList'
import { ProductForm } from './components/ProductForm'

export default function NakupPage() {
  const navigate = useNavigate();

  // --- STAVY (LOGIKA) ---

  // 1. Inicializace košíku z LocalStorage
  const [kosik, setKosik] = useState<PolozkaKosiku[]>(() => {
    const ulozenaData = localStorage.getItem('nakupni_kosik');
    if (ulozenaData) {
      try {
        return JSON.parse(ulozenaData);
      } catch (e) {
        console.error("Chyba při čtení košíku", e);
        return [];
      }
    }
    return [];
  });

  // 2. Automatické ukládání při každé změně
  useEffect(() => {
    localStorage.setItem('nakupni_kosik', JSON.stringify(kosik));
  }, [kosik]);

  const [databazePotravin, setDatabazePotravin] = useState<ProduktDefinice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- EFEKT: NAČTENÍ DAT PRO RYCHLOU VOLBU (QuickAddBar) ---
  // Poznámka: Tohle necháváme, aby se načetly ikony pro spodní lištu,
  // ale už to nepoužíváme pro hlavní vyhledávání.
  useEffect(() => {
    const fetchProdukty = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('global_products').select('*').limit(20); // Stačí nám jich pár pro rychlou volbu

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

  // 🔥 NOVÁ LOGIKA VYHLEDÁVÁNÍ (Debounce + Supabase Fuzzy) 🔥
  useEffect(() => {
    // 1. Pokud je vstup prázdný nebo moc krátký, vyčistíme našeptávač
    if (!vstup || vstup.trim().length < 2) {
      setnaseptavacProdukty([]);
      return;
    }

    // Pokud už máme vybraný produkt a jen ho editujeme, nechceme hledat znovu
    if (vybranyProdukt && vybranyProdukt.nazev === vstup) {
        return;
    }

    // 2. Nastavíme časovač (Debounce 300ms)
    const timeoutId = setTimeout(async () => {
      console.log(`🔎 Hledám v DB výraz: "${vstup}"`);
      
      try {
        // Voláme naší novou Supabase funkci
        const vysledky = await searchProductsFuzzy(vstup);
        setnaseptavacProdukty(vysledky);
      } catch (err) {
        console.error("Chyba při hledání:", err);
      }
    }, 300);

    // 3. Cleanup: Zrušíme předchozí timer při psaní
    return () => clearTimeout(timeoutId);

  }, [vstup, vybranyProdukt]); // Sledujeme změnu vstupu


  // --- FUNKCE PRO VÝBĚR A FORMULÁŘ ---
  const vyberProdukt = (produkt: ProduktDefinice) => {
    setVybranyProdukt(produkt)
    setVstup(produkt.nazev)
    
    // Ošetření pokud jednotky chybí
    setJednotka(produkt.vychoziJednotka || 'ks')
    setPocet(1)
    setAktivniStitky([])
    setnaseptavacProdukty([]) // Skryjeme našeptávač po výběru
  }

  const vyberVlastni = () => {
    const novyProdukt: ProduktDefinice = {
      id: 'custom-item',
      nazev: vstup,
      icon: '🛒',
      vychoziJednotka: 'ks',
      mozneJednotky: ['ks', 'kg', 'l', 'g', 'balení'],
      stitky: []
    };
    setVybranyProdukt(novyProdukt);
    setnaseptavacProdukty([]);
    setJednotka('ks');
  }

  const editovatPolozku = (polozka: PolozkaKosiku) => {
    setUpravovaneId(polozka.id);
    
    // Zkusíme najít definici v tom, co máme načtené (pro rychlou volbu), 
    // ale spíš si vytvoříme "mock" objekt, protože nemáme všechna data.
    setVybranyProdukt({
        id: 'edit-item',
        nazev: polozka.nazev,
        icon: '✏️', // Nebo zkusit najít ikonu, pokud chceme být fancy
        vychoziJednotka: polozka.jednotka,
        mozneJednotky: ['ks', 'kg', 'l', 'g', 'balení'],
        stitky: []
    });

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

    // Pokud je to úplně nová vlastní věc, můžeme ji poslat do návrhů (volitelné)
    if (vybranyProdukt.id === 'custom-item' && !upravovaneId) {
       // Logika pro user_suggestions (můžeš odkomentovat, pokud chceš)
       // supabase.from('user_suggestions').insert([{ nazev: vybranyProdukt.nazev }]).then(...)
    }

    // uložení do košíku z editu
    if (upravovaneId) {
      setKosik(kosik.map(p => p.id === upravovaneId ? {
        ...p,
        nazev: vybranyProdukt.nazev, // Umožníme i přejmenování
        pocet: pocet,
        jednotka: jednotka,
        vybraneStitky: aktivniStitky
      } : p));
    }
    // uložení do košíku normálně
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
    setnaseptavacProdukty([]);
  }

  const smazPolozku = (id: string) => {
    setKosik(kosik.filter(p => p.id !== id));
    if (upravovaneId === id) ResetFormulare();
  }

  const jitNaVysledky = () => navigate('/optimum', { state: { kosik: kosik } })


  // --- VZHLED (RENDER) ---
  return (
    <div className="pb-32">
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

      {/* QuickAddBar zobrazíme jen když needitujeme a máme nějaká data */}
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