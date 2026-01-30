import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './NakupPage.css'
import { type ProduktDefinice, type PolozkaKosiku } from '../../types/types'
// Import nových komponent
import { QuickAddBar } from './components/QuickAddBar'
import { ShoppingList } from './components/ShoppingList'
import { ProductForm } from './components/ProductForm'


// Tvoje "Slovník" potravin
const DATABAZE_POTRAVIN: ProduktDefinice[] = [
  { id: 'ml', nazev: 'Mléko', icon: '🥛', vychoziJednotka: 'l', mozneJednotky: ['l', 'ks (krabice)'] },
  { id: 'mas', nazev: 'Máslo', icon: '🧈', vychoziJednotka: 'ks', mozneJednotky: ['ks', 'g'] },
  { id: 'vaj', nazev: 'Vejce', icon: '🥚', vychoziJednotka: 'ks', mozneJednotky: ['ks', 'balení (10ks)', 'plato (30ks)'] },
  { id: 'roh', nazev: 'Rohlík', icon: '🥐', vychoziJednotka: 'ks', mozneJednotky: ['ks'] },
  { id: 'chl', nazev: 'Chleba', icon: '🍞', vychoziJednotka: 'ks', mozneJednotky: ['ks', 'půlka'] },
  { id: 'jog', nazev: 'Jogurt', icon: '🥣', vychoziJednotka: 'ks', mozneJednotky: ['ks', 'g'], stitky: ['Bílý', 'Jahodový', 'Řecký', 'Čokoládový', 'Nízkotučný'] },
  { id: 'sun', nazev: 'Šunka', icon: '🍖', vychoziJednotka: 'g', mozneJednotky: ['g', 'kg', 'balení'], stitky: ['Vepřová', 'Krůtí', 'Dětská', 'Nejvyšší jakosti'] },
  { id: 'syr', nazev: 'Sýr', icon: '🧀', vychoziJednotka: 'g', mozneJednotky: ['g', 'plátky (bal)', 'blok'], stitky: ['Eidam', 'Gouda', 'Čedar', 'Mozzarella'] },
  { id: 'vlo', nazev: 'Vločky', icon: '🌾', vychoziJednotka: 'g', mozneJednotky: ['g', 'kg', 'balení'], stitky: ['Ovesné', 'Špaldové', 'Jemné'] },
]

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

  // Stavy formuláře
  const [vstup, setVstup] = useState('')
  const [nalezeProdukty, setNalezeProdukty] = useState<ProduktDefinice[]>([])
  const [vybranyProdukt, setVybranyProdukt] = useState<ProduktDefinice | null>(null)

  // Detail produktu
  const [pocet, setPocet] = useState(1)
  const [jednotka, setJednotka] = useState('ks')
  const [aktivniStitky, setAktivniStitky] = useState<string[]>([])

  // --- EFEKTY ---
  useEffect(() => {
    if (vstup.trim() === '') {
      setNalezeProdukty([])
      if (!vybranyProdukt) return // Jen pokud nic nevybráno
    }
    const nalezene = DATABAZE_POTRAVIN.filter(p =>
      p.nazev.toLowerCase().includes(vstup.toLowerCase())
    )
    setNalezeProdukty(nalezene)
  }, [vstup])

  // --- FUNKCE ---
  const vyberProdukt = (produkt: ProduktDefinice) => {
    setVybranyProdukt(produkt)
    setVstup(produkt.nazev)
    setJednotka(produkt.vychoziJednotka)
    setPocet(1)
    setAktivniStitky([])
    setNalezeProdukty([])
  }

  const toggleStitek = (stitek: string) => {
    if (aktivniStitky.includes(stitek)) {
      setAktivniStitky(aktivniStitky.filter(s => s !== stitek))
    } else {
      setAktivniStitky([...aktivniStitky, stitek])
    }
  }

  const pridatDoKosiku = () => {
    if (!vybranyProdukt) return
    const novaPolozka: PolozkaKosiku = {
      id: crypto.randomUUID(),
      nazev: vybranyProdukt.nazev,
      pocet: pocet,
      jednotka: jednotka,
      vybraneStitky: aktivniStitky
    }
    setKosik([...kosik, novaPolozka])
    ResetFormulare()
  }

  const ResetFormulare = () => {
    setVstup(''); setVybranyProdukt(null); setAktivniStitky([]); setPocet(1); setJednotka('ks');
  }

  const smazPolozku = (id: string) => setKosik(kosik.filter(p => p.id !== id))

  const jitNaVysledky = () => navigate('/optimum', { state: { kosik: kosik } })


  // --- VZHLED (RENDER) ---
  return (
    <div className="home-container">

      {/* 1. Komponenta Formuláře */}
      <ProductForm
        vstup={vstup} setVstup={setVstup}
        nalezeProdukty={nalezeProdukty}
        vybranyProdukt={vybranyProdukt}
        onVybratZNaspetavace={vyberProdukt}
        pocet={pocet} setPocet={setPocet}
        jednotka={jednotka} setJednotka={setJednotka}
        aktivniStitky={aktivniStitky} toggleStitek={toggleStitek}
        onConfirm={pridatDoKosiku}
        onCancel={ResetFormulare}
      />

      {/* 2. Komponenta Rychlého výběru */}
      <QuickAddBar
        produkty={DATABAZE_POTRAVIN.slice(0, 5)}
        onSelect={vyberProdukt}
      />

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