import requests
from config import Config

class ApiClient:
    def __init__(self):
        self.base_url = Config.API_BASE_URL
        self.token = None

    def authenticate(self):
        login_url = f"{self.base_url}/Auth/login"
        payload = {
            "usernameOrEmail": Config.ADMIN_EMAIL,
            "password": Config.ADMIN_PASSWORD
        }
        
        response = requests.post(login_url, json=payload)
        response.raise_for_status()
        
        self.token = response.json().get("token")
        return self.token

    def send_bulk_products(self, products_list):
        if not self.token:
            raise Exception("Unauthorized. Please authenticate first.")
            
        import_url = f"{self.base_url}/Products/bulk-import"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {"products": products_list}
        
        response = requests.post(import_url, json=payload, headers=headers)
        response.raise_for_status()
        
        return response.json()