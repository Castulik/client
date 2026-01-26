import kupiapi.scraper # imports KupiScraper() class
import kupiapi.recipes # imports KupiRecipes() class
import json
from collections import defaultdict
import os

sc = kupiapi.scraper.KupiScraper()

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
    print("✅ Hotovo, data uložena do vzorek_dat.json.")



# 1. Načtení dat
f_json = sc.get_discounts_by_category('pecivo',1)
data = json.loads(f_json)
# 2. Kontrola pro tebe (vypíše, co to vlastně je)
# print(f"Typ dat: {type(data)}") 

# 3. Třídička
products_by_shop = defaultdict(list)

# Protože 'data' je už přímo ten seznam, jdeme rovnou do cyklu
for item in data:
    # 1. Získáme seznam obchodů (např. ['Albert'])
    shops_list = item.get("shops", [])
    
    # 2. Musíme vzít první prvek ze seznamu, pokud tam je
    if shops_list and len(shops_list) > 0:
        shop_name = shops_list[0]  # Vezme 'Albert' jako text
    else:
        shop_name = "Neznámý"
    
    # 3. Teď už je shop_name string (text), takže to půjde přidat do slovníku
    products_by_shop[shop_name].append(item)

# 4. Výsledek
for shop, items in products_by_shop.items():
    print(f"Obchod: {shop} | Počet akcí: {len(items)}")

print(products_by_shop["Albert"])
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