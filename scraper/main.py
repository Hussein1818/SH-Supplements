from parsers.maxmuscle_parser import MaxMuscleParser
from parsers.tss_parser import TssParser
from parsers.muscleandstrength_parser import MuscleAndStrengthParser
from parsers.iherb_parser import IHerbParser
from api_client import ApiClient

def chunk_list(data_list, chunk_size):
    """Yield successive chunks from data_list to prevent server overload."""
    for i in range(0, len(data_list), chunk_size):
        yield data_list[i:i + chunk_size]

def main():
    try:
        print("1. Initializing Playwright Web Scrapers...")
        
        # Array of parser instances adhering to the exact same interface
        parsers = [
            MaxMuscleParser(),
            TssParser(),
            MuscleAndStrengthParser(),
            IHerbParser()
        ]

        all_scraped_products = []

        for parser in parsers:
            print(f"\n--> Executing Engine: {parser.__class__.__name__}...")
            products = parser.scrape_products()
            all_scraped_products.extend(products)
            print(f"    Total extracted by {parser.__class__.__name__}: {len(products)} products.")

        total_products = len(all_scraped_products)
        if total_products == 0:
            print("\n[Warning] No products found from any parser. Check network or site layout changes.")
            return

        print(f"\nTotal aggregated products extracted across all sites: {total_products}")
        print("\n2. Authenticating securely with the Backend API...")
        
        api_client = ApiClient()
        api_client.authenticate()
        print("--> Authentication successful. Token acquired.")

        print(f"\n3. Sending {total_products} products to bulk import API (CQRS Handler)...")
        
        # Senior Trick: Send in chunks of 150 to avoid MonsterASP timeout limits
        chunk_size = 150
        chunks = list(chunk_list(all_scraped_products, chunk_size))
        
        for index, chunk in enumerate(chunks, 1):
            print(f"--> Dispatching batch {index} of {len(chunks)} ({len(chunk)} products)...")
            result = api_client.send_bulk_products(chunk)
            print(f"    Batch {index} Result:", result)

        print("\n[SUCCESS] All products have been imported and securely saved in the database!")

    except Exception as e:
        print(f"\n[FATAL ERROR] An unexpected error occurred during the pipeline execution: {e}")

if __name__ == "__main__":
    main()