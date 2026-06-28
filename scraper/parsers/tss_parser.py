import json
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

class TssParser:
    def __init__(self):
        # Updated to the correct active domain
        self.target_urls = [
            "https://thesupplementshop.com.eg/collections/proteins",
            "https://thesupplementshop.com.eg/collections/creatine",
            "https://thesupplementshop.com.eg/collections/pre-workout"
        ]

    def scrape_products(self):
        products_dto_list = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers({'Accept-Language': 'en-US,en;q=0.9'})

            for url in self.target_urls:
                category_slug = url.split('/')[-1].replace('-', ' ').title()
                print(f"      -> Scraping TSS via Headless Browser: {category_slug}...")
                try:
                    # Changed to domcontentloaded to avoid infinite tracking script timeouts
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
                                    name = item.get('name', 'TSS Product')
                                    
                                    offers = item.get('offers', {})
                                    price = float(offers.get('price', 0.0)) if isinstance(offers, dict) else 0.0
                                    
                                    if price == 0.0:
                                        continue

                                    product_dto = {
                                        "name": name[:200],
                                        "description": item.get('description', f"Premium {name}")[:500],
                                        "price": price,
                                        "discountPrice": None,
                                        "stockQuantity": 50,
                                        "flavor": "Multiple Flavors",
                                        "servings": 30,
                                        "ingredients": "See packaging for details.",
                                        "warnings": "Consult a physician before use.",
                                        "expiryDate": "2027-12-31T00:00:00Z",
                                        "isFlashSale": False,
                                        "goal": 2, 
                                        "categoryName": category_slug,
                                        "categoryDescription": f"High quality {category_slug}",
                                        "brandName": item.get('brand', {}).get('name', 'TSS Brands') if isinstance(item.get('brand'), dict) else "Unknown",
                                        "brandCountryOfOrigin": "Egypt",
                                        "activeIngredients": [],
                                        "dosageGuides": [],
                                        "images": []
                                    }
                                    
                                    image_data = item.get('image')
                                    if isinstance(image_data, str):
                                        product_dto["images"].append({"imageUrl": image_data, "isMainImage": True})
                                    
                                    products_dto_list.append(product_dto)
                        except json.JSONDecodeError:
                            continue
                            
                    # Robust DOM Fallback if JSON-LD fails
                    if not data_found:
                        product_cards = soup.find_all('div', class_=['product-card', 'grid-product'])
                        for card in product_cards:
                            name_elem = card.find(['div', 'h3'], class_=lambda x: x and 'title' in x.lower())
                            price_elem = card.find(['span', 'div'], class_=lambda x: x and 'price' in x.lower())
                            
                            if name_elem and price_elem:
                                price_text = price_elem.text.strip()
                                clean_price = float(''.join(c for c in price_text if c.isdigit() or c == '.') or 0)
                                if clean_price > 0:
                                    products_dto_list.append({
                                        "name": name_elem.text.strip()[:200],
                                        "description": f"Imported {name_elem.text.strip()}",
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
                                        "categoryDescription": f"High quality {category_slug}",
                                        "brandName": "TSS Local",
                                        "brandCountryOfOrigin": "Egypt",
                                        "activeIngredients": [],
                                        "dosageGuides": [],
                                        "images": []
                                    })
                except Exception as e:
                    print(f"[TssParser] Error on {url}: {e}")
                    continue
                    
            browser.close()
        return products_dto_list