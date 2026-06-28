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
            
        # Reverted to the glorious bulk-import endpoint since it is now deployed
        import_url = f"{self.base_url}/Products/bulk-import"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {"products": products_list}
        
        try:
            # Sending the array of products to the CQRS Bulk Import handler
            response = requests.post(import_url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                return {"error": f"Status {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": "Network Failure", "details": str(e)}