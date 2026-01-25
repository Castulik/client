import { useState } from 'react'
import './HomePage.css' // Hned si k tomu vytvoříme styly

// Definice, jak vypadá jedna položka
interface Polozka {
  id: string
  nazev: string
  pocet: number
}

export default function HomePage() {
  // 1. STAV: Tady se drží seznam věcí
  const [seznam, setSeznam] = useState<Polozka[]>([])
  
  // 2. STAV: Tady je to, co uživatel zrovna píše do políčka
  const [nazevVstupu, setNazevVstupu] = useState('')
  const [pocetVstupu, setPocetVstupu] = useState(1)

  // Funkce pro přidání do seznamu
  const pridejPolozku = (e: React.FormEvent) => {
    e.preventDefault() // Aby se nestránka neobnovila
    if (!nazevVstupu.trim()) return // Nepřidávat prázdné věci

    const novaPolozka: Polozka = {
      id: crypto.randomUUID(), // Vygeneruje náhodné ID
      nazev: nazevVstupu,
      pocet: pocetVstupu
    }

    setSeznam([...seznam, novaPolozka]) // Přidáme k existujícím
    setNazevVstupu('') // Vyčistíme políčko
    setPocetVstupu(1)  // Resetujeme počet
  }

  // Funkce pro smazání
  const smazPolozku = (id: string) => {
    setSeznam(seznam.filter(polozka => polozka.id !== id))
  }

  // Tady se později zavolá tvůj Python optimizer
  const spustitOptimalizaci = () => {
    console.log("Odesílám data na backend:", seznam)
    alert("Teď bych odeslal data: " + JSON.stringify(seznam))
  }

  return (
    <div className="home-container">
      <h2>Můj Nákupní Seznam 📝</h2>

      {/* Formulář pro přidání */}
      <form onSubmit={pridejPolozku} className="input-group">
        <input 
          type="text" 
          placeholder="Co chceš koupit? (např. Máslo)" 
          value={nazevVstupu}
          onChange={(e) => setNazevVstupu(e.target.value)}
          className="main-input"
        />
        <input 
          type="number" 
          min="1" 
          value={pocetVstupu}
          onChange={(e) => setPocetVstupu(parseInt(e.target.value))}
          className="amount-input"
        />
        <button type="submit" className="add-btn">Přidat</button>
      </form>

      {/* Výpis seznamu */}
      <div className="list-container">
        {seznam.length === 0 && <p className="empty-msg">Zatím máš prázdný košík...</p>}
        
        {seznam.map((polozka) => (
          <div key={polozka.id} className="item-row">
            <span className="item-amount">{polozka.pocet}x</span>
            <span className="item-name">{polozka.nazev}</span>
            <button onClick={() => smazPolozku(polozka.id)} className="delete-btn">❌</button>
          </div>
        ))}
      </div>

      {/* Tlačítko AKCE (Optimizer) */}
      {seznam.length > 0 && (
        <div className="action-area">
          <button onClick={spustitOptimalizaci} className="optimize-btn">
            🔍 Najít nejlevnější obchod
          </button>
        </div>
      )}
    </div>
  )
}