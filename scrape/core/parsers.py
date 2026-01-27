import re
from datetime import date, timedelta

def clean_text(text):
    """Odstraní bílé znaky a vyčistí text."""
    if not text: return None
    return " ".join(text.split())

def clean_price(price_str):
    """Převede '12,90 Kč' na float 12.9."""
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
    
    # Hledáme číslo následované povolenou jednotkou
    match = re.search(r'(\d+[.]?\d*)\s*(g|kg|ml|l|ks)', text)
    if match:
        return float(match.group(1)), match.group(2)
    return None, None

def parse_date(date_str):
    """Převede 'zítra končí' nebo '1. 2.' na objekt data."""
    if not date_str: return None
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