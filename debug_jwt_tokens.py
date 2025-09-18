#!/usr/bin/env python3
"""
Debug script to help diagnose JWT token issues.
This script helps verify token structure and validity.
"""

import json
import base64
import sys
from datetime import datetime

def decode_jwt_payload(token):
    """Decode JWT payload without verification (for debugging)"""
    try:
        # Split token into parts
        parts = token.split('.')
        if len(parts) != 3:
            return None, "Invalid JWT format (not 3 parts)"
        
        # Decode payload (add padding if needed)
        payload = parts[1]
        # Add padding if needed
        payload += '=' * (4 - len(payload) % 4)
        
        # Decode base64
        decoded = base64.urlsafe_b64decode(payload)
        payload_data = json.loads(decoded)
        
        return payload_data, None
    except Exception as e:
        return None, f"Error decoding JWT: {e}"

def check_token_validity(token):
    """Check if token is valid and what type it is"""
    payload, error = decode_jwt_payload(token)
    if error:
        return False, error, None
    
    # Check token type
    token_type = payload.get('token_type', 'unknown')
    
    # Check expiration
    exp = payload.get('exp')
    if exp:
        exp_time = datetime.fromtimestamp(exp)
        now = datetime.now()
        is_expired = now > exp_time
        exp_status = f"expired at {exp_time}" if is_expired else f"valid until {exp_time}"
    else:
        is_expired = False
        exp_status = "no expiration set"
    
    # Check user info
    user_id = payload.get('user_id', 'unknown')
    
    return not is_expired, exp_status, {
        'token_type': token_type,
        'user_id': user_id,
        'exp': exp,
        'exp_time': exp_time if exp else None,
        'is_expired': is_expired
    }

def main():
    """Main function to debug JWT tokens"""
    print("JWT Token Debugger")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        token = sys.argv[1]
    else:
        token = input("Enter JWT token to debug: ").strip()
    
    if not token:
        print("No token provided")
        return
    
    print(f"Token: {token[:50]}...")
    print()
    
    # Decode and analyze token
    payload, error = decode_jwt_payload(token)
    if error:
        print(f"❌ Error: {error}")
        return
    
    print("📋 Token Payload:")
    print(json.dumps(payload, indent=2, default=str))
    print()
    
    # Check validity
    is_valid, exp_status, details = check_token_validity(token)
    
    print("🔍 Token Analysis:")
    print(f"  Token Type: {details['token_type']}")
    print(f"  User ID: {details['user_id']}")
    print(f"  Expiration: {exp_status}")
    print(f"  Valid: {'✅ Yes' if is_valid else '❌ No'}")
    print()
    
    # Recommendations
    print("💡 Recommendations:")
    if details['token_type'] != 'access':
        print("  ❌ This is not an access token. Use an access token for WebSocket connections.")
    elif details['is_expired']:
        print("  ❌ Token is expired. Please log in again to get a fresh token.")
    elif is_valid:
        print("  ✅ Token looks valid for WebSocket connections.")
    
    print()
    print("🔧 For WebSocket connections:")
    print("  - Use only ACCESS tokens (not refresh tokens)")
    print("  - Don't include 'Bearer ' prefix in query parameters")
    print("  - Ensure token is not expired")

if __name__ == "__main__":
    main()
