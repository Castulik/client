import lib_scraper 
import json


sc = lib_scraper.KupiScraper()

# ... importy ...

# 1. Stáhneš surová data (ten milion čísel)
raw_history = sc.get_price_history("https://www.kupi.cz/sleva/kaiserka")

# 2. Okamžitě je zjednodušíš
if raw_history:
    smart_data = sc.analyze_price_history(raw_history)
    print(json.dumps(smart_data, indent=4))