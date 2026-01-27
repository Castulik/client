#!/usr/bin/env python
# kupi.cz web scraper for scraping sales into JSON
import requests
from bs4 import BeautifulSoup
from kupiapi.text_parser import TextParser
import json
import re                        # <--- PŘIDAT
from datetime import datetime, timedelta   # <--- PŘIDAT
import statistics


class KupiScraper:
    def __init__(self):
        self.url = 'https://www.kupi.cz'
        self.text_parser = TextParser()
        self.clean_text = self.text_parser.clean_text
        self.check_url = self.text_parser.check_url
        
    
    def __get_products_info(self, url:str, category:str=None, from_search:bool=False, max_pages:int=5):
        """
        Private method for scraping products from given url.

        Args:
            url (str): URL of page with products
            from_search (bool): If True, the requests comes from search method (get discounts by search). Defaults to False.

        Returns:
            str: JSON string with list of dictionaries, each containing product info
        """
        response = requests.get(url)

        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            page = 1
            product_list = []
            end = False
            
            # goes through pages of all products
            # terminates when there is no more pages of products
            while not(end):
                products = soup.find_all('div', class_='group_discounts')
                if products == []:
                    end = True
                    break
    
                for product in products:
                    name = product.find('div', class_='product_name')
                    name = name.find('strong').text.strip()
                                    
                    try:
                        discounts_table = product.find('div', class_='discounts_table')
                    except:
                        end = True
                        break
                    try:
                        shops = discounts_table.find_all('span', class_='discounts_shop_name')
                    except:
                        end = True
                        break
                    
                    product_data = discounts_table.find_all('div', class_='discount_row')
                    
                    
                    # data about product (price, amount, discount validity)
                    prices = []
                    amounts = []
                    validities = []
                    for pd in product_data:
                        
                        try:
                            prices.append(self.clean_text(pd.find(class_='discount_price_value').text))
                        except:
                            prices.append(None)
                        
                        try:
                            amounts.append(self.clean_text(pd.find(class_='discount_amount').text))
                        except:
                            amounts.append(None)
                            
                        try:
                            validities.append(self.clean_text(pd.find('div',class_='discounts_validity').text))
                        except:
                            validities.append(None)
                                                                                
                    product_list.append({
                        'name': name,
                        'category': category,  ## <--- ZMĚNA: Zde se ukládá kategorie k produktu
                        'shops': [self.clean_text(shop.text) for shop in shops],
                        'prices': prices,
                        'amounts': amounts,
                        'validities': validities
                    })
                    
                if end:
                    break
            
                if max_pages != 0:
                    if page >= max_pages:
                        end = True
                        break
                
                page += 1
                new_url = url + '&page=' + str(page) if from_search else url + '?page=' + str(page)
                #print(new_url)
                response = requests.get(new_url)
                
                if self.check_url(response.url) == False:
                    end = True
                    break
                
                soup = BeautifulSoup(response.content, 'html.parser')                            
                
                
                    
            return json.dumps(product_list, ensure_ascii=False)
        else:
            return json.dumps([])
        

    
    def get_discounts_by_category(self, category:str, max_pages:int=0):
        """
        Gets discounts by category.

        Args:
            category (str): The category name of the discounts to get.
            max_pages (int): The maximum number of pages to scrape. Defaults to 0 (means all pages).

        Returns:
            str: A JSON string containing the discounts by category.
        """
        url = self.url + '/slevy/' + category
        return self.__get_products_info(url, max_pages=max_pages,category=category)
        
    def get_discounts_by_search(self, search:str, max_pages:int=0):
        """
        Gets discounts by search.

        Args:
            search (str): The search query to use to find the product.
            max_pages (int): The maximum number of pages to scrape. Defaults to 0 (means all pages).

        Returns:
            str: A JSON string containing the discounts by search.
        """
        
        url = self.url + '/hledej?f=' + search + "&vse=0" #vse=0 means only discounts
        return self.__get_products_info(url, from_search=True, max_pages=max_pages)
        
    def get_discounts_by_shop(self, shop:str, max_pages:int=0):
        """
        Gets discounts by shop.

        Args:
            shop (str): The shop name (e.g. Lidl) of the discounts to get.
            max_pages (int): The maximum number of pages to scrape. Defaults to 0 (means all pages).

        Returns:
            str: A JSON string containing the discounts by shop.
        """
        url = self.url + '/slevy/' + shop
        return self.__get_products_info(url, max_pages=max_pages)
       
        
    def get_discounts_by_category_shop(self, category:str, shop:str, max_pages:int=0):
        """
        Gets discounts by category and shop.

        Args:
            category (str): The category name of the discounts to get.
            shop (str): The shop name (e.g. Lidl) of the discounts to get.
            max_pages (int): The maximum number of pages to scrape. Defaults to 0 (means all pages).

        Returns:
            str: A JSON string containing the discounts by category and shop.
        """
        url = self.url + '/slevy/' + category + '/' + shop
        return self.__get_products_info(url, max_pages=max_pages)
    
    def get_categories(self):
        response = requests.get('https://www.kupi.cz/slevy')

        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            categories_div = soup.find('div', class_='categories')
            
            categories_a = categories_div.find_all('a', class_='category_item')
            
            categories = [self.clean_text(c['href']).split('/')[-1] for c in categories_a]
            
            return json.dumps(categories)
            
        else:
            return json.dumps([])


    def get_price_history(self, product_url: str):
        # 1. Session a hlavičky (funguje správně)
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8',
            'Upgrade-Insecure-Requests': '1'
        })

        print(f"🔍 1. Krok: Získávám ID a Cookies z: {product_url}")
        response = session.get(product_url)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.content, 'html.parser')
        product_id_tag = soup.find('input', {'id': 'product_id'})
        if not product_id_tag:
            return None
            
        product_id = product_id_tag.get('value')
        print(f"✅ ID produktu: {product_id}")

        # 2. Volání API (funguje správně)
        api_url = "https://www.kupi.cz/graph"
        session.headers.update({
            'X-Requested-With': 'XMLHttpRequest',
            'X-Kupi': '1',
            'Referer': product_url,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://www.kupi.cz',
            'Accept': '*/*' 
        })
        
        payload = {'graph[product]': product_id}
        
        print(f"📥 2. Krok: Volám API...")
        api_response = session.post(api_url, data=payload)
        
        if api_response.status_code != 200:
            print(f"❌ Chyba API: {api_response.status_code}")
            return None

        # 3. ZPRACOVÁNÍ DAT (ZDE JE ZMĚNA)
        # Server vrací HTML/JS, ne JSON. Musíme to najít regexem v textu.
        content = api_response.text
        
        # Hledáme: var graph_data = { ... }
        match = re.search(r'var graph_data\s*=\s*(\{.*?\})\s*(?:,|;)', content, re.DOTALL)
        
        if not match:
            # Zkusíme ještě volnější regex, kdyby tam nebyl "var"
            match = re.search(r'graph_data\s*=\s*(\{.*?\})\s*(?:,|;)', content, re.DOTALL)

        if not match:
            print("❌ Data v odpovědi API nenalezena (Regex selhal).")
            # Pro jistotu si to ulož, ať vidíš, co přišlo
            # with open("debug_api_response.html", "w", encoding="utf-8") as f: f.write(content)
            return None

        try:
            json_str = match.group(1)
            data = json.loads(json_str)
            
            # --- PARSOVACÍ LOGIKA ---
            def parse_graph_string(raw_string):
                history = []
                if not raw_string: return history
                cleaned = raw_string.replace('], [', '|').replace('[', '').replace(']', '').replace('"', '')
                entries = cleaned.split('|')
                for entry in entries:
                    parts = entry.split(',')
                    if len(parts) >= 2:
                        try:
                            ts = int(parts[0].strip())
                            price = float(parts[1].strip())
                            if price > 0:
                                date_obj = datetime.fromtimestamp(ts / 1000).date()
                                history.append({"date": str(date_obj), "price": price})
                        except:
                            continue
                return history

            result = {
                "avg_price": parse_graph_string(data.get("avg", "")),
                "min_price": parse_graph_string(data.get("low", "")),
                "regular_price": parse_graph_string(data.get("bef", ""))
            }
            
            print("🎉 ÚSPĚCH! Historie cen stažena.")
            return result

        except Exception as e:
            print(f"❌ Chyba při zpracování dat: {e}")
            return None
        


    def analyze_price_history(self, history_data):
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
            # Příklad zdražení: (8 - 10) / 8 = -0.25 = -25%
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
            # Záporné skóre pro zdražení (lineárně)
            # Např. -20% sleva (zdražení) = skóre -2
            score = round(discount_vs_regular / 10) # -25% -> -2.5 -> -2 (int)

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
                break # Našli jsme nejbližší, končíme hledání

        return {
            "current_price_per_unit": current_price,
            "regular_price_per_unit": current_regular_price,
            "month_low_per_unit": month_low,
            "discount_percent": discount_vs_regular, # Může být záporné (zdražení)
            "deal_score": score,                     # Může být záporné
            "is_best_in_month": current_price <= (month_low + 0.05),
            "next_deal_prediction": next_deal,       # Zde bude info o zítřejší akci
            "last_update": current_date
        }