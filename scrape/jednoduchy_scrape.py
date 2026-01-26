import kupiapi.scraper # imports KupiScraper() class
import kupiapi.recipes # imports KupiRecipes() class
import json


sc = kupiapi.scraper.KupiScraper()

#a = sc.get_discounts_by_search('pivo',1)
#b = sc.get_categories()
#c = sc.get_discounts_by_shop('Albert',1)
#d = sc.get_discounts_by_shop('Lidl',1)
##e = sc.get_discounts_by_shop('Tesco',1)

f = sc.get_categories()

print(f)

#vsechna_data = c #+ d + e
#print(json.dumps(vsechna_data, ensure_ascii=False))
#with open("vystup.json", "w", encoding="utf-8") as f:
#    json.dump(a, f, ensure_ascii=False, indent=4)