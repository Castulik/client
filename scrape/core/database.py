import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Načtení hesel z .env souboru (o úroveň výš)
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Vytvoření spojení (pokud klíče chybí, vyhodí chybu až při použití)
supabase: Client = create_client(url, key) if url and key else None

def save_product_to_db(product_info, metrics):
    """
    Nahraje produkt do Supabase tabulky 'products'.
    """
    if not supabase:
        print("❌ CHYBA: Supabase credentials nenalezeny v .env")
        return

    if not metrics:
        print(f"⚠️ Žádná analytická data pro {product_info.get('name')}, přeskakuji upload.")
        return

    # Sestavení finálního objektu
    data_payload = {
        "kupi_id": str(product_info.get('id', 'unknown')), 
        "name": product_info['name'],
        "shop": product_info.get('shop', 'Neznámý'),
        "category": product_info.get('category', ''),
        
        # --- NOVÉ POLOŽKY ---
        # Pokud scraper nic nenašel, uložíme None nebo 0
        "shelf_price": product_info.get('shelf_price', 0),
        "amount": product_info.get('amount', 1), # Default 1, aby se dalo dělit
        "unit": product_info.get('unit', 'ks'),
        # --------------------

        # Metriky z analytics.py (historie)
        "current_price_per_unit": metrics['current_price_per_unit'],
        "regular_price_per_unit": metrics['regular_price_per_unit'],
        "deal_score": metrics['deal_score'],
        "discount_percent": metrics['discount_percent'],
        "is_best_in_month": metrics['is_best_in_month'],
        "next_deal_prediction": metrics['next_deal_prediction'],
        "last_update": metrics['last_update']
    }

    try:
        response = supabase.table("products").upsert(data_payload, on_conflict="kupi_id").execute()
        print(f"✅ Uloženo: {product_info['name']} (Balení: {product_info.get('amount')}{product_info.get('unit')}, Cena: {product_info.get('shelf_price')})")
    except Exception as e:
        print(f"❌ Chyba DB: {e}")