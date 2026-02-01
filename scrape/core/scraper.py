import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
from core.parsers import clean_text, clean_price, parse_amount 

class KupiScraper:
    def __init__(self):
        self.url = 'https://www.kupi.cz'
        
    def __get_products_info(self, url:str, category:str=None, from_search:bool=False, max_pages:int=5):
        response = requests.get(url)

        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            page = 1
            product_list = []
            end = False
            
            while not(end):
                products = soup.find_all('div', class_='group_discounts')
                if not products:
                    end = True
                    break
    
                for product in products:
                    name_div = product.find('div', class_='product_name')
                    if not name_div: continue
                    
                    name_tag = name_div.find('strong')
                    name = name_tag.text.strip() if name_tag else "Unknown"
                    
                    # Získání URL
                    link_tag = name_div.find('a')
                    product_url = self.url + link_tag['href'] if link_tag else None

                    # --- ZÍSKÁNÍ CENY A MNOŽSTVÍ ---
                    try:
                        # 1. Najdeme řádek s akcí
                        # Zde ponecháme 'div', protože discount_row bývá div, 
                        # ale pro jistotu to taky můžeme uvolnit.
                        discount_row = product.find(class_='discount_row')
                        
                        if not discount_row:
                            # Fallback: Kdyby náhodou struktura byla jiná
                            continue

                        # 1. Obchod
                        shop_tag = product.find('span', class_='discounts_shop_name')
                        shop = clean_text(shop_tag.text) if shop_tag else "Unknown"

                        # 2. Cena na regálu (Shelf Price)
                        # OPRAVA: Smazáno 'div', hledáme jakýkoliv tag s touto třídou
                        price_tag = discount_row.find(class_='discount_price_value')
                        raw_price = price_tag.text if price_tag else "0"
                        shelf_price = clean_price(raw_price)

                        # 3. Množství a Jednotka (Amount & Unit)
                        # OPRAVA: Smazáno 'div'
                        amount_tag = discount_row.find(class_='discount_amount')
                        raw_amount = amount_tag.text if amount_tag else ""
                        amount, unit = parse_amount(raw_amount)

                    except Exception as e:
                        print(f"⚠️ Chyba parsování u {name}: {e}")
                        continue
                    
                    # Uložíme info
                    product_list.append({
                        'name': name,
                        'product_url': product_url,
                        'category': category,
                        'shop': shop,
                        'shelf_price': shelf_price,
                        'amount': amount,
                        'unit': unit
                    })
                    
                if end: break
            
                if max_pages != 0 and page >= max_pages:
                    end = True
                    break
                
                page += 1
                new_url = url + ('&page=' if from_search else '?page=') + str(page)
                response = requests.get(new_url)
                
                if response.url != new_url and "page" not in response.url: 
                    end = True
                    break
                
                soup = BeautifulSoup(response.content, 'html.parser')                            
                    
            return json.dumps(product_list, ensure_ascii=False)
        else:
            return json.dumps([])

    def get_discounts_by_category(self, category:str, max_pages:int=0):
        url = self.url + '/slevy/' + category
        return self.__get_products_info(url, max_pages=max_pages, category=category)

    def get_price_history(self, product_url: str):
        """Získá historii cen přes API Kupi."""
        if not product_url: return None
        
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        })

        # 1. Získat ID ze stránky
        # print(f"🔍 Stahuji detail: {product_url}")
        try:
            response = session.get(product_url)
            if response.status_code != 200: return None
        except: return None

        soup = BeautifulSoup(response.content, 'html.parser')
        product_id_tag = soup.find('input', {'id': 'product_id'})
        
        if not product_id_tag: return None
        product_id = product_id_tag.get('value')

        # 2. Volat API
        api_url = "https://www.kupi.cz/graph"
        session.headers.update({
            'X-Requested-With': 'XMLHttpRequest',
            'X-Kupi': '1',
            'Referer': product_url,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        })
        
        try:
            api_response = session.post(api_url, data={'graph[product]': product_id})
            if api_response.status_code != 200: return None
            
            # 3. Parsovat data
            content = api_response.text
            match = re.search(r'(?:var\s+)?graph_data\s*=\s*(\{.*?\})\s*(?:,|;)', content, re.DOTALL)
            
            if not match: return None
            
            data = json.loads(match.group(1))
            
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
                        except: continue
                return history

            return {
                "id": product_id, # Vracíme i ID pro uložení do DB
                "min_price": parse_graph_string(data.get("low", "")),
                "regular_price": parse_graph_string(data.get("bef", ""))
            }
        except Exception as e:
            print(f"Error parsing graph: {e}")
            return None