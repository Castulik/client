from datetime import datetime, timedelta

def analyze_price_history(history_data):
    """
    Vypočítá metriky vč. záporných hodnot pro zdražení a najde nejbližší budoucí slevu.
    """
    if not history_data:
        return None

    # 1. Získání a seřazení dat
    min_prices = history_data.get('min_price', [])
    regular_prices = history_data.get('regular_price', [])
    
    if not min_prices: return None

    min_prices.sort(key=lambda x: x['date'])
    
    # 2. Určení "Dneška" a "Budoucnosti"
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # Zkusíme najít záznam pro dnešní den
    current_index = -1
    for i, item in enumerate(min_prices):
        if item['date'] == today_str:
            current_index = i
            break
    
    # Pokud dnešek v datech není (např. chyba), vezmeme poslední záznam
    if current_index == -1:
        current_index = len(min_prices) - 1

    current_record = min_prices[current_index]
    current_price = current_record['price']
    current_date = current_record['date']

    # Získáme běžnou cenu (poslední známou)
    current_regular_price = regular_prices[-1]['price'] if regular_prices else current_price

    # 3. Historická analýza (posledních 30 dní OD DNEŠKA DOZADU)
    last_date_obj = datetime.strptime(current_date, "%Y-%m-%d").date()
    start_date_obj = last_date_obj - timedelta(days=30)
    
    # Bereme jen data do dneška (historii), ne budoucnost
    past_30_days_prices = [
        item['price'] for item in min_prices[:current_index+1] 
        if datetime.strptime(item['date'], "%Y-%m-%d").date() >= start_date_obj
    ]
    
    month_low = min(past_30_days_prices) if past_30_days_prices else current_price

    # 4. VÝPOČET SLEVY / ZDRAŽENÍ (i záporné)
    discount_vs_regular = 0.0
    if current_regular_price > 0:
        # Vzorec: (Běžná - Aktuální) / Běžná * 100
        discount_vs_regular = round(((current_regular_price - current_price) / current_regular_price) * 100, 1)

    # 5. SKÓROVÁNÍ (Deal Score -10 až +10)
    score = 0
    
    if discount_vs_regular >= 0:
        # Kladné skóre pro slevy
        if discount_vs_regular >= 50: score = 10
        elif discount_vs_regular >= 40: score = 9
        elif discount_vs_regular >= 30: score = 8
        elif discount_vs_regular >= 20: score = 6
        elif discount_vs_regular >= 10: score = 4
        else: score = 2
        
        # Bonus za historické dno
        if current_price <= (month_low + 0.05):
            score += 1
    else:
        # Záporné skóre pro zdražení
        score = round(discount_vs_regular / 10) # -25% -> -2

    # Ořezání skóre na rozsah -10 až 10
    score = max(-10, min(10, score))

    # 6. FUTURE LOOKAHEAD (Hledáme budoucí slevu)
    next_deal = None
    
    # Procházíme záznamy od zítřka dále
    future_records = min_prices[current_index+1:]
    
    for item in future_records:
        # Pokud najdeme cenu nižší než je ta dnešní
        if item['price'] < current_price:
            days_diff = (datetime.strptime(item['date'], "%Y-%m-%d").date() - last_date_obj).days
            saving = round(current_price - item['price'], 2)
            
            next_deal = {
                "date": item['date'],
                "price": item['price'],
                "days_to_wait": days_diff,
                "saving_amount": saving
            }
            break 

    return {
        "current_price_per_unit": current_price,
        "regular_price_per_unit": current_regular_price,
        "month_low_per_unit": month_low,
        "discount_percent": discount_vs_regular,
        "deal_score": score,
        "is_best_in_month": current_price <= (month_low + 0.05),
        "next_deal_prediction": next_deal,
        "last_update": current_date
    }