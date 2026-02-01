// debug.js - Simulace výpočtu ceny

// 1. DATA (Opraveno: Odstraněny hranaté závorky [] na začátku a konci)
const mockDbProdukt = {
    "idx": 1,
    "id": 51,
    "kupi_id": "1162",
    "name": "Toaletní papír 3vrstvý Harmony",
    "shop": "Tesco",
    "category": "drogerie",
    "current_price_per_unit": "4.99",
    "regular_price_per_unit": "10.45",
    "deal_score": 10,
    "discount_percent": "52.2",
    "is_best_in_month": false,
    "next_deal_prediction": null,
    "last_update": "2026-02-01",
    "created_at": "2026-01-27 11:43:54.749046+00",
    "fts": "'3vrstvý':3 'drogerie':5 'harmony':4 'papír':2 'toaletní':1",
    "shelf_price": "49.9",
    "amount": "8.0",
    "unit": "ks"
};

// 2. Simulace vstupu uživatele
const polozkaKosiku = {
    nazev: "Toaletní papír",
    pocet: 1,
    jednotka: "balení",
    vybraneStitky: []
};

// --- SIMULACE LOGIKY ---

console.log("--- ZAČÁTEK DEBUGU ---");
console.log(`Produkt: ${mockDbProdukt.name}`);
console.log(`Cena za jednotku (Unit Price): ${mockDbProdukt.current_price_per_unit}`);
console.log(`Cena na regálu (Shelf Price z DB): ${mockDbProdukt.shelf_price}`);
console.log(`Množství v DB (Amount): ${mockDbProdukt.amount}`);

// A. Parsování velikosti
const parsovatVelikostBaleniRegex = (nazev) => {
    const regex = /(\d+)\s*(?:ks|rol|x\b|rolí|l\b)/i; 
    const match = nazev.match(regex);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return 1;
};

let velikostBaleni = 1;
if (mockDbProdukt.amount && Number(mockDbProdukt.amount) > 1) {
    velikostBaleni = Number(mockDbProdukt.amount);
    console.log(`✅ Použita velikost z DB: ${velikostBaleni}`);
} else {
    velikostBaleni = parsovatVelikostBaleniRegex(mockDbProdukt.name);
    console.log(`⚠️ Použit Regex parser. Výsledek: ${velikostBaleni}`);
    if (velikostBaleni === 1) console.log("   -> POZOR: Regex nenašel číslo v názvu! Proto je velikost 1.");
}

// B. Určení ceny za balení
let cenaZaBaleni = 0;
if (mockDbProdukt.shelf_price && Number(mockDbProdukt.shelf_price) > 0) {
    cenaZaBaleni = Number(mockDbProdukt.shelf_price);
    console.log(`✅ Použita Shelf Price z DB: ${cenaZaBaleni}`);
} else {
    cenaZaBaleni = mockDbProdukt.current_price_per_unit * velikostBaleni;
    console.log(`⚠️ Shelf Price chybí. Dopočítáno: UnitPrice (${mockDbProdukt.current_price_per_unit}) * Velikost (${velikostBaleni}) = ${cenaZaBaleni}`);
}

// C. Výsledek pro uživatele
let vyslednaCena = 0;
if (polozkaKosiku.jednotka === 'balení') {
    vyslednaCena = cenaZaBaleni * polozkaKosiku.pocet;
    console.log(`\n🛒 Uživatel chce ${polozkaKosiku.pocet}x BALENÍ.`);
    console.log(`FINÁLNÍ CENA: ${vyslednaCena} Kč`);
} else {
    // Simulace pro "ks"
    const pocetBaleni = Math.ceil(polozkaKosiku.pocet / velikostBaleni);
    vyslednaCena = pocetBaleni * cenaZaBaleni;
    console.log(`\n🛒 Uživatel chce KUSY (konkrétně ${polozkaKosiku.pocet} ${polozkaKosiku.jednotka}).`);
    console.log(`   -> To odpovídá ${pocetBaleni}x balení.`);
    console.log(`FINÁLNÍ CENA: ${vyslednaCena} Kč`);
}

// Kontrola
if (Math.abs(vyslednaCena - Number(mockDbProdukt.current_price_per_unit)) < 0.1 && velikostBaleni > 1) {
    console.log("\n❌ CHYBA: Cena za balení je stejná jako cena za roli!");
} else {
    console.log("\n✅ OK: Cena vypadá správně.");
}