#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from adminpanel.models import ChatRoom, ChatMessage
import uuid

print("=== Creating Fresh Test Data ===")

# Clear existing test data
print("Clearing existing test data...")
ChatMessage.objects.all().delete()
ChatRoom.objects.filter(user__username__in=['alice_customer', 'bob_customer', 'charlie_customer', 'diana_customer']).delete()
User.objects.filter(username__in=['alice_customer', 'bob_customer', 'charlie_customer', 'diana_customer']).delete()

# Create fresh test users
print("Creating fresh test users...")
test_users_data = [
    {
        'username': 'alice_customer',
        'email': 'alice@test.com',
        'first_name': 'Alice',
        'last_name': 'Johnson',
        'password': 'alice123'
    },
    {
        'username': 'bob_customer', 
        'email': 'bob@test.com',
        'first_name': 'Bob',
        'last_name': 'Smith',
        'password': 'bob123'
    },
    {
        'username': 'charlie_customer',
        'email': 'charlie@test.com', 
        'first_name': 'Charlie',
        'last_name': 'Brown',
        'password': 'charlie123'
    },
    {
        'username': 'diana_customer',
        'email': 'diana@test.com',
        'first_name': 'Diana',
        'last_name': 'Wilson', 
        'password': 'diana123'
    }
]

created_users = []
for user_data in test_users_data:
    user = User.objects.create_user(
        username=user_data['username'],
        email=user_data['email'],
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        password=user_data['password']
    )
    created_users.append(user)
    print(f"✅ Created user: {user.username}")

# Create chat rooms for each user
print("Creating chat rooms...")
admin_user = User.objects.get(username='admin')

for user in created_users:
    room_id = str(uuid.uuid4())
    room = ChatRoom.objects.create(
        id=room_id,
        customer_name=f"{user.first_name} {user.last_name}",
        customer_email=user.email,
        customer_session=f"session_{user.id}",
        user=user,
        status='active'
    )
    print(f"✅ Created room {room_id} for {user.username}")

# Create some test messages
print("Creating test messages...")
test_messages = [
    ("alice_customer", "Hi admin! I need help with my order #12345"),
    ("alice_customer", "When will it be delivered?"),
    ("bob_customer", "Hello! I have a question about returns"),
    ("bob_customer", "What's your return policy?"),
    ("charlie_customer", "I'm having trouble with checkout"),
    ("charlie_customer", "The payment keeps failing"),
    ("diana_customer", "What are your shipping options?"),
    ("diana_customer", "Do you ship internationally?")
]

for username, message_content in test_messages:
    user = User.objects.get(username=username)
    room = ChatRoom.objects.get(user=user)
    
    message = ChatMessage.objects.create(
        room=room,
        sender_type='customer',
        sender_name=f"{user.first_name} {user.last_name}",
        sender_user=user,
        content=message_content,
        is_read=False
    )
    
    # Update room's last message time
    room.last_message_at = message.created_at
    room.save()
    
    print(f"✅ Created message from {user.first_name}: '{message_content}'")

# Add some admin responses
print("Creating admin responses...")
admin_responses = [
    ("alice_customer", "Hello Alice! I'll help you track your order."),
    ("bob_customer", "Hi Bob! Our return policy is 30 days."),
    ("charlie_customer", "Hello Charlie! Let me help you with checkout."),
    ("diana_customer", "Hi Diana! We ship worldwide.")
]

for username, response_content in admin_responses:
    user = User.objects.get(username=username)
    room = ChatRoom.objects.get(user=user)
    
    message = ChatMessage.objects.create(
        room=room,
        sender_type='admin',
        sender_name='Admin',
        sender_user=admin_user,
        content=response_content,
        is_read=True
    )
    
    # Update room's last message time
    room.last_message_at = message.created_at
    room.save()
    
    print(f"✅ Created admin response to {user.first_name}: '{response_content}'")

# Final verification
print("\n=== Final Verification ===")
total_users = User.objects.count()
total_rooms = ChatRoom.objects.count()
total_messages = ChatMessage.objects.count()

print(f"Total users: {total_users}")
print(f"Total chat rooms: {total_rooms}")
print(f"Total messages: {total_messages}")

print("\n=== Chat Rooms Summary ===")
rooms = ChatRoom.objects.filter(user__isnull=False).order_by('-last_message_at')
for room in rooms:
    user = room.user
    message_count = room.messages.count()
    unread_count = room.messages.filter(sender_type='customer', is_read=False).count()
    print(f"📱 {user.first_name} {user.last_name} ({user.email})")
    print(f"   Room: {room.id}")
    print(f"   Messages: {message_count} ({unread_count} unread)")
    print(f"   Status: {room.status}")
    print()

print("✅ Fresh test data created successfully!")
print("\n=== Login Credentials ===")
print("Admin: admin@example.com / admin123")
for user in created_users:
    password = user.username.split('_')[0] + '123'
    print(f"{user.first_name} {user.last_name}: {user.email} / {password}")

print("\n=== Next Steps ===")
print("1. Start the backend server: python manage.py runserver 127.0.0.1:8001")
print("2. Start the frontend")
print("3. Test admin login and check chat rooms")
print("4. Test user login and send messages")
print("5. Test admin responses")
