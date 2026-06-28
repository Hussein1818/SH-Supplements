import os
from dotenv import load_dotenv

# Load environment variables securely
load_dotenv()

class Config:
    API_BASE_URL = os.getenv("API_BASE_URL")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
    TARGET_SCRAPE_URL = os.getenv("TARGET_SCRAPE_URL")