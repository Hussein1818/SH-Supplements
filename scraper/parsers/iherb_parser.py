import json
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

class IHerbParser:
    def __init__(self):
        self.target_urls = [
            "https://eg.iherb.com/c/sports-nutrition",
            "https://eg.iherb.com/c/creatine",
            "https://eg.iherb.com/c/pre-workout"
        ]

    def scrape_products(self):
        products_dto_list = []
        
        with sync_playwright() as p:
            browser = p.firefox.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers({'Accept-Language': 'en-US,en;q=0.9'})

            for url in self.target_urls:
                category_slug = url.split('/')[-1].replace('-', ' ').title()
                print(f"      -> Scraping iHerb via Headless Browser: {category_slug}...")
                
                try:
                    # Changed to domcontentloaded to prevent timeout from infinite background tracking APIs
                    page.goto(url, wait_until="domcontentloaded", timeout=45000)
                    
                    soup = BeautifulSoup(page.content(), 'html.parser')
                    scripts = soup.find_all('script', type='application/ld+json')
                    
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
                                        name = product.get('name', 'Global Product')
                                        offers = product.get('offers', {})
                                        price = float(offers.get('price', 0.0)) if isinstance(offers, dict) else 0.0
                                        
                                        if price == 0.0:
                                            continue

                                        products_dto_list.append({
                                            "name": name[:200],
                                            "description": product.get('description', f"Imported {name}")[:500],
                                            "price": price, 
                                            "discountPrice": None,
                                            "stockQuantity": 150,
                                            "flavor": "Unflavored",
                                            "servings": 30,
                                            "ingredients": "See label for details.",
                                            "warnings": "Follow instructions on packaging.",
                                            "expiryDate": "2027-12-31T00:00:00Z",
                                            "isFlashSale": False,
                                            "goal": 2,
                                            "categoryName": category_slug,
                                            "categoryDescription": f"iHerb {category_slug}",
                                            "brandName": product.get('brand', {}).get('name', 'iHerb Brands') if isinstance(product.get('brand'), dict) else "Unknown",
                                            "brandCountryOfOrigin": "USA",
                                            "activeIngredients": [],
                                            "dosageGuides": [],
                                            "images": [{"imageUrl": product.get('image', ''), "isMainImage": True}] if product.get('image') else []
                                        })
                        except json.JSONDecodeError:
                            continue
                except Exception as e:
                    print(f"[IHerbParser] Error on {url}: {e}")
                    continue
                    
            browser.close()
        return products_dto_list