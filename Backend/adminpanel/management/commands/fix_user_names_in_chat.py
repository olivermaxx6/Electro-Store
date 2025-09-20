from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from adminpanel.models import ChatRoom, ChatMessage


class Command(BaseCommand):
    help = 'Fix user names in chat rooms to show actual user names instead of Anonymous User'

    def handle(self, *args, **options):
        self.stdout.write('Fixing user names in chat rooms...')
        
        fixed_count = 0
        
        # Fix chat rooms with authenticated users
        rooms_with_users = ChatRoom.objects.filter(user__isnull=False)
        
        for room in rooms_with_users:
            user = room.user
            
            # Determine the best name to use
            if user.first_name and user.last_name:
                new_name = f"{user.first_name} {user.last_name}"
            elif user.first_name:
                new_name = user.first_name
            elif user.username:
                new_name = user.username
            else:
                new_name = user.email.split('@')[0] if user.email else 'User'
            
            # Update room if needed
            if room.customer_name != new_name:
                old_name = room.customer_name
                room.customer_name = new_name
                room.customer_email = user.email
                room.save()
                
                # Update all messages from this user
                messages = room.messages.filter(sender_type='customer')
                for message in messages:
                    if message.sender_name == old_name or message.sender_name == 'Anonymous User':
                        message.sender_name = new_name
                        message.save()
                
                self.stdout.write(f'Fixed room {room.id}: "{old_name}" → "{new_name}"')
                fixed_count += 1
        
        # Fix anonymous rooms that might have user info
        anonymous_rooms = ChatRoom.objects.filter(user__isnull=True, customer_name='Anonymous User')
        
        for room in anonymous_rooms:
            # Check if there are any messages with better sender names
            messages = room.messages.filter(sender_type='customer').exclude(sender_name='Anonymous User')
            if messages.exists():
                # Use the most common sender name
                sender_names = messages.values_list('sender_name', flat=True).distinct()
                if sender_names:
                    new_name = sender_names[0]  # Use first non-anonymous name
                    room.customer_name = new_name
                    room.save()
                    
                    self.stdout.write(f'Fixed anonymous room {room.id}: "Anonymous User" → "{new_name}"')
                    fixed_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} chat rooms')
        )
        
        # Show current status
        self.stdout.write('\nCurrent chat room status:')
        recent_rooms = ChatRoom.objects.all().order_by('-last_message_at')[:5]
        for room in recent_rooms:
            user_info = f" (User: {room.user.username})" if room.user else " (Anonymous)"
            self.stdout.write(f'  - {room.customer_name}{user_info} - {room.last_message_at.strftime("%H:%M:%S")}')
