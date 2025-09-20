import requests
import json

def test_login():
    try:
        response = requests.post(
            'http://127.0.0.1:8001/api/login', 
            json={'username': 'xyz@gmail.com', 'password': 'Google1233'},
            timeout=30
        )
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            print(f'Response: {response.json()}')
        else:
            print(f'Error Response: {response.text}')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    test_login()
