import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, ChatMessage

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for customer chat rooms"""
    
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send room info to client
        room_info = await self.get_room_info()
        await self.send(text_data=json.dumps({
            'type': 'room_info',
            'room': room_info
        }))
        
        logger.info(f"Customer connected to chat room {self.room_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        logger.info(f"Customer disconnected from chat room {self.room_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                content = data.get('content', '').strip()
                if content:
                    message = await self.save_message(content, 'customer')
                    if message:
                        # Send message to room group
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'chat_message',
                                'message': {
                                    'id': message['id'],
                                    'content': message['content'],
                                    'sender_type': message['sender_type'],
                                    'sender_name': message['sender_name'],
                                    'created_at': message['created_at'],
                                    'is_read': message['is_read']
                                }
                            }
                        )
                        
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error in receive: {e}")

    async def chat_message(self, event):
        """Receive message from room group"""
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def room_info(self, event):
        """Receive room info update"""
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_room_info(self):
        """Get room information"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return {
                'id': str(room.id),
                'customer_name': room.customer_name,
                'customer_email': room.customer_email,
                'status': room.status,
                'created_at': room.created_at.isoformat(),
                'last_message_at': room.last_message_at.isoformat()
            }
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, content, sender_type):
        """Save message to database"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            sender_name = 'Customer' if sender_type == 'customer' else 'Admin'
            
            message = ChatMessage.objects.create(
                room=room,
                sender_type=sender_type,
                sender_name=sender_name,
                content=content,
                is_read=(sender_type == 'admin')  # Admin messages are auto-read
            )
            
            # Update room's last message time
            room.save()
            
            return {
                'id': message.id,
                'content': message.content,
                'sender_type': message.sender_type,
                'sender_name': message.sender_name,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }
        except ChatRoom.DoesNotExist:
            logger.error(f"Chat room {self.room_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            return None


class AdminChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for admin chat interface"""
    
    async def connect(self):
        self.admin_group_name = 'admin_chat'
        
        # Check if user is authenticated and is admin
        user = self.scope.get("user")
        if isinstance(user, AnonymousUser) or not user.is_staff:
            logger.warning(f"Unauthorized WebSocket connection attempt: {type(user).__name__}")
            await self.close()
            return
        
        # Store user info for this connection
        self.user = user
        
        # Join admin group
        await self.channel_layer.group_add(
            self.admin_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send list of active chat rooms
        rooms = await self.get_active_rooms()
        await self.send(text_data=json.dumps({
            'type': 'room_list',
            'rooms': rooms
        }))
        
        logger.info(f"Admin {user.username} ({user.email}) connected to chat")

    async def disconnect(self, close_code):
        # Leave admin group
        await self.channel_layer.group_discard(
            self.admin_group_name,
            self.channel_name
        )
        
        logger.info("Admin disconnected from chat")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'admin_message':
                room_id = data.get('room_id')
                content = data.get('content', '').strip()
                
                if room_id and content:
                    message = await self.save_admin_message(room_id, content)
                    if message:
                        # Send message to specific room group
                        await self.channel_layer.group_send(
                            f'chat_{room_id}',
                            {
                                'type': 'chat_message',
                                'message': {
                                    'id': message['id'],
                                    'content': message['content'],
                                    'sender_type': message['sender_type'],
                                    'sender_name': message['sender_name'],
                                    'created_at': message['created_at'],
                                    'is_read': message['is_read']
                                }
                            }
                        )
                        
                        # Notify other admins
                        await self.channel_layer.group_send(
                            self.admin_group_name,
                            {
                                'type': 'admin_message_sent',
                                'room_id': room_id,
                                'message': message
                            }
                        )
                        
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error in admin receive: {e}")

    async def chat_message(self, event):
        """Receive message from room group"""
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def admin_message_sent(self, event):
        """Receive notification when admin sends message"""
        await self.send(text_data=json.dumps(event))

    async def room_list(self, event):
        """Receive updated room list"""
        await self.send(text_data=json.dumps(event))

    async def new_customer_message(self, event):
        """Receive notification of new customer message"""
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_active_rooms(self):
        """Get list of active chat rooms"""
        rooms = ChatRoom.objects.all().order_by('-last_message_at')
        return [
            {
                'id': str(room.id),
                'customer_name': room.customer_name,
                'customer_email': room.customer_email,
                'status': room.status,
                'created_at': room.created_at.isoformat(),
                'last_message_at': room.last_message_at.isoformat(),
                'unread_count': room.messages.filter(sender_type='customer', is_read=False).count()
            }
            for room in rooms
        ]

    @database_sync_to_async
    def save_admin_message(self, room_id, content):
        """Save admin message to database"""
        try:
            room = ChatRoom.objects.get(id=room_id)
            user = self.user  # Use stored user from connection
            
            # Create a more descriptive sender name with user info
            sender_name = f"{user.first_name} {user.last_name}".strip() or user.username
            if user.email:
                sender_name += f" ({user.email})"
            
            message = ChatMessage.objects.create(
                room=room,
                sender_type='admin',
                sender_name=sender_name,
                content=content,
                is_read=True  # Admin messages are auto-read
            )
            
            # Update room status and last message time
            room.status = 'active'
            room.save()
            
            return {
                'id': message.id,
                'content': message.content,
                'sender_type': message.sender_type,
                'sender_name': message.sender_name,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }
        except ChatRoom.DoesNotExist:
            logger.error(f"Chat room {room_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error saving admin message: {e}")
            return None
