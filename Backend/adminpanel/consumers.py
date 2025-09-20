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
        try:
            logger.info("Customer WS connect path=%s", self.scope.get("path"))
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.group_name = f'chat_{self.room_id}'
            
            # Check if room exists
            room_exists = await self.check_room_exists()
            if not room_exists:
                logger.warning("Customer WS room not found: %s", self.room_id)
                await self.close(code=4404)
                return
            
            # Defend against channel layer issues with clear error
            try:
                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
            except Exception as e:
                logger.exception("Channel layer/group_add failed: %s", e)
                await self.close(code=1011)
                return
            
            await self.accept()
            logger.info("Customer WS accepted room=%s", self.room_id)
            
            # Send room info to client
            room_info = await self.get_room_info()
            await self.send(text_data=json.dumps({
                'type': 'room_info',
                'room': room_info
            }))
            
        except Exception as e:
            logger.exception("Customer WS connect error: %s", e)
            await self.close(code=1011)

    async def disconnect(self, close_code):
        logger.info("Customer WS disconnect code=%s", close_code)
        # Leave room group
        try:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        except Exception as e:
            logger.error("Error leaving group: %s", e)

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
                            self.group_name,
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
    def check_room_exists(self):
        """Check if chat room exists"""
        try:
            ChatRoom.objects.get(id=self.room_id)
            return True
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, sender_type):
        """Save message to database"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            
            # Use proper customer name for customer messages
            if sender_type == 'customer':
                sender_name = room.customer_name or 'Anonymous'
                if not sender_name or sender_name == 'Anonymous':
                    if room.user:
                        if room.user.first_name and room.user.last_name:
                            sender_name = f"{room.user.first_name} {room.user.last_name}"
                        elif room.user.first_name:
                            sender_name = room.user.first_name
                        elif room.user.username:
                            sender_name = room.user.username
            else:
                sender_name = 'Admin'
            
            message = ChatMessage.objects.create(
                room=room,
                sender_type=sender_type,
                sender_name=sender_name,
                content=content,
                is_read=(sender_type == 'admin')  # Admin messages are auto-read
            )
            
            # Update room's last message time
            room.last_message_at = message.created_at
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
        try:
            logger.info("Admin WS connect path=%s", self.scope.get("path"))
            user = self.scope.get("user")
            jwt_error = self.scope.get("jwt_error")
            logger.info("Admin WS user=%s, is_anonymous=%s, is_staff=%s, is_superuser=%s", 
                       getattr(user, "username", "None"), 
                       getattr(user, "is_anonymous", True),
                       getattr(user, "is_staff", False),
                       getattr(user, "is_superuser", False))
            
            if not user or getattr(user, "is_anonymous", True):
                logger.warning("Admin WS unauthorized jwt_error=%s", jwt_error)
                await self.close(code=4401)
                return
            if not (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)):
                logger.warning("Admin WS forbidden user=%s", getattr(user, "id", None))
                await self.close(code=4403)
                return

            self.admin_group_name = 'admin_chat'
            self.user = user
            
            # Defend against channel layer issues with clear error
            try:
                await self.channel_layer.group_add(
                    self.admin_group_name,
                    self.channel_name
                )
            except Exception as e:
                logger.exception("Channel layer/group_add failed: %s", e)
                await self.close(code=1011)
                return

            await self.accept()
            logger.info("Admin WS accepted user=%s", user.id)
            
            # Send list of active chat rooms
            try:
                logger.info("Getting active rooms...")
                rooms = await self.get_active_rooms()
                logger.info("Got %d rooms, sending to client...", len(rooms))
                await self.send(text_data=json.dumps({
                    'type': 'room_list',
                    'rooms': rooms
                }))
                logger.info("Room list sent successfully")
            except Exception as e:
                logger.exception("Error sending room list: %s", e)
                raise
            
        except Exception as e:
            logger.exception("Admin WS connect error: %s", e)
            await self.close(code=1011)

    async def disconnect(self, close_code):
        logger.info("Admin WS disconnect code=%s", close_code)
        # Leave admin group
        try:
            await self.channel_layer.group_discard(
                self.admin_group_name,
                self.channel_name
            )
        except Exception as e:
            logger.error("Error leaving admin group: %s", e)

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
        
        # Refresh room list to show updated unread counts
        try:
            rooms = await self.get_active_rooms()
            await self.send(text_data=json.dumps({
                'type': 'room_list',
                'rooms': rooms
            }))
        except Exception as e:
            logger.error(f"Error refreshing room list: {e}")

    @database_sync_to_async
    def get_active_rooms(self):
        """Get list of active chat rooms"""
        rooms = ChatRoom.objects.all().order_by('-last_message_at')
        logger.info(f"Found {rooms.count()} chat rooms for admin")
        
        room_data = [
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
        
        logger.info(f"Returning {len(room_data)} rooms to admin: {[r['customer_name'] for r in room_data]}")
        return room_data

    @database_sync_to_async
    def save_admin_message(self, room_id, content):
        """Save admin message to database"""
        try:
            room = ChatRoom.objects.get(id=room_id)
            user = self.user  # Use stored user from connection
            
            # Create a more descriptive sender name with user info
            sender_name = f"{user.first_name} {user.last_name}".strip() or user.username
            
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
