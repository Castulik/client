import { useState, useEffect } from 'react'
import './HomePage.css'

// 1. DATOVÝ MODEL (Tohle budeš mít později v databázi)
interface ProduktDefinice {
  id: string
  nazev: string
  icon: string
  vychoziJednotka: string
  mozneJednotky: string[]
  stitky?: string[] // Volitelné kategorie (např. druhy jogurtů)
}

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

// Položka v košíku
interface PolozkaKosiku {
  id: string
  nazev: string
  pocet: number
  jednotka: string
  vybraneStitky: string[]
}

export default function HomePage() {
  // STAVY
  const [kosik, setKosik] = useState<PolozkaKosiku[]>([])
  
  // Stavy formuláře
  const [vstup, setVstup] = useState('')
  const [nalezeProdukty, setNalezeProdukty] = useState<ProduktDefinice[]>([])
  const [vybranyProdukt, setVybranyProdukt] = useState<ProduktDefinice | null>(null)
  
  // Detaily přidávané položky
  const [pocet, setPocet] = useState(1)
  const [jednotka, setJednotka] = useState('ks')
  const [aktivniStitky, setAktivniStitky] = useState<string[]>([])

  // --- LOGIKA NAŠEPTÁVAČE ---
  useEffect(() => {
    if (vstup.trim() === '') {
      setNalezeProdukty([])
      return
    }
    // Hledáme v databázi podle názvu (ignorujeme velikost písmen)
    const nalezene = DATABAZE_POTRAVIN.filter(p => 
      p.nazev.toLowerCase().includes(vstup.toLowerCase())
    )
    setNalezeProdukty(nalezene)
  }, [vstup])

  // --- FUNKCE ---

  // 1. Uživatel klikne na našeptávač nebo Quick Add ikonu
  const vyberProdukt = (produkt: ProduktDefinice) => {
    setVybranyProdukt(produkt)
    setVstup(produkt.nazev)
    setJednotka(produkt.vychoziJednotka) // Nastavíme správnou jednotku (např. 'l' pro mléko)
    setPocet(1)
    setAktivniStitky([])
    setNalezeProdukty([]) // Schováme našeptávač
  }

  // 2. Přepínání štítků (Tagů)
  const toggleStitek = (stitek: string) => {
    if (aktivniStitky.includes(stitek)) {
      setAktivniStitky(aktivniStitky.filter(s => s !== stitek))
    } else {
      setAktivniStitky([...aktivniStitky, stitek])
    }
  }

  // 3. Odeslání do košíku
  const pridatDoKosiku = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vybranyProdukt) return

    const novaPolozka: PolozkaKosiku = {
      id: crypto.randomUUID(),
      nazev: vybranyProdukt.nazev,
      pocet: pocet,
      jednotka: jednotka,
      vybraneStitky: aktivniStitky
    }

    setKosik([...kosik, novaPolozka])
    
    // Reset formuláře
    setVstup('')
    setVybranyProdukt(null)
    setAktivniStitky([])
    setPocet(1)
  }

  const ResetFormulare = () => {
    setVstup('')
    setVybranyProdukt(null)
    setAktivniStitky([])
    setPocet(1)
    setJednotka('ks') // Dobré je vrátit i jednotku na výchozí
  }

  const smazPolozku = (id: string) => {
    setKosik(kosik.filter(p => p.id !== id))
  }

  return (
    <div className="home-container">
      <h2>Můj Nákupák 🛒</h2>

      {/* 2. CHYTRÝ FORMULÁŘ */}
      <div className="form-wrapper">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Co hledáš? (začni psát...)" 
            value={vstup}
            onChange={(e) => {
              setVstup(e.target.value)
              if (!e.target.value) setVybranyProdukt(null) // Reset když smaže text
            }}
            className="main-input"
          />
          {/* Našeptávač (Zobrazí se jen když píšu a nemám vybráno) */}
          {nalezeProdukty.length > 0 && !vybranyProdukt && (
            <div className="suggestions-dropdown">
              {nalezeProdukty.map(prod => (
                <div key={prod.id} className="suggestion-item" onClick={() => vyberProdukt(prod)}>
                  {prod.icon} {prod.nazev}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. UPŘESNĚNÍ (Zobrazí se jen když je vybrán produkt) */}
        {vybranyProdukt && (
          <div className="details-panel">
            
            {/* A) Štítky (pokud produkt nějaké má) */}
            {vybranyProdukt.stitky && (
              <div className="tags-container">
                <span className="tags-label">Upřesnit:</span>
                <div className="tags-list">
                  {vybranyProdukt.stitky.map(stitek => (
                    <button 
                      key={stitek} 
                      type="button"
                      className={`tag-btn ${aktivniStitky.includes(stitek) ? 'active' : ''}`}
                      onClick={() => toggleStitek(stitek)}
                    >
                      {stitek}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* B) Počet a Jednotka */}
            <div className="amount-row">
              <input 
                type="number" 
                min="0.1" 
                step="0.1" // Aby šlo zadat třeba 0.5 kg
                value={pocet} 
                onChange={e => setPocet(parseFloat(e.target.value))}
                className="amount-input"
              />
              <select 
                value={jednotka} 
                onChange={e => setJednotka(e.target.value)}
                className="unit-select"
              >
                {vybranyProdukt.mozneJednotky.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              
              <button onClick={pridatDoKosiku} className="confirm-add-btn">
                Vložit do seznamu
              </button>

              <button onClick={ResetFormulare} className="cancel-btn">
                Zrusit
              </button>
            </div>
          </div>
        )}
      </div>

        <h3>QUICK ADD</h3>
      {/* 1. QUICK ADD (Rychlé volby) */}
      <div className="quick-add-bar">
        {DATABAZE_POTRAVIN.slice(0, 5).map(prod => (
          <button key={prod.id} className="quick-btn" onClick={() => vyberProdukt(prod)}>
            <span className="quick-icon">{prod.icon}</span>
            <span className="quick-name">{prod.nazev}</span>
          </button>
        ))}
      </div>

      {/* 4. VÝPIS SEZNAMU */}
      <div className="list-container">
        {kosik.length === 0 && <p className="empty-msg">Košík zeje prázdnotou...</p>}
        
        {kosik.map((polozka) => (
          <div key={polozka.id} className="item-row">
            <div className="item-info">
              <span className="item-name">
                {polozka.nazev}
                {/* Zobrazení štítků v závorce */}
                {polozka.vybraneStitky.length > 0 && (
                  <span className="item-tags"> ({polozka.vybraneStitky.join(', ')})</span>
                )}
              </span>
            </div>
            <div className="item-right">
              <span className="item-amount">{polozka.pocet} {polozka.jednotka}</span>
              <button onClick={() => smazPolozku(polozka.id)} className="delete-btn">❌</button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Tlačítko pro odeslání na backend */}
      {kosik.length > 0 && (
        <button className="optimize-btn" onClick={() => alert(JSON.stringify(kosik, null, 2))}>
          🔍 Najít nejlevnější nákup
        </button>
      )}
    </div>
  )
}