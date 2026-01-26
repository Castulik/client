# 🚀 Aktuální stav projektu (Status Report)

Jsme ve fázi **pokročilého vývoje MVP** (Minimum Viable Product). Máme vyřešenou architekturu a klíčovou logiku zpracování dat.

### 1. Architektura: Monorepo
Projekt je sjednocen do jednoho repozitáře s jasně oddělenými zodpovědnostmi:
* 📂 **/web**: Frontend (React + Vite + Tailwind).
* 📂 **/scraper**: Backend logika (Python skripty pro sběr a čištění dat).
* Data se potkávají v **Supabase** (PostgreSQL).

### 2. Scraper & Data Pipeline (Hotovo ✅)
Máme funkční Python skript (`cleaner` logika), který:
* Stahuje data z Kupi (aktuálně simulováno přes lokální cache pro rychlý vývoj).
* **Rozbíjí složité objekty:** Umí vzít jeden produkt (např. "Donut"), který se prodává v 5 obchodech, a rozdělit ho na 5 samostatných záznamů.
* **Čistí data:**
    * Cena: `12,90 Kč` -> `12.9` (float).
    * Váha: `6x 65 g` -> `65.0` a `g` (pomocí Regex whitelistu).
    * Datum: `zítra končí` -> `202X-MM-DD` (date object).
* **Vypočítává jednotkovou cenu:** Automaticky počítá cenu za **1 kg** nebo **1 l**, což bude hlavní metrika pro porovnávání výhodnosti v aplikaci.

### 3. Databáze (Návrh 📝)
Máme připravené SQL schéma pro tabulku `products` v Supabase, která je typově kompatibilní s výstupem scraperu.
* Klíčové sloupce: `unit_price`, `unit_type`, `valid_to`.
* Připraveno pro analytické dotazy (řazení podle skutečné výhodnosti).

---

### 🔜 Co nás čeká dál (Next Steps)
1.  **Python -> Supabase:** Propojit skript s živou databází a nahrát tam první várku reálných dat.
2.  **API/Frontend:** Vytvořit v Reactu funkci, která si tato data stáhne a zobrazí v tabulce/kartách.
3.  **Automation:** Nastavit GitHub Actions, aby se scraper spouštěl sám každý den ráno.


# 📦 Datový model Scraperu

Aktuální skript vrací data jako **Slovník (Dictionary)**, kde klíčem je **název obchodu** a hodnotou je **seznam produktů**.

## Struktura výstupu (JSON ukázka)

```json
{
  "Lidl": [
    {
      "name": "Kobliha s ovocnou náplní",
      "shop": "Lidl",
      "price": 12.9,
      "amount_val": 65.0,
      "amount_unit": "g",
      "unit_price": 198.46,
      "unit_type": "kg",
      "valid_to": "2024-02-01",
      "original_raw_amount": "65 g"
    },
    { ... další produkty ... }
  ],
  "Kaufland": [ ... ]
}

