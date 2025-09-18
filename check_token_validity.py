#!/usr/bin/env python3
"""
Script to check JWT token validity and structure.
Run this to verify tokens are properly formatted.
"""

import json
import sys
from datetime import datetime

def check_token_structure(token):
    """Check if token has the correct JWT structure"""
    if not token:
        return False, "Token is empty"
    
    parts = token.split('.')
    if len(parts) != 3:
        return False, f"Token should have 3 parts, got {len(parts)}"
    
    try:
        # Decode header (base64)
        import base64
        header = json.loads(base64.b64decode(parts[0] + '==').decode('utf-8'))
        payload = json.loads(base64.b64decode(parts[1] + '==').decode('utf-8'))
        
        print(f"Token header: {header}")
        print(f"Token payload: {payload}")
        
        # Check expiration
        if 'exp' in payload:
            exp_timestamp = payload['exp']
            exp_datetime = datetime.fromtimestamp(exp_timestamp)
            now = datetime.now()
            
            if exp_datetime < now:
                return False, f"Token expired at {exp_datetime}"
            else:
                return True, f"Token expires at {exp_datetime}"
        else:
            return True, "Token has no expiration (unusual)"
            
    except Exception as e:
        return False, f"Token decode error: {e}"

def main():
    """Check token validity"""
    print("🔍 JWT Token Validity Checker")
    print("=" * 40)
    
    # Get token from command line or prompt
    if len(sys.argv) > 1:
        token = sys.argv[1]
    else:
        token = input("Enter JWT token: ").strip()
    
    if not token:
        print("❌ No token provided")
        return 1
    
    print(f"Token: {token[:20]}...{token[-20:]}")
    
    is_valid, message = check_token_structure(token)
    
    if is_valid:
        print(f"✅ {message}")
        return 0
    else:
        print(f"❌ {message}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
