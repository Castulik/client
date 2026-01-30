import testovaciData from '../pages/mock_data.json';
import { type DbProdukt, type PolozkaKosiku, type VysledekObchodu, type VysledekHledani } from '../types/types';

// Centrální slovník synonym
const ROZSIRENE_HLEDANI: Record<string, string[]> = {
  'pivo': ['pivo', 'pilsner', 'kozel', 'radegast', 'gambrinus'],
  'mléko': ['mléko', 'trvanlivé', 'čerstvé'],
  'maslo': ['máslo', 'madeta', 'jihočeské'],
  'kuřecí': ['kuřecí', 'prsa', 'řízky'],
  'vejce': ['vejce', 'vajíčka'],
  'pečivo': ['rohlík', 'houska', 'chléb', 'bageta'],
  'zelenina': ['rajče', 'okurka', 'paprika']
};

// 1. Funkce pro žebříček obchodů (Už jsme měli)
export const spocitatCenyProObchody = (seznamPolozek: PolozkaKosiku[]): VysledekObchodu[] => {
  const unikatniObchody = Array.from(new Set((testovaciData as DbProdukt[]).map(p => p.shop)));
  const vysledky: VysledekObchodu[] = [];

  for (const obchod of unikatniObchody) {
    let suma = 0;
    let nalezenoPocet = 0;
    const chybi: string[] = [];
    const detail = [];

    for (const polozka of seznamPolozek) {
      const klicovaSlova = ROZSIRENE_HLEDANI[polozka.nazev.toLowerCase()] || [polozka.nazev.toLowerCase()];
      
      const kandidati = (testovaciData as DbProdukt[]).filter(p =>
        p.shop === obchod &&
        klicovaSlova.some(slovo => p.name.toLowerCase().includes(slovo))
      );

      if (kandidati.length > 0) {
        kandidati.sort((a, b) => a.shelf_price - b.shelf_price);
        const vybrany = kandidati[0];
        const cenaCelkem = vybrany.shelf_price * polozka.pocet;
        suma += cenaCelkem;
        nalezenoPocet++;
        
        detail.push({
          nazevZbozi: polozka.nazev,
          cenaZaKus: vybrany.shelf_price,
          pocet: polozka.pocet,
          celkemZaPolozku: cenaCelkem,
          produktVDB: vybrany
        });
      } else {
        chybi.push(polozka.nazev);
        suma += 1000; // Penalizace
      }
    }

    vysledky.push({
      nazevObchodu: obchod,
      celkovaCena: suma,
      pocetNalezenychPolozek: nalezenoPocet,
      chybejiciPolozky: chybi,
      detailNakupu: detail
    });
  }

  vysledky.sort((a, b) => {
      if (b.pocetNalezenychPolozek !== a.pocetNalezenychPolozek) return b.pocetNalezenychPolozek - a.pocetNalezenychPolozek;
      return a.celkovaCena - b.celkovaCena;
  });

  return vysledky;
};

// 2. NOVÁ FUNKCE: Najít nejlevnější produkty napříč trhem (pro spodní výpis)
export const najitNejlepsiProduktyGlobalne = (seznamPolozek: PolozkaKosiku[]): VysledekHledani[] => {
    const nalezeneCeny: VysledekHledani[] = [];

    for (const polozka of seznamPolozek) {
        const hledanyText = polozka.nazev.toLowerCase();
        const klicovaSlova = ROZSIRENE_HLEDANI[hledanyText] || [hledanyText];

        const nalezeneProdukty = (testovaciData as DbProdukt[]).filter(dbProdukt => {
            const jmeno = dbProdukt.name.toLowerCase();
            return klicovaSlova.some(slovo => jmeno.includes(slovo));
        });

        // Seřadit podle jednotkové ceny (nejvýhodnější)
        nalezeneProdukty.sort((a, b) => a.current_price_per_unit - b.current_price_per_unit);

        nalezeneCeny.push({
            hledano: polozka.nazev,
            nalezeno: nalezeneProdukty.slice(0, 3) // Vracíme TOP 3
        });
    }
    return nalezeneCeny;
}