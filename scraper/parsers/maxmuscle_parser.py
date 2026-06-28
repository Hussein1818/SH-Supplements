import json
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

class MaxMuscleParser:
    def __init__(self):
        self.target_urls = [
            "https://maxmuscleelite.com/category/proteins",
            "https://maxmuscleelite.com/category/creatine",
            "https://maxmuscleelite.com/category/pre-workout",
            "https://maxmuscleelite.com/category/amino-acids",
            "https://maxmuscleelite.com/category/weight-management",
            "https://maxmuscleelite.com/category/vitamins-health",
            "https://maxmuscleelite.com/category/mass-gainers"
        ]

    def scrape_products(self):
        products_dto_list = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers({'Accept-Language': 'en-US,en;q=0.9'})

            for url in self.target_urls:
                category_slug = url.split('/')[-1].replace('-', ' ').title()
                print(f"      -> Scraping MaxMuscle via Headless Browser: {category_slug}...")
                try:
                    # Changed to domcontentloaded to prevent infinite loading timeouts
                    page.goto(url, wait_until="domcontentloaded", timeout=45000)
                    
                    soup = BeautifulSoup(page.content(), 'html.parser')
                    scripts = soup.find_all('script', type='application/ld+json')
                    data_found = False
                    
                    for script in scripts:
                        if not script.string:
                            continue
                        try:
                            data = json.loads(script.string)
                            if isinstance(data, dict):
                                data = [data]
                                
                            for item in data:
                                if item.get('@type') == 'Product':
                                    data_found = True
                                    name = item.get('name', 'Unknown Product')
                                    
                                    offers = item.get('offers', {})
                                    price = float(offers.get('price', 0.0)) if isinstance(offers, dict) else 0.0
                                    
                                    if price == 0.0:
                                        continue

                                    product_dto = {
                                        "name": name[:200],
                                        "description": item.get('description', f"High quality {name}")[:500],
                                        "price": price,
                                        "discountPrice": None,
                                        "stockQuantity": 100,
                                        "flavor": "Unflavored",
                                        "servings": 30,
                                        "ingredients": "See label for details.",
                                        "warnings": "Keep out of reach of children.",
                                        "expiryDate": "2027-12-31T00:00:00Z",
                                        "isFlashSale": False,
                                        "goal": 2, 
                                        "categoryName": category_slug,
                                        "categoryDescription": f"Premium {category_slug}",
                                        "brandName": "Max Muscle", 
                                        "brandCountryOfOrigin": "Egypt",
                                        "activeIngredients": [],
                                        "dosageGuides": [],
                                        "images": [{"imageUrl": item.get('image', ''), "isMainImage": True}] if item.get('image') else []
                                    }
                                    products_dto_list.append(product_dto)
                        except json.JSONDecodeError:
                            continue

                    # Robust Fallback if JSON-LD is missing
                    if not data_found:
                        product_cards = soup.find_all(['div', 'li'], class_=lambda x: x and 'product' in str(x).lower())
                        for card in product_cards:
                            name_elem = card.find(['h2', 'h3', 'a'], class_=lambda x: x and ('title' in str(x).lower() or 'name' in str(x).lower()))
                            price_elem = card.find(['span', 'div'], class_=lambda x: x and 'price' in str(x).lower())
                            
                            if name_elem and price_elem:
                                price_text = price_elem.text.strip()
                                clean_price = float(''.join(c for c in price_text if c.isdigit() or c == '.') or 0)
                                if clean_price > 0:
                                    products_dto_list.append({
                                        "name": name_elem.text.strip()[:200],
                                        "description": f"Premium {name_elem.text.strip()}",
                                        "price": clean_price,
                                        "discountPrice": None,
                                        "stockQuantity": 50,
                                        "flavor": "Unflavored",
                                        "servings": 30,
                                        "ingredients": "See packaging.",
                                        "warnings": "Consult a physician before use.",
                                        "expiryDate": "2027-12-31T00:00:00Z",
                                        "isFlashSale": False,
                                        "goal": 2,
                                        "categoryName": category_slug,
                                        "categoryDescription": f"Premium {category_slug}",
                                        "brandName": "Max Muscle",
                                        "brandCountryOfOrigin": "Egypt",
                                        "activeIngredients": [],
                                        "dosageGuides": [],
                                        "images": []
                                    })
                except Exception as e:
                    print(f"[MaxMuscleParser] Error on {url}: {e}")
                    continue
                    
            browser.close()
        return products_dto_list