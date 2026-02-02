import { BEZNE_CENY } from '../data/bezne_ceny';
import { type DbProdukt, type PolozkaKosiku, type VysledekHledani, type VysledekObchodu, type DetailPolozky, type ProduktDefinice } from '../types/types';
import { supabase } from '../pages/supabaseClient'; // <--- PŘIDÁNO: Potřebujeme klienta pro RPC volání

// ==========================================
// 1. KONFIGURACE A POMOCNÉ FUNKCE
// ==========================================

// Odstraní diakritiku a převede na malá písmena
const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const LIMITY_PRO_KUSOVKY: Record<string, number> = {
  'toaletní papír': 7,
  'mléko': 11,
  'pivo': 10,
  'vejce': 9,
};

const ROZSIRENE_HLEDANI: Record<string, string[]> = {
  'pivo': ['pivo', 'pilsner', 'kozel', 'radegast', 'gambrinus', 'svijany', 'budvar'],
  'mléko': ['mléko', 'trvanlivé', 'čerstvé', 'plnotučné', 'polotučné'],
  'máslo': ['máslo', 'madeta', 'jihočeské'],
  'kuřecí': ['kuřecí', 'prsa', 'řízky', 'čtvrtky', 'stehenní'],
  'vejce': ['vejce', 'vajíčka'],
  'pečivo': ['rohlík', 'houska', 'chléb', 'bageta', 'bulka', 'kaiserka'],
  'zelenina': ['rajče', 'okurka', 'paprika', 'mrkev', 'brambory', 'cibule'],
  'ovoce': ['jablko', 'banán', 'pomeranč', 'citron'],
  'toaletní papír': ['toaletní', 'papír', 'tento', 'zewa', 'harmasan'],
  'mouka': ['mouka', 'hladká', 'polohrubá', 'hrubá']
};

/**
 * FALLBACK metoda pro parsování balení z názvu
 */
const parsovatVelikostBaleniRegex = (nazevProduktu: string): number => {
  const regex = /(\d+)\s*(?:ks|rol|x\b|rolí|l\b)/i;
  const match = nazevProduktu.match(regex);
  if (match && match[1]) {
    const hodnota = parseInt(match[1], 10);
    return hodnota > 0 ? hodnota : 1;
  }
  return 1;
};

const ziskatLimit = (nazevZbozi: string): number => {
  const normNazev = normalize(nazevZbozi);
  const klic = Object.keys(LIMITY_PRO_KUSOVKY).find(k => normNazev.includes(k));
  return klic ? LIMITY_PRO_KUSOVKY[klic] : 1;
};

// ==========================================
// 2. HLAVNÍ LOGIKA VÝPOČTU KOŠÍKU
// ==========================================

export const spocitatCenyProObchody = (seznamPolozek: PolozkaKosiku[], databazeAkci: DbProdukt[]): VysledekObchodu[] => {

  const unikatniObchody = Array.from(new Set(databazeAkci.map(p => p.shop)));
  const vysledky: VysledekObchodu[] = [];

  for (const obchod of unikatniObchody) {
    let suma = 0;
    let nalezenoPocet = 0;
    const chybi: string[] = [];
    const detail: DetailPolozky[] = [];

    for (const polozka of seznamPolozek) {
      const hledanyNazev = normalize(polozka.nazev);
      const klicovaSlova = ROZSIRENE_HLEDANI[hledanyNazev] || hledanyNazev.split(' ');
      const hledaneStitky = polozka.vybraneStitky.map(s => normalize(s));

      const limitProMalyNakup = ziskatLimit(polozka.nazev);
      const jeVelkyNakup = polozka.jednotka === 'ks' && polozka.pocet > limitProMalyNakup;

      let kandidati = databazeAkci.filter(p => p.shop === obchod);

      kandidati = kandidati.filter(p => {
        const jmenoProduktu = normalize(p.name);
        return klicovaSlova.some(slovo => jmenoProduktu.includes(slovo));
      });

      if (kandidati.length > 0) {
        const obodovaniKandidati = kandidati.map(p => {
          const jmenoProduktu = normalize(p.name);

          let velikostBaleni = 1;
          if (p.amount && Number(p.amount) > 1) {
            velikostBaleni = Number(p.amount);
          } else {
            velikostBaleni = parsovatVelikostBaleniRegex(p.name);
          }

          let cenaZaBaleni = 0;
          if (p.shelf_price && Number(p.shelf_price) > 0) {
            cenaZaBaleni = Number(p.shelf_price);
          } else {
            cenaZaBaleni = p.current_price_per_unit * velikostBaleni;
          }

          let skore = 0;
          hledaneStitky.forEach(stitek => { if (jmenoProduktu.includes(stitek)) skore += 100; });
          klicovaSlova.forEach(slovo => { if (jmenoProduktu.includes(slovo)) skore += 1; });

          let skutecnaCenaCelkem = 0;
          let pocetBaleniKeKoupi = 0;
          let poznamka = '';

          if (polozka.jednotka === 'balení') {
            pocetBaleniKeKoupi = polozka.pocet;
            skutecnaCenaCelkem = cenaZaBaleni * pocetBaleniKeKoupi;
            poznamka = `Cena za ${pocetBaleniKeKoupi}x balení`;
          } else {
            pocetBaleniKeKoupi = Math.ceil(polozka.pocet / velikostBaleni);
            skutecnaCenaCelkem = pocetBaleniKeKoupi * cenaZaBaleni;
            if (velikostBaleni > 1) {
              poznamka = `(Koupeno ${pocetBaleniKeKoupi}x po ${velikostBaleni}ks)`;
            }
          }

          return {
            produkt: p,
            skore,
            celkovaCena: skutecnaCenaCelkem,
            unitPrice: p.current_price_per_unit,
            shelfPrice: cenaZaBaleni,
            pocetBaleni: pocetBaleniKeKoupi,
            poznamka
          };
        });

        obodovaniKandidati.sort((a, b) => {
          if (a.skore !== b.skore) return b.skore - a.skore;
          if (jeVelkyNakup) return a.unitPrice - b.unitPrice;
          return a.celkovaCena - b.celkovaCena;
        });

        const vitezData = obodovaniKandidati[0];
        suma += vitezData.celkovaCena;
        nalezenoPocet++;

        detail.push({
          nazevZbozi: polozka.nazev,
          cenaZaKus: vitezData.shelfPrice,
          pocet: vitezData.pocetBaleni,
          celkemZaPolozku: vitezData.celkovaCena,
          produktVDB: vitezData.produkt,
          typCeny: 'akce',
        });

      } else {
        // FALLBACK
        let beznaCenaKus = BEZNE_CENY[hledanyNazev];
        if (!beznaCenaKus) {
          const klic = klicovaSlova.find(k => BEZNE_CENY[k]);
          if (klic) beznaCenaKus = BEZNE_CENY[klic];
        }

        if (beznaCenaKus) {
          const cenaCelkem = beznaCenaKus * polozka.pocet;
          suma += cenaCelkem;
          nalezenoPocet++;

          detail.push({
            nazevZbozi: polozka.nazev,
            cenaZaKus: beznaCenaKus,
            pocet: polozka.pocet,
            celkemZaPolozku: cenaCelkem,
            produktVDB: {
              id: 'standard',
              name: `${polozka.nazev} (běžná cena)`,
              shop: obchod,
              shelf_price: beznaCenaKus,
              current_price_per_unit: beznaCenaKus,
              regular_price_per_unit: beznaCenaKus,
              amount: 1, unit: polozka.jednotka, discount_percent: 0, category: 'Standard', deal_score: 0
            },
            typCeny: 'standard'
          });
        } else {
          chybi.push(polozka.nazev);
          suma += 1;
        }
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
    const chybiA = a.chybejiciPolozky.length;
    const chybiB = b.chybejiciPolozky.length;
    if (chybiA !== chybiB) return chybiA - chybiB;
    return a.celkovaCena - b.celkovaCena;
  });

  return vysledky;
};

// ==========================================
// 3. GLOBÁLNÍ HLEDÁNÍ (Stránka Optimum)
// ==========================================

export const najitNejlepsiProduktyGlobalne = (seznamPolozek: PolozkaKosiku[], databazeAkci: DbProdukt[]): VysledekHledani[] => {
  const nalezeneCeny: VysledekHledani[] = [];

  for (const polozka of seznamPolozek) {
    const hledanyNazev = normalize(polozka.nazev);
    const klicovaSlova = ROZSIRENE_HLEDANI[hledanyNazev] || hledanyNazev.split(' ');
    const hledaneStitky = polozka.vybraneStitky.map(s => normalize(s));

    let kandidati = databazeAkci.filter(p => {
      const jmeno = normalize(p.name);
      return klicovaSlova.some(slovo => jmeno.includes(slovo));
    });

    const obodovani = kandidati.map(p => {
      let skore = 0;
      const jmeno = normalize(p.name);
      hledaneStitky.forEach(stitek => { if (jmeno.includes(stitek)) skore += 100; });
      return { p, skore };
    });

    obodovani.sort((a, b) => {
      if (a.skore !== b.skore) return b.skore - a.skore;
      return a.p.current_price_per_unit - b.p.current_price_per_unit;
    });

    nalezeneCeny.push({
      hledano: polozka.nazev,
      nalezeno: obodovani.slice(0, 3).map(o => o.p)
    });
  }
  return nalezeneCeny;
}

// ==========================================
// 4. FUZZY NAŠEPTÁVAČ (Novinka pro UI)
// ==========================================

/**
 * Volá RPC funkci 'search_products_fuzzy' v Supabase.
 * Kombinuje výsledky z:
 * 1. Globalních produktů ("Rajče")
 * 2. Živých slev ("Rajčata keříková Penny")
 * 3. Uživatelské historie ("Paprika bio")
 */
export const searchProductsFuzzy = async (searchTerm: string): Promise<ProduktDefinice[]> => {
  // Ochrana proti zbytečným requestům
  if (!searchTerm || searchTerm.length < 2) return [];

  const { data, error } = await supabase
    .rpc('search_products_fuzzy', { search_term: searchTerm });

  if (error) {
    console.error('❌ Chyba při fuzzy hledání:', error);
    return [];
  }

  // Mapování surových dat z DB na náš frontendový typ ProduktDefinice
  return (data || []).map((item: any) => ({
    id: item.id,
    nazev: item.nazev,
    icon: item.icon || '🛒', // Fallback ikona
    
    // Defaultní hodnoty pro ProduktDefinice (protože DB vrací jen základ)
    vychozi_jednotka: 'ks',
    mozne_jednotky: ['ks', 'kg', 'balení'], 
    stitky: [], // Zde bychom mohli v budoucnu tahat štítky z DB, pokud existují
    
    // Extra pole pro UI (abychom věděli, odkud položka je)
    source: item.source 
  }));
};