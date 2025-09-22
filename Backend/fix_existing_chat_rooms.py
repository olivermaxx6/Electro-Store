#!/usr/bin/env python3
"""
Script to fix existing chat rooms that show "Anonymous User"
This script will update existing chat rooms to show proper user identity.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import ChatRoom, ChatMessage
from django.contrib.auth.models import User

def fix_existing_chat_rooms():
    """Fix existing chat rooms to show proper user identity"""
    print("🔧 Fixing existing chat rooms...")
    
    # Get all chat rooms
    rooms = ChatRoom.objects.all()
    print(f"📊 Found {rooms.count()} chat rooms")
    
    fixed_count = 0
    
    for room in rooms:
        print(f"\n🔍 Checking room {room.id}")
        print(f"   Current customer_name: {room.customer_name}")
        print(f"   Current customer_email: {room.customer_email}")
        print(f"   Current user: {room.user}")
        
        # Check if room has messages
        messages = room.messages.all()
        print(f"   Messages count: {messages.count()}")
        
        # Look for messages with sender_user to identify the real user
        customer_messages = messages.filter(sender_type='customer', sender_user__isnull=False)
        
        if customer_messages.exists():
            # Found a customer message with a user
            first_customer_message = customer_messages.first()
            user = first_customer_message.sender_user
            
            print(f"   Found authenticated user: {user.username} ({user.email})")
            
            # Update room with user info
            if not room.user:
                room.user = user
            
            # Update customer name if it's still "Anonymous User" or empty
            if not room.customer_name or room.customer_name == 'Anonymous User' or room.customer_name == 'Anonymous':
                if user.first_name and user.last_name:
                    room.customer_name = f"{user.first_name} {user.last_name}"
                elif user.first_name:
                    room.customer_name = user.first_name
                elif user.username:
                    room.customer_name = user.username
                else:
                    room.customer_name = user.email
                
                print(f"   Updated customer_name to: {room.customer_name}")
            
            # Update customer email if not set
            if not room.customer_email:
                room.customer_email = user.email
                print(f"   Updated customer_email to: {room.customer_email}")
            
            room.save()
            fixed_count += 1
            print(f"   ✅ Room fixed!")
            
        else:
            print(f"   ⚠️  No authenticated user found for this room")
    
    print(f"\n🎯 Summary:")
    print(f"   Total rooms: {rooms.count()}")
    print(f"   Fixed rooms: {fixed_count}")
    print(f"   Unchanged rooms: {rooms.count() - fixed_count}")
    
    return fixed_count

def update_anonymous_messages():
    """Update messages that still show 'Anonymous' as sender_name"""
    print("\n🔧 Updating anonymous messages...")
    
    # Find messages with 'Anonymous' sender_name but have sender_user
    messages = ChatMessage.objects.filter(
        sender_name__in=['Anonymous', 'Anonymous User'],
        sender_user__isnull=False
    )
    
    print(f"📊 Found {messages.count()} messages to update")
    
    updated_count = 0
    
    for message in messages:
        user = message.sender_user
        print(f"   Updating message {message.id} from user {user.username}")
        
        # Update sender_name based on user info
        if user.first_name and user.last_name:
            new_sender_name = f"{user.first_name} {user.last_name}"
        elif user.first_name:
            new_sender_name = user.first_name
        elif user.username:
            new_sender_name = user.username
        else:
            new_sender_name = user.email
        
        message.sender_name = new_sender_name
        message.save()
        
        print(f"   Updated sender_name to: {new_sender_name}")
        updated_count += 1
    
    print(f"\n🎯 Message update summary:")
    print(f"   Updated messages: {updated_count}")
    
    return updated_count

def main():
    """Main function"""
    print("🚀 Chat Room Fix Script")
    print("=" * 40)
    
    try:
        # Fix chat rooms
        fixed_rooms = fix_existing_chat_rooms()
        
        # Update anonymous messages
        updated_messages = update_anonymous_messages()
        
        print("\n" + "=" * 40)
        print("🎉 FIX COMPLETE!")
        print("=" * 40)
        print(f"✅ Fixed {fixed_rooms} chat rooms")
        print(f"✅ Updated {updated_messages} messages")
        print("\n💡 Refresh the admin panel to see the changes!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
