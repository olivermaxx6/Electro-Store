#!/usr/bin/env python3
"""
Test the AdminChatConsumer directly to debug the issue.
"""

import os
import sys
import django
import asyncio
import json
from unittest.mock import Mock

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.consumers import AdminChatConsumer
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async

async def test_admin_consumer():
    """Test AdminChatConsumer directly"""
    print("🧪 Testing AdminChatConsumer Directly")
    print("=" * 40)
    
    # Get admin user
    try:
        admin_user = await sync_to_async(User.objects.get)(username='admin')
        print(f"✅ Found admin user: {admin_user.username} (is_staff: {admin_user.is_staff})")
    except User.DoesNotExist:
        print("❌ Admin user not found")
        return False
    
    # Create mock scope
    scope = {
        'path': '/ws/admin/chat/',
        'user': admin_user,
        'jwt_error': None,
        'query_string': b'token=test_token'
    }
    
    # Create consumer instance
    consumer = AdminChatConsumer()
    consumer.scope = scope
    
    # Mock channel layer
    consumer.channel_layer = Mock()
    consumer.channel_layer.group_add = Mock(return_value=None)
    consumer.channel_layer.group_discard = Mock(return_value=None)
    
    # Mock send method
    messages_sent = []
    async def mock_send(data):
        messages_sent.append(data)
        print(f"📤 Sent: {data}")
    
    consumer.send = mock_send
    
    # Mock accept
    consumer.accept = Mock(return_value=None)
    
    # Test connect method
    try:
        print("🔌 Testing connect method...")
        await consumer.connect()
        
        print(f"📊 Messages sent: {len(messages_sent)}")
        for i, msg in enumerate(messages_sent):
            print(f"   {i+1}. {msg}")
        
        # Check if room list was sent
        room_list_sent = any(msg.get('type') == 'room_list' for msg in messages_sent)
        if room_list_sent:
            print("✅ Room list sent successfully!")
            return True
        else:
            print("❌ Room list not sent")
            return False
            
    except Exception as e:
        print(f"❌ Connect method failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    print("🚀 AdminChatConsumer Debug Test")
    print("=" * 50)
    
    try:
        result = asyncio.run(test_admin_consumer())
        
        if result:
            print("\n✅ AdminChatConsumer working!")
        else:
            print("\n❌ AdminChatConsumer failed!")
            
        return result
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
