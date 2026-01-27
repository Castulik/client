import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Načtení hesel z .env souboru
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Vytvoření spojení
supabase: Client = create_client(url, key)

def save_product_to_db(product_info, metrics):
    """
    Nahraje produkt do Supabase.
    
    Args:
        product_info (dict): Základní info (jméno, id, obchod, kategorie)
        metrics (dict): To, co vrací funkce analyze_price_history
    """
    if not metrics:
        print(f"⚠️ Žádná data pro {product_info.get('name')}, přeskakuji upload.")
        return

    # Sestavení finálního objektu pro databázi
    data_payload = {
        "kupi_id": str(product_info['id']),  # Tohle musí být unikátní
        "name": product_info['name'],
        "shop": product_info.get('shop', 'Neznámý'),
        "category": product_info.get('category', ''),
        
        # Metriky z analýzy
        "current_price_per_unit": metrics['current_price_per_unit'],
        "regular_price_per_unit": metrics['regular_price_per_unit'],
        "deal_score": metrics['deal_score'],
        "discount_percent": metrics['discount_percent'],
        "is_best_in_month": metrics['is_best_in_month'],
        "next_deal_prediction": metrics['next_deal_prediction'], # JSON se uloží sám
        "last_update": metrics['last_update']
    }

    try:
        # MAGIE: .upsert()
        # Pokud ID neexistuje -> Vloží nový
        # Pokud ID existuje -> Aktualizuje data (ceny, skóre)
        response = supabase.table("products").upsert(data_payload, on_conflict="kupi_id").execute()
        print(f"✅ Uloženo do DB: {product_info['name']}")
    except Exception as e:
        print(f"❌ Chyba při ukládání do DB: {e}")

# --- TESTOVACÍ ČÁST (Jen pro ověření) ---
if __name__ == "__main__":
    # Příklad dat, jakoby vypadly ze scraperu
    dummy_info = {"id": "876", "name": "Kaiserka Testovací", "shop": "Tesco", "category": "Pečivo"}
    
    # Příklad metrik z tvé funkce analyze_price_history
    dummy_metrics = {
        "current_price_per_unit": 5.83,
        "regular_price_per_unit": 7.72,
        "deal_score": 6,
        "discount_percent": 24.5,
        "is_best_in_month": False,
        "next_deal_prediction": None,
        "last_update": "2026-02-03"
    }
    
    save_product_to_db(dummy_info, dummy_metrics)