// src/types.ts

export interface ProduktDefinice {
  id: string;
  nazev: string;
  icon: string;
  // Změň snake_case na camelCase:
  vychoziJednotka: string; // Místo vychozi_jednotka
  mozneJednotky: string[]; // Místo mozne_jednotky
  stitky: string[];
  
  // Volitelné nové pole
  source?: string;
  shop?: string | null;
  price?: number | null;
}

export interface PolozkaKosiku {
  id: string
  nazev: string
  pocet: number
  jednotka: string
  vybraneStitky: string[]
}

export interface DbProdukt {
  id: string;
  name: string;
  shop: string;
  category: string;
  shelf_price: number;
  amount: number;
  unit: string;
  current_price_per_unit: number;
  regular_price_per_unit: number;
  discount_percent: number;
  deal_score: number;
}

export interface DetailPolozky {
    nazevZbozi: string;
    cenaZaKus: number;
    pocet: number;
    celkemZaPolozku: number;
    produktVDB: DbProdukt; // Znovužití jiného typu
    typCeny?: 'akce' | 'standard'; // <--- NOVÉ
}

export interface VysledekObchodu {
  nazevObchodu: string;
  celkovaCena: number;
  pocetNalezenychPolozek: number;
  chybejiciPolozky: string[];
  // 2. POUŽITÍ - Mnohem čistší
  detailNakupu: DetailPolozky[]; 
}

export interface VysledekHledani {
  hledano: string;
  nalezeno: DbProdukt[];
}