#!/usr/bin/env python3
"""
Test script to verify WebSocket authentication fixes.
This script tests the JWT middleware and WebSocket connections.
"""

import asyncio
import json
import logging
import websockets
from urllib.parse import urlencode

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test configuration
WS_HOST = "127.0.0.1"
WS_PORT = 8001
ADMIN_WS_URL = f"ws://{WS_HOST}:{WS_PORT}/ws/admin/chat/"
CUSTOMER_WS_URL = f"ws://{WS_HOST}:{WS_PORT}/ws/chat/test-room/"

# Test tokens (you'll need to replace these with real tokens from your login)
VALID_ACCESS_TOKEN = "your_valid_access_token_here"
INVALID_TOKEN = "invalid_token"
REFRESH_TOKEN = "your_refresh_token_here"  # Should be rejected

async def test_admin_ws_with_valid_token():
    """Test admin WebSocket with valid access token"""
    logger.info("Testing admin WS with valid access token...")
    
    url = f"{ADMIN_WS_URL}?token={VALID_ACCESS_TOKEN}"
    try:
        async with websockets.connect(url) as websocket:
            logger.info("✅ Admin WS connected successfully with valid token")
            
            # Send a test message
            await websocket.send(json.dumps({
                "type": "admin_message",
                "room_id": "test-room",
                "content": "Test message from admin"
            }))
            
            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            logger.info(f"✅ Received response: {response}")
            
    except websockets.exceptions.ConnectionClosed as e:
        logger.error(f"❌ Admin WS connection closed: {e.code} - {e.reason}")
    except Exception as e:
        logger.error(f"❌ Admin WS error: {e}")

async def test_admin_ws_with_invalid_token():
    """Test admin WebSocket with invalid token"""
    logger.info("Testing admin WS with invalid token...")
    
    url = f"{ADMIN_WS_URL}?token={INVALID_TOKEN}"
    try:
        async with websockets.connect(url) as websocket:
            logger.error("❌ Admin WS should not connect with invalid token")
    except websockets.exceptions.ConnectionClosed as e:
        if e.code == 4401:
            logger.info(f"✅ Admin WS correctly rejected invalid token: {e.code} - {e.reason}")
        else:
            logger.error(f"❌ Unexpected close code: {e.code} - {e.reason}")
    except Exception as e:
        logger.error(f"❌ Admin WS error: {e}")

async def test_admin_ws_with_refresh_token():
    """Test admin WebSocket with refresh token (should be rejected)"""
    logger.info("Testing admin WS with refresh token...")
    
    url = f"{ADMIN_WS_URL}?token={REFRESH_TOKEN}"
    try:
        async with websockets.connect(url) as websocket:
            logger.error("❌ Admin WS should not connect with refresh token")
    except websockets.exceptions.ConnectionClosed as e:
        if e.code == 4401:
            logger.info(f"✅ Admin WS correctly rejected refresh token: {e.code} - {e.reason}")
        else:
            logger.error(f"❌ Unexpected close code: {e.code} - {e.reason}")
    except Exception as e:
        logger.error(f"❌ Admin WS error: {e}")

async def test_admin_ws_with_bearer_prefix():
    """Test admin WebSocket with Bearer prefix (should be stripped)"""
    logger.info("Testing admin WS with Bearer prefix...")
    
    url = f"{ADMIN_WS_URL}?token=Bearer {VALID_ACCESS_TOKEN}"
    try:
        async with websockets.connect(url) as websocket:
            logger.info("✅ Admin WS connected successfully with Bearer prefix (stripped)")
    except websockets.exceptions.ConnectionClosed as e:
        logger.error(f"❌ Admin WS connection closed: {e.code} - {e.reason}")
    except Exception as e:
        logger.error(f"❌ Admin WS error: {e}")

async def test_customer_ws_anonymous():
    """Test customer WebSocket without token (should work)"""
    logger.info("Testing customer WS without token...")
    
    try:
        async with websockets.connect(CUSTOMER_WS_URL) as websocket:
            logger.info("✅ Customer WS connected successfully without token")
            
            # Send a test message
            await websocket.send(json.dumps({
                "type": "chat_message",
                "content": "Test message from customer"
            }))
            
            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            logger.info(f"✅ Received response: {response}")
            
    except websockets.exceptions.ConnectionClosed as e:
        logger.error(f"❌ Customer WS connection closed: {e.code} - {e.reason}")
    except Exception as e:
        logger.error(f"❌ Customer WS error: {e}")

async def test_admin_ws_without_token():
    """Test admin WebSocket without token (should be rejected)"""
    logger.info("Testing admin WS without token...")
    
    try:
        async with websockets.connect(ADMIN_WS_URL) as websocket:
            logger.error("❌ Admin WS should not connect without token")
    except websockets.exceptions.ConnectionClosed as e:
        if e.code == 4401:
            logger.info(f"✅ Admin WS correctly rejected connection without token: {e.code} - {e.reason}")
        else:
            logger.error(f"❌ Unexpected close code: {e.code} - {e.reason}")
    except Exception as e:
        logger.error(f"❌ Admin WS error: {e}")

async def main():
    """Run all tests"""
    logger.info("Starting WebSocket authentication tests...")
    logger.info("=" * 50)
    
    # Note: You need to replace the test tokens with real ones from your login
    if VALID_ACCESS_TOKEN == "your_valid_access_token_here":
        logger.warning("⚠️  Please update VALID_ACCESS_TOKEN with a real access token from your login")
        logger.warning("⚠️  You can get this by logging into the admin panel and checking localStorage.access_token")
        return
    
    # Run tests
    await test_customer_ws_anonymous()
    await test_admin_ws_without_token()
    await test_admin_ws_with_invalid_token()
    await test_admin_ws_with_refresh_token()
    await test_admin_ws_with_bearer_prefix()
    await test_admin_ws_with_valid_token()
    
    logger.info("=" * 50)
    logger.info("WebSocket authentication tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
