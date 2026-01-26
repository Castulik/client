import json
import os
import re
from collections import defaultdict
from datetime import datetime, timedelta, date

# ==========================================
# 1. ČISTÍCÍ A POMOCNÉ FUNKCE
# ==========================================

def clean_price(price_str):
    if not price_str: return 0.0
    clean = price_str.replace("Kč", "").replace(" ", "").strip().replace(",", ".")
    try:
        return float(clean)
    except ValueError:
        return 0.0

def parse_amount(amount_str):
    """Vytáhne z textu číslo a jednotku (např. '6x 65 g' -> 65.0, 'g')."""
    if not amount_str: return None, None
    text = amount_str.lower().replace(",", ".")
    
    # Hledáme číslo následované povolenou jednotkou (ignorujeme "x" v multipacku)
    match = re.search(r'(\d+[.]?\d*)\s*(g|kg|ml|l|ks)', text)
    if match:
        return float(match.group(1)), match.group(2)
    return None, None

def parse_date(date_str):
    """Převede 'zítra končí' nebo '1. 2.' na objekt data."""
    today = date.today()
    text = date_str.lower()

    if "zítra" in text: return today + timedelta(days=1)
    if "dnes" in text: return today

    match = re.search(r'(\d+)\.\s*(\d+)\.', text)
    if match:
        day, month = int(match.group(1)), int(match.group(2))
        year = today.year
        # Ošetření přelomu roku (prosinec -> leden)
        if today.month == 12 and month == 1: year += 1
        try:
            return date(year, month, day)
        except ValueError:
            return None
    return None

def calculate_unit_price(price, amount, unit):
    """Spočítá cenu za měrnou jednotku (kg/l)."""
    if not price or not amount or amount == 0 or not unit:
        return 0.0, unit

    # Přepočty na základní jednotky
    if unit == 'g': return round(price / (amount / 1000), 2), 'kg'
    if unit == 'ml': return round(price / (amount / 1000), 2), 'l'
    if unit in ['kg', 'l']: return round(price / amount, 2), unit
    
    # Ostatní (ks)
    return round(price / amount, 2), unit

# ==========================================
# 2. HLAVNÍ LOGIKA
# ==========================================

if __name__ == "__main__":
    # Nastavení cest a načtení JSONu
    base_path = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_path, 'vzorek_dat.json')

    print(f"📂 Načítám data z: {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Načteno {len(data)} záznamů.")
    except FileNotFoundError:
        print("❌ Soubor nenalezen. Musíš nejdřív scrapovat data.")
        exit()

    # Zpracování dat
    products_by_shop = defaultdict(list)

    for product in data:
        names = product.get("name", "Neznámý produkt")
        shops = product.get("shops", [])
        prices = product.get("prices", [])
        amounts = product.get("amounts", [])
        validities = product.get("validities", [])

        # Iterace přes varianty v různých obchodech
        for i, shop_name in enumerate(shops):
            raw_price = prices[i] if i < len(prices) else ""
            raw_amount = amounts[i] if i < len(amounts) else ""
            raw_validity = validities[i] if i < len(validities) else ""

            # Aplikace čistících funkcí
            clean_p = clean_price(raw_price)
            amount_val, amount_unit = parse_amount(raw_amount)
            valid_date = parse_date(raw_validity)
            unit_price, unit_name = calculate_unit_price(clean_p, amount_val, amount_unit)

            clean_item = {
                "name": names,
                "shop": shop_name,
                "price": clean_p,
                "amount_val": amount_val,
                "amount_unit": amount_unit,
                "unit_price": unit_price,     # <--- ZDE KONTROLOVAT
                "unit_type": unit_name,
                "valid_to": str(valid_date) if valid_date else None,
                "original_raw_amount": raw_amount
            }
            products_by_shop[shop_name].append(clean_item)

    # ==========================================
    # 3. VÝPIS A KONTROLA
    # ==========================================
    print("\n" + "="*50)
    print("📊 SOUHRN PO OBCHODECH")
    print("="*50)
    
    for shop, items in products_by_shop.items():
        print(f"🛒 {shop}: {len(items)} položek")

    print("\n" + "="*50)
    print("🕵️ DETAILNÍ KONTROLA DAT (První položka z každého obchodu)")
    print("="*50)

    for shop, items in products_by_shop.items():
        if items:
            sample = items[0]
            print(f"\n--- {shop} ---")
            # Vypíše hezký JSON pro kontrolu všech polí
            print(json.dumps(sample, indent=4, ensure_ascii=False))

# ==========================================
# 4. ARCHIV (Scraper & Cache logic)
# ==========================================
"""
import kupiapi.scraper
import kupiapi.recipes

FILE_NAME = 'vzorek_dat.json'

# Logika pro automatické vytvoření cache, pokud neexistuje
if os.path.exists(FILE_NAME):
    print("📂 Načítám data z lokálního souboru...")
    with open(FILE_NAME, 'r', encoding='utf-8') as f:
        data = json.load(f)
else:
    print("🌐 Soubor neexistuje, začínám scrapovat...")
    sc = kupiapi.scraper.KupiScraper()
    f_json = sc.get_discounts_by_category('pecivo', 1)
    data = json.loads(f_json)
    
    with open(FILE_NAME, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print("✅ Hotovo, data uložena.")
"""