import kupiapi.scraper # imports KupiScraper() class
import kupiapi.recipes # imports KupiRecipes() class
import json
from collections import defaultdict
import os

# --- 1. VYŘEŠENÍ CESTY K SOUBORU ---
# Zjistíme, kde leží tento skript, a soubor budeme hledat hned vedle něj.
base_path = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_path, 'vzorek_dat.json')

print(f"📂 Hledám data zde: {file_path}")

# --- 2. NAČTENÍ DAT ---
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"✅ Načteno {len(data)} 'skupin' produktů.")
except FileNotFoundError:
    print("❌ Soubor vzorek_dat.json nebyl nalezen! Spusť nejdřív scraper.")
    exit()

# --- 3. TŘÍDĚNÍ A ROZSEKÁVÁNÍ (TOHLE JE TA NOVÁ ČÁST) ---
products_by_shop = defaultdict(list)

for product in data:
    # Získáme seznamy uvnitř produktu
    names = product.get("name", "Neznámý produkt") # Jméno je jen jedno
    shops = product.get("shops", [])
    prices = product.get("prices", [])
    amounts = product.get("amounts", [])
    validities = product.get("validities", [])

    # Projdeme všechny obchody u tohoto jednoho produktu
    # Používáme 'enumerate', abychom věděli, na kterém indexu (i) jsme
    # Díky tomu vytáhneme správnou cenu pro správný obchod
    for i, shop_name in enumerate(shops):
        
        # Ošetření, kdyby chyběla cena (seznam prices by byl kratší než shops)
        price = prices[i] if i < len(prices) else "Neznámá cena"
        amount = amounts[i] if i < len(amounts) else ""
        validity = validities[i] if i < len(validities) else ""

        # Vytvoříme si novou, čistou položku pro konkrétní obchod
        clean_item = {
            "name": names,
            "price": price,
            "amount": amount,
            "validity": validity,
            "original_shop": shop_name  # Pro kontrolu
        }

        # Přidáme do správné "krabice"
        products_by_shop[shop_name].append(clean_item)

# --- 4. VÝPIS VÝSLEDKŮ ---
print("-" * 40)
print("VÝSLEDEK TŘÍDĚNÍ:")
print("-" * 40)

for shop, items in products_by_shop.items():
    print(f"🛒 {shop}: nalezeno {len(items)} akcí")
    
    # Pro kontrolu vypíšeme první položku z každého obchodu
    if items:
        ukazka = items[0]
        print(f"   -> Ukázka: {ukazka['name']} za {ukazka['price']}")
    print(" ")

# Debug: Konkrétně Lidl
print(json.dumps(products_by_shop["Lidl"], indent=2, ensure_ascii=False))


#a = sc.get_discounts_by_search('pivo',1)
#b = sc.get_categories()
#c = sc.get_discounts_by_shop('Albert',1)
#d = sc.get_discounts_by_shop('Lidl',1)
##e = sc.get_discounts_by_shop('Tesco',1)

#f = sc.get_categories()

#vsechna_data = c #+ d + e
#print(json.dumps(vsechna_data, ensure_ascii=False))
#with open("vystup.json", "w", encoding="utf-8") as f:
#    json.dump(a, f, ensure_ascii=False, indent=4)

"""
FILE_NAME = 'vzorek_dat.json'

# 1. Kontrola, jestli soubor už existuje
if os.path.exists(FILE_NAME):
    print("📂 Načítám data z lokálního souboru...")
    with open(FILE_NAME, 'r', encoding='utf-8') as f:
        data = json.load(f)
else:
    print("🌐 Soubor neexistuje, začínám scrapovat (tohle potrvá)...")
    # Tady spustíš ten svůj reálný scrape
    f_json = sc.get_discounts_by_category('pecivo', 1)
    data = json.loads(f_json)
    
    # Uložíme si to na příště (indent=4 pro hezké formátování, ensure_ascii=False pro češtinu)
    with open(FILE_NAME, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print("✅ Hotovo, data uložena do vzorek_dat.json.")"""