import urllib.request
import urllib.error
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_api(email, password):
    # Login
    login_url = "http://localhost:8080/api/auth/login"
    login_data = json.dumps({"email": email, "password": password}).encode('utf-8')
    req = urllib.request.Request(login_url, data=login_data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_data = json.loads(response.read().decode())
            token = res_data.get('token')
            print(f"[{email}] Login Success. Token: {token[:15]}...")
            
            # Hit Premium Route
            premium_url = "http://localhost:8080/api/ai/advanced"
            prem_req = urllib.request.Request(premium_url, headers={'Authorization': f'Bearer {token}'})
            try:
                with urllib.request.urlopen(prem_req, context=ctx) as p_res:
                    print(f"[{email}] Premium Access: Success ({p_res.status})")
            except urllib.error.HTTPError as e:
                print(f"[{email}] Premium Access: Blocked ({e.code} - {e.read().decode()})")
                
    except Exception as e:
        print(f"[{email}] Login Failed: {str(e)}")

print("Testing FREE User...")
test_api("free@test.com", "password123")

print("\nTesting PREMIUM User...")
test_api("premium@test.com", "password123")
