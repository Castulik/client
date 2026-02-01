import { BEZNE_CENY } from '../data/bezne_ceny';
import { type DbProdukt, type PolozkaKosiku, type VysledekHledani, type VysledekObchodu, type DetailPolozky } from '../types/types';

// ==========================================
// 1. KONFIGURACE A POMOCNÉ FUNKCE
// ==========================================

// Odstraní diakritiku a převede na malá písmena (např. "Mléko" -> "mleko")
// To je nutné pro porovnávání řetězců, aby "Mléko" == "mleko".
const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Limity určují, kdy se nákup chová jako "běžná spotřeba" (nejnižší cena celkem)
// a kdy jako "velkoobchod" (nejnižší cena za jednotku).
const LIMITY_PRO_KUSOVKY: Record<string, number> = {
  'toaletní papír': 7,
  'mléko': 11,
  'pivo': 10,
  'vejce': 9,
};

// Slovník synonym, aby když uživatel napíše "pivo", našlo to i "Pilsner".
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
 * FALLBACK metoda: Pokud v DB chybí sloupec 'amount' (množství v balení),
 * zkusíme to vyčíst z názvu. Hledá čísla před 'ks', 'rol', 'x'.
 * Pokud nic nenajde, vrátí 1 (což může být zdroj tvé chyby!).
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

// Zjistí limit pro dané zboží (např. pro 'toaletní papír' vrátí 7).
const ziskatLimit = (nazevZbozi: string): number => {
  const normNazev = normalize(nazevZbozi);
  const klic = Object.keys(LIMITY_PRO_KUSOVKY).find(k => normNazev.includes(k));
  return klic ? LIMITY_PRO_KUSOVKY[klic] : 1;
};

// ==========================================
// 2. HLAVNÍ LOGIKA VÝPOČTU KOŠÍKU
// ==========================================

export const spocitatCenyProObchody = (seznamPolozek: PolozkaKosiku[], databazeAkci: DbProdukt[]): VysledekObchodu[] => {

  // Získáme seznam všech obchodů, které máme v datech (Albert, Tesco...)
  const unikatniObchody = Array.from(new Set(databazeAkci.map(p => p.shop)));
  const vysledky: VysledekObchodu[] = [];

  // HLAVNÍ CYKLUS: Procházíme obchod po obchodu
  for (const obchod of unikatniObchody) {
    let suma = 0;
    let nalezenoPocet = 0;
    const chybi: string[] = [];
    const detail: DetailPolozky[] = [];

    // POD-CYKLUS: Procházíme nákupní seznam položku po položce
    for (const polozka of seznamPolozek) {
      const hledanyNazev = normalize(polozka.nazev);
      // Získáme klíčová slova (např. pro "pivo" -> ["pivo", "kozel"...])
      const klicovaSlova = ROZSIRENE_HLEDANI[hledanyNazev] || hledanyNazev.split(' ');
      const hledaneStitky = polozka.vybraneStitky.map(s => normalize(s));

      // Rozhodnutí: Je to velký nákup (jdeme po jednotkové ceně) nebo malý (jdeme po celkové)?
      const limitProMalyNakup = ziskatLimit(polozka.nazev);
      const jeVelkyNakup = polozka.jednotka === 'ks' && polozka.pocet > limitProMalyNakup;

      // --- 1. FÁZE: FILTROVÁNÍ KANDIDÁTŮ ---
      // Vybereme z DB jen produkty z aktuálního obchodu
      let kandidati = databazeAkci.filter(p => p.shop === obchod);

      // Filtrujeme ty, které odpovídají názvu zboží
      kandidati = kandidati.filter(p => {
        const jmenoProduktu = normalize(p.name);
        return klicovaSlova.some(slovo => jmenoProduktu.includes(slovo));
      });

      if (kandidati.length > 0) {

        // --- 2. FÁZE: VÝPOČET CENY PRO KAŽDÉHO KANDIDÁTA ---
        const obodovaniKandidati = kandidati.map(p => {
          const jmenoProduktu = normalize(p.name);

          // KROK A: Zjištění velikosti balení (např. 8 rolí)
          // Tady může být chyba! Pokud DB nemá 'amount' a Regex selže, vrátí se 1.
          let velikostBaleni = 1;
          if (p.amount && Number(p.amount) > 1) { // Důležité: Kontrola, zda amount existuje
            velikostBaleni = Number(p.amount);
          } else {
            velikostBaleni = parsovatVelikostBaleniRegex(p.name);
          }

          // KROK B: Určení ceny za CELÉ BALENÍ (Shelf Price)
          // Pokud je shelf_price 0, dopočítáváme ji. 
          // !! ZDE JE PRAVDĚPODOBNĚ TVŮJ PROBLÉM !!
          // Pokud je velikostBaleni 1 (chyba v kroku A), tak: cenaZaBaleni = unitPrice * 1
          let cenaZaBaleni = 0;
          if (p.shelf_price && Number(p.shelf_price) > 0) {
            cenaZaBaleni = Number(p.shelf_price);
          } else {
            // Fallback: Unit Price * Velikost
            cenaZaBaleni = p.current_price_per_unit * velikostBaleni;
          }

          // KROK C: Skóre shody (tagy a název)
          let skore = 0;
          hledaneStitky.forEach(stitek => { if (jmenoProduktu.includes(stitek)) skore += 100; });
          klicovaSlova.forEach(slovo => { if (jmenoProduktu.includes(slovo)) skore += 1; });

          // KROK D: Finální kalkulace pro uživatele
          let skutecnaCenaCelkem = 0;
          let pocetBaleniKeKoupi = 0;
          let poznamka = '';

          if (polozka.jednotka === 'balení') {
            // SCÉNÁŘ 1: Uživatel chce "1 balení"
            // Bere se vypočtená cenaZaBaleni.
            // Pokud byla chyba v Kroku A (velikost=1) a Kroku B (shelf=0),
            // tak se sem dostane jen unitPrice.
            pocetBaleniKeKoupi = polozka.pocet;
            skutecnaCenaCelkem = cenaZaBaleni * pocetBaleniKeKoupi;
            poznamka = `Cena za ${pocetBaleniKeKoupi}x balení`;
          } else {
            // SCÉNÁŘ 2: Uživatel chce "X kusů" (rolí)
            // Spočítáme kolik balení to pokryje
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

        // --- 3. FÁZE: VÝBĚR NEJLEPŠÍHO PRODUKTU (ŘAZENÍ) ---
        obodovaniKandidati.sort((a, b) => {
          // Nejdřív podle shody názvu
          if (a.skore !== b.skore) return b.skore - a.skore;

          // Potom podle ceny (buď unit nebo celkové)
          if (jeVelkyNakup) {
            return a.unitPrice - b.unitPrice;
          } else {
            return a.celkovaCena - b.celkovaCena;
          }
        });

        const vitezData = obodovaniKandidati[0];

        suma += vitezData.celkovaCena;
        nalezenoPocet++;

        // Uložení detailu pro zobrazení v UI
        detail.push({
          nazevZbozi: polozka.nazev,
          // !! UI zobrazuje toto číslo. Musí to být cena za balení, ne unit price.
          cenaZaKus: vitezData.shelfPrice,
          pocet: vitezData.pocetBaleni,
          celkemZaPolozku: vitezData.celkovaCena,
          produktVDB: vitezData.produkt,
          typCeny: 'akce',
        });

      } else {
        // --- FALLBACK NA BĚŽNÉ CENY (pokud není v akci) ---
        // Zde je logika zjednodušená, bereme data z bezne_ceny.ts
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
              // Fake produkt pro UI
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

    // Uložení výsledku za celý obchod
    vysledky.push({
      nazevObchodu: obchod,
      celkovaCena: suma,
      pocetNalezenychPolozek: nalezenoPocet,
      chybejiciPolozky: chybi,
      detailNakupu: detail
    });
  }

  // Seřazení obchodů (nejvíc nalezených -> nejnižší cena)
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

    // Hledáme napříč všemi obchody
    let kandidati = databazeAkci.filter(p => {
      const jmeno = normalize(p.name);
      return klicovaSlova.some(slovo => jmeno.includes(slovo));
    });

    const obodovani = kandidati.map(p => {
      let skore = 0;
      const jmeno = normalize(p.name);
      // Preferujeme shodu štítků
      hledaneStitky.forEach(stitek => { if (jmeno.includes(stitek)) skore += 100; });
      return { p, skore };
    });

    // Tady vždy řadíme podle jednotkové ceny (current_price_per_unit),
    // protože uživatel hledá "Top nabídky na trhu".
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