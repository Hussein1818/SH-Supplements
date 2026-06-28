import json
import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

class MuscleAndStrengthParser:
    def __init__(self):
        self.target_urls = [
            "https://www.muscleandstrength.com/store/category/protein.html",
            "https://www.muscleandstrength.com/store/category/creatine.html",
            "https://www.muscleandstrength.com/store/category/pre-workout.html",
            "https://www.muscleandstrength.com/store/category/bcaas.html",
            "https://www.muscleandstrength.com/store/category/fat-loss.html",
            "https://www.muscleandstrength.com/store/category/vitamins-minerals.html",
            "https://www.muscleandstrength.com/store/category/weight-gainers.html"
        ]

    def scrape_products(self):
        products_dto_list = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            page.set_extra_http_headers({
                'Accept-Language': 'en-US,en;q=0.9'
            })

            for url in self.target_urls:
                category_slug = url.split('/')[-1].replace('.html', '').replace('-', ' ').title()
                print(f"      -> Scraping Muscle & Strength via Headless Browser: {category_slug}...")
                try:
                    # Wait for DOM to load fully to extract HTML properly if JSON-LD is missing
                    page.goto(url, wait_until="domcontentloaded", timeout=45000)
                    
                    soup = BeautifulSoup(page.content(), 'html.parser')
                    scripts = soup.find_all('script', type='application/ld+json')
                    data_found = False
                    
                    for script in scripts:
                        if not script.string:
                            continue
                        try:
                            data = json.loads(script.string)
                            if data.get('@type') == 'ItemList':
                                items = data.get('itemListElement', [])
                                for list_item in items:
                                    product = list_item.get('item', {})
                                    if product.get('@type') == 'Product':
                                        data_found = True
                                        name = product.get('name', 'Global Product')
                                        offers = product.get('offers', {})
                                        price = float(offers.get('price', 0.0)) if isinstance(offers, dict) else 0.0
                                        
                                        if price == 0.0:
                                            continue

                                        products_dto_list.append({
                                            "name": name[:200],
                                            "description": f"Imported {name}",
                                            "price": price * 50, 
                                            "discountPrice": None,
                                            "stockQuantity": 200,
                                            "flavor": "Unflavored",
                                            "servings": 60,
                                            "ingredients": "International standard ingredients.",
                                            "warnings": "Follow dosage instructions.",
                                            "expiryDate": "2027-12-31T00:00:00Z",
                                            "isFlashSale": False,
                                            "goal": 2,
                                            "categoryName": category_slug,
                                            "categoryDescription": f"Imported {category_slug}",
                                            "brandName": product.get('brand', {}).get('name', 'Global Brand') if isinstance(product.get('brand'), dict) else "Global Brand",
                                            "brandCountryOfOrigin": "USA",
                                            "activeIngredients": [],
                                            "dosageGuides": [],
                                            "images": [{"imageUrl": product.get('image', ''), "isMainImage": True}] if product.get('image') else []
                                        })
                        except json.JSONDecodeError:
                            continue
                            
                    # Robust DOM Fallback for websites hiding JSON-LD
                    if not data_found:
                        product_cards = soup.find_all(['div', 'li'], class_=lambda x: x and 'product' in str(x).lower())
                        for card in product_cards:
                            name_elem = card.find(['h2', 'h3', 'a', 'div'], class_=lambda x: x and ('title' in str(x).lower() or 'name' in str(x).lower()))
                            price_elem = card.find(['span', 'div'], class_=lambda x: x and 'price' in str(x).lower())
                            
                            # Extract Image URL safely
                            img_elem = card.find('img')
                            img_url = ""
                            if img_elem:
                                img_url = img_elem.get('data-src') or img_elem.get('src') or ""
                            
                            if name_elem and price_elem:
                                price_text = price_elem.text.strip()
                                
                                # Use Regex to extract the correct decimal number directly
                                match = re.search(r'\d+\.\d+', price_text)
                                if match:
                                    clean_price = float(match.group())
                                else:
                                    clean_price = float(''.join(c for c in price_text if c.isdigit()) or 0)
                                    
                                if clean_price > 0:
                                    products_dto_list.append({
                                        "name": name_elem.text.strip()[:200],
                                        "description": f"Imported {name_elem.text.strip()}",
                                        "price": clean_price * 50,
                                        "discountPrice": None,
                                        "stockQuantity": 200,
                                        "flavor": "Unflavored",
                                        "servings": 60,
                                        "ingredients": "International standard.",
                                        "warnings": "Follow dosage instructions.",
                                        "expiryDate": "2027-12-31T00:00:00Z",
                                        "isFlashSale": False,
                                        "goal": 2,
                                        "categoryName": category_slug,
                                        "categoryDescription": f"Imported {category_slug}",
                                        "brandName": "Global Brand",
                                        "brandCountryOfOrigin": "USA",
                                        "activeIngredients": [],
                                        "dosageGuides": [],
                                        "images": [{"imageUrl": img_url, "isMainImage": True}] if img_url else []
                                    })
                except Exception as e:
                    print(f"[MuscleAndStrengthParser] Error on {url}: {e}")
                    continue
                    
            browser.close()
            
        return products_dto_list