import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './NakupPage.css'
import { type ProduktDefinice, type PolozkaKosiku } from '../../types/types'
import { supabase } from '../supabaseClient' // Import klienta

// Import nových komponent
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

  // Tady už není hardcoded pole, ale stav, který se naplní z DB
  const [databazePotravin, setDatabazePotravin] = useState<ProduktDefinice[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Načítání

  // --- EFEKT 1: NAČTENÍ DAT ZE SUPABASE ---
  useEffect(() => {
    const fetchProdukty = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('global_products')
        .select('*');

      if (error) {
        console.error('Chyba při načítání:', error);
      } else if (data) {
        // Musíme namapovat snake_case z DB na camelCase v TypeScriptu
        const mappedData: ProduktDefinice[] = data.map((item: any) => ({
          id: item.id,
          nazev: item.nazev,
          icon: item.icon,
          vychoziJednotka: item.vychozi_jednotka, // Pozor na podtržítko
          mozneJednotky: item.mozne_jednotky,     // Pozor na podtržítko
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
  // tato funkce se zapne pokazde kdykoliv se neco zmeni v promenne vstup
  useEffect(() => {
    if (vstup.trim() === '') {
      setnaseptavacProdukty([])
      if (!vybranyProdukt) return // Jen pokud nic nevybráno
    }
    const nalezene = databazePotravin.filter(p =>
      p.nazev.toLowerCase().includes(vstup.toLowerCase())
    )
    setnaseptavacProdukty(nalezene)
  }, [vstup, databazePotravin])

  // --- FUNKCE ---
  // vyberu item z naseptavace a tedy inicializuji vybrany produkt
  const vyberProdukt = (produkt: ProduktDefinice) => {
    setVybranyProdukt(produkt)
    setVstup(produkt.nazev)
    setJednotka(produkt.vychoziJednotka)
    setPocet(1)
    setAktivniStitky([])
    setnaseptavacProdukty([])
  }

  // 2. NOVÉ: Uživatel klikl na "Vytvořit vlastní"
  const vyberVlastni = () => {
    // Vytvoříme dočasný objekt produktu z toho, co uživatel napsal
    const novyProdukt: ProduktDefinice = {
      id: 'custom-item',        // Speciální ID
      nazev: vstup,             // Název vezmeme z inputu
      icon: '🛒',               // Dáme mu obecnou ikonku
      vychoziJednotka: 'ks',
      mozneJednotky: ['ks', 'kg', 'l', 'g', 'balení'] // Nabídneme všechny jednotky
    };

    // Tímto říkáme: "Máme vybráno!" -> Otevře se formulář a zavře se našeptávač
    setVybranyProdukt(novyProdukt);

    setnaseptavacProdukty([]);
    setJednotka('ks');
  }

  const toggleStitek = (stitek: string) => {
    // 1. KROK: Ptáme se "Už ten štítek máme?"
    if (aktivniStitky.includes(stitek)) {

      // SCÉNÁŘ A: ANO, už tam je -> Musíme ho VYHODIT (Odebrat)
      // .filter vytvoří nové pole, kde nechá všechno KROMĚ toho aktuálního štítku
      setAktivniStitky(aktivniStitky.filter(s => s !== stitek))

    } else {

      // SCÉNÁŘ B: NE, není tam -> Musíme ho PŘIDAT
      // Vezmeme staré štítky (...aktivniStitky) a přidáme k nim ten nový
      setAktivniStitky([...aktivniStitky, stitek])
    }
  }

  // 3. Odeslání do košíku (OPRAVENO)
  const pridatDoKosiku = async () => {
    if (!vybranyProdukt) return;

    // A) Pokud je to vlastní produkt -> Pošleme to do Supabase (fire & forget)
    if (vybranyProdukt.id === 'custom-item') {
      // Nemusíme čekat na await, ať to nezdržuje UI
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
    <div className="home-container">

      {/* Můžeš přidat loading stav */}
      {isLoading && <p style={{ textAlign: 'center' }}>Načítám databázi potravin...</p>}

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

      {/* Rychlá volba - zobrazíme prvních 5 z DB */}
      {!isLoading && databazePotravin.length > 0 && (
        <QuickAddBar
          produkty={databazePotravin.slice(0, 8)} // Vezmeme dynamicky prvních 5
          onSelect={vyberProdukt}
        />
      )}

      {/* 3. Komponenta Seznamu */}
      <ShoppingList
        items={kosik}
        onDelete={smazPolozku}
      />

      {/* Tlačítko akce */}
      {kosik.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button className="optimize-btn" onClick={jitNaVysledky}>
            🚀 Přejít k hledání cen
          </button>
        </div>
      )}

    </div>
  )
}