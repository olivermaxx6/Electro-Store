from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import models
from adminpanel.models import ChatRoom, ChatMessage


class Command(BaseCommand):
    help = 'Clean up duplicate chat rooms for users'

    def handle(self, *args, **options):
        self.stdout.write('Cleaning up duplicate chat rooms...')
        
        # Find users with multiple chat rooms
        users_with_multiple_rooms = User.objects.filter(
            chat_rooms__isnull=False
        ).annotate(
            room_count=models.Count('chat_rooms')
        ).filter(room_count__gt=1)
        
        cleaned_count = 0
        
        for user in users_with_multiple_rooms:
            # Get all chat rooms for this user
            user_rooms = ChatRoom.objects.filter(user=user).order_by('-last_message_at')
            
            if user_rooms.count() > 1:
                # Keep the most recent room (first one)
                keep_room = user_rooms.first()
                
                # Move all messages from other rooms to the keep room
                other_rooms = user_rooms.exclude(id=keep_room.id)
                
                for room in other_rooms:
                    # Move messages
                    messages = room.messages.all()
                    for message in messages:
                        message.room = keep_room
                        message.save()
                    
                    # Delete the duplicate room
                    room.delete()
                    cleaned_count += 1
                
                self.stdout.write(f'Cleaned up {other_rooms.count()} duplicate rooms for user {user.username}')
        
        # Also clean up anonymous rooms with same session
        anonymous_rooms = ChatRoom.objects.filter(user__isnull=True).values('customer_session').annotate(
            count=models.Count('id')
        ).filter(count__gt=1)
        
        for session_data in anonymous_rooms:
            session_key = session_data['customer_session']
            rooms = ChatRoom.objects.filter(customer_session=session_key).order_by('-last_message_at')
            
            if rooms.count() > 1:
                keep_room = rooms.first()
                other_rooms = rooms.exclude(id=keep_room.id)
                
                for room in other_rooms:
                    # Move messages
                    messages = room.messages.all()
                    for message in messages:
                        message.room = keep_room
                        message.save()
                    
                    # Delete the duplicate room
                    room.delete()
                    cleaned_count += 1
                
                self.stdout.write(f'Cleaned up {other_rooms.count()} duplicate anonymous rooms for session {session_key}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully cleaned up {cleaned_count} duplicate chat rooms')
        )
