import json
import logging
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from .models import ChatRoom, ChatMessage
from .encryption import encrypt_chat_message, decrypt_chat_message

logger = logging.getLogger(__name__)

# Global connection tracking for admin management
active_connections = {
    'admin': set(),
    'customers': {}
}

class EnhancedChatConsumer(AsyncWebsocketConsumer):
    """Enhanced WebSocket consumer for customer chat rooms with proper user isolation"""
    
    async def connect(self):
        try:
            logger.info("Enhanced Customer WS connect path=%s", self.scope.get("path"))
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.group_name = f'chat_{self.room_id}'
            self.heartbeat_task = None
            self.connection_id = f"{self.room_id}_{id(self)}"
            
            # Get authenticated user from JWT middleware
            self.user = self.scope.get("user")
            jwt_error = self.scope.get("jwt_error")
            logger.info("Enhanced Customer WS user=%s, is_anonymous=%s, jwt_error=%s", 
                       getattr(self.user, "username", "None"), 
                       getattr(self.user, "is_anonymous", True),
                       jwt_error)
            
            # Validate room access before accepting connection
            room_access = await self.validate_room_access()
            if not room_access:
                logger.warning("Enhanced Customer WS access denied for room %s", self.room_id)
                await self.close(code=4403)  # Forbidden
                return
            
            # Check if room exists, create if it doesn't (only for authenticated users)
            room_exists = await self.check_room_exists()
            if not room_exists:
                if self.user and not self.user.is_anonymous:
                    logger.info(f"Room {self.room_id} doesn't exist, creating for authenticated user")
                    room_created = await self.create_room_for_user()
                    if not room_created:
                        logger.error(f"Failed to create room {self.room_id}")
                        await self.close(code=4400)  # Bad Request
                        return
                else:
                    logger.warning(f"Room {self.room_id} doesn't exist and user is anonymous")
                    await self.close(code=4404)  # Not Found
                    return
            
            await self.accept()
            logger.info("Enhanced Customer WS accepted for room %s", self.room_id)
            
            # Track active customer connection
            if self.room_id not in active_connections['customers']:
                active_connections['customers'][self.room_id] = set()
            active_connections['customers'][self.room_id].add(self.connection_id)
            
            # Join room group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Send room info to admin
            await self.notify_admin_room_activity()
            
            # Start heartbeat to maintain connection
            self.heartbeat_task = asyncio.create_task(self.heartbeat())
            
        except Exception as e:
            logger.exception("Enhanced Customer WS connect error: %s", e)
            await self.close(code=1011)  # Internal Error

    async def disconnect(self, close_code):
        try:
            logger.info("Enhanced Customer WS disconnect room=%s code=%s", self.room_id, close_code)
            
            # Stop heartbeat
            if self.heartbeat_task:
                self.heartbeat_task.cancel()
                try:
                    await self.heartbeat_task
                except asyncio.CancelledError:
                    pass
            
            # Remove from active connections
            if self.room_id in active_connections['customers']:
                active_connections['customers'][self.room_id].discard(self.connection_id)
                if not active_connections['customers'][self.room_id]:
                    del active_connections['customers'][self.room_id]
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            
            # Notify admin of disconnection
            await self.notify_admin_room_activity()
            
        except Exception as e:
            logger.error("Enhanced Customer WS disconnect error: %s", e)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.info(f"Enhanced Customer WS received message type: {message_type}")
            
            if message_type == 'chat_message':
                content = data.get('content', '').strip()
                if content:
                    # Validate room access again
                    room_access = await self.validate_room_access()
                    if not room_access:
                        await self.send(text_data=json.dumps({
                            'type': 'error',
                            'message': 'Access denied'
                        }))
                        return
                    
                    message = await self.save_message(content, 'customer')
                    if message:
                        logger.info(f"Enhanced Customer WS saved message: {message['id']}")
                        
                        # Send to room group (admin will receive)
                        await self.channel_layer.group_send(
                            self.group_name,
                            {
                                'type': 'chat_message',
                                'message': message
                            }
                        )
                        
                        # Notify admin of new message
                        await self.notify_admin_new_message(message)
                        
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
                
        except json.JSONDecodeError:
            logger.error("Enhanced Customer WS invalid JSON received")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Enhanced Customer WS receive error: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal error'
            }))

    async def chat_message(self, event):
        """Receive message from room group (from admin)"""
        try:
            message = event['message']
            logger.info(f"Enhanced Customer WS received admin message: {message['id']}")
            
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message
            }))
        except Exception as e:
            logger.error(f"Enhanced Customer WS chat_message error: {e}")

    async def heartbeat(self):
        """Send periodic heartbeat to maintain connection"""
        try:
            while True:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                await self.send(text_data=json.dumps({'type': 'heartbeat'}))
        except asyncio.CancelledError:
            logger.info("Enhanced Customer WS heartbeat cancelled")
        except Exception as e:
            logger.error("Enhanced Customer WS heartbeat error: %s", e)

    @database_sync_to_async
    def validate_room_access(self):
        """Validate that the user can access this room"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            
            # If user is authenticated, check user ownership
            if self.user and not self.user.is_anonymous:
                return room.user == self.user
            
            # For anonymous users, check session
            session_key = self.scope.get('session', {}).get('session_key')
            return room.customer_session == session_key
            
        except ChatRoom.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Enhanced Customer WS validate_room_access error: {e}")
            return False

    @database_sync_to_async
    def check_room_exists(self):
        """Check if room exists"""
        try:
            ChatRoom.objects.get(id=self.room_id)
            return True
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def create_room_for_user(self):
        """Create a chat room for authenticated user"""
        try:
            if not self.user or self.user.is_anonymous:
                return False
            
            # Check if room already exists (race condition protection)
            try:
                ChatRoom.objects.get(id=self.room_id)
                return True  # Room already exists
            except ChatRoom.DoesNotExist:
                pass
            
            # Create session if needed
            session_key = self.scope.get('session', {}).get('session_key')
            if not session_key:
                session_key = f"ws_{self.room_id}_{self.user.id}"
            
            # Auto-populate customer info from authenticated user
            customer_name = self._get_user_display_name(self.user)
            
            # Create the room
            room = ChatRoom.objects.create(
                id=self.room_id,
                customer_name=customer_name,
                customer_email=self.user.email,
                customer_session=session_key,
                user=self.user,
                status='active'
            )
            
            logger.info(f"Enhanced Customer WS created room {self.room_id} for user {self.user.username}")
            return True
            
        except Exception as e:
            logger.error(f"Enhanced Customer WS create_room_for_user error: {e}")
            return False

    def _get_user_display_name(self, user):
        """Get display name for user"""
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        elif user.first_name:
            return user.first_name
        elif user.username:
            return user.username
        else:
            return user.email or user.username

    @database_sync_to_async
    def save_message(self, content, sender_type):
        """Save message to database with proper validation"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            
            # Create message
            message = ChatMessage.objects.create(
                room=room,
                sender_type=sender_type,
                sender_name=room.customer_name or 'Customer',
                sender_user=room.user if sender_type == 'customer' else None,
                content=content,
                is_read=False
            )
            
            # Update room status and last message time
            room.status = 'waiting' if sender_type == 'customer' else 'active'
            room.last_message_at = message.created_at
            room.save()
            
            # Return message data
            return {
                'id': str(message.id),
                'content': message.content,
                'sender_type': message.sender_type,
                'sender_name': message.sender_name,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }
            
        except ChatRoom.DoesNotExist:
            logger.error(f"Enhanced Customer WS room {self.room_id} not found")
            return None
        except Exception as e:
            logger.error(f"Enhanced Customer WS save_message error: {e}")
            return None

    async def notify_admin_room_activity(self):
        """Notify admin about room activity"""
        try:
            await self.channel_layer.group_send(
                'admin_chat',
                {
                    'type': 'room_activity',
                    'room_id': self.room_id,
                    'action': 'connection_update'
                }
            )
        except Exception as e:
            logger.error(f"Enhanced Customer WS notify_admin_room_activity error: {e}")

    async def notify_admin_new_message(self, message):
        """Notify admin about new message"""
        try:
            await self.channel_layer.group_send(
                'admin_chat',
                {
                    'type': 'new_customer_message',
                    'room_id': self.room_id,
                    'message': message
                }
            )
        except Exception as e:
            logger.error(f"Enhanced Customer WS notify_admin_new_message error: {e}")


class EnhancedAdminChatConsumer(AsyncWebsocketConsumer):
    """Enhanced WebSocket consumer for admin chat interface with proper room management"""
    
    async def connect(self):
        try:
            logger.info("Enhanced Admin WS connect path=%s", self.scope.get("path"))
            user = self.scope.get("user")
            jwt_error = self.scope.get("jwt_error")
            logger.info("Enhanced Admin WS user=%s, is_anonymous=%s, is_staff=%s, is_superuser=%s", 
                       getattr(user, "username", "None"), 
                       getattr(user, "is_anonymous", True),
                       getattr(user, "is_staff", False),
                       getattr(user, "is_superuser", False))
            
            # Validate admin access
            if not user or getattr(user, "is_anonymous", True):
                logger.warning("Enhanced Admin WS unauthorized jwt_error=%s", jwt_error)
                await self.close(code=4401)
                return
            if not (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)):
                logger.warning("Enhanced Admin WS forbidden user=%s", getattr(user, "id", None))
                await self.close(code=4403)
                return

            self.admin_group_name = 'admin_chat'
            self.user = user
            self.connection_id = f"admin_{user.id}_{id(self)}"
            self.heartbeat_task = None
            
            await self.accept()
            logger.info("Enhanced Admin WS accepted user=%s", user.id)
            
            # Track active admin connection
            active_connections['admin'].add(self.connection_id)
            
            # Join admin group
            await self.channel_layer.group_add(
                self.admin_group_name,
                self.channel_name
            )
            
            # Send current room status to admin
            await self.send_room_status()
            
            # Start heartbeat
            self.heartbeat_task = asyncio.create_task(self.admin_heartbeat())
            
        except Exception as e:
            logger.exception("Enhanced Admin WS connect error: %s", e)
            await self.close(code=1011)

    async def disconnect(self, close_code):
        try:
            logger.info("Enhanced Admin WS disconnect code=%s", close_code)
            
            # Stop heartbeat
            if self.heartbeat_task:
                self.heartbeat_task.cancel()
                try:
                    await self.heartbeat_task
                except asyncio.CancelledError:
                    pass
            
            # Remove from active connections
            active_connections['admin'].discard(self.connection_id)
            
            # Leave admin group
            await self.channel_layer.group_discard(
                self.admin_group_name,
                self.channel_name
            )
            
        except Exception as e:
            logger.error("Enhanced Admin WS disconnect error: %s", e)

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
                                'message': message
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
            
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
                
        except json.JSONDecodeError:
            logger.error("Enhanced Admin WS invalid JSON received")
        except Exception as e:
            logger.error(f"Enhanced Admin WS receive error: {e}")

    async def room_activity(self, event):
        """Handle room activity updates"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'room_activity',
                'room_id': event['room_id'],
                'action': event['action']
            }))
        except Exception as e:
            logger.error(f"Enhanced Admin WS room_activity error: {e}")

    async def new_customer_message(self, event):
        """Handle new customer message notifications"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'new_customer_message',
                'room_id': event['room_id'],
                'message': event['message']
            }))
        except Exception as e:
            logger.error(f"Enhanced Admin WS new_customer_message error: {e}")

    async def admin_message_sent(self, event):
        """Handle admin message sent notifications"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'admin_message_sent',
                'room_id': event['room_id'],
                'message': event['message']
            }))
        except Exception as e:
            logger.error(f"Enhanced Admin WS admin_message_sent error: {e}")

    async def admin_heartbeat(self):
        """Send periodic heartbeat to maintain connection"""
        try:
            while True:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                await self.send(text_data=json.dumps({'type': 'heartbeat'}))
        except asyncio.CancelledError:
            logger.info("Enhanced Admin WS heartbeat cancelled")
        except Exception as e:
            logger.error("Enhanced Admin WS heartbeat error: %s", e)

    async def send_room_status(self):
        """Send current room status to admin"""
        try:
            active_rooms = await self.get_active_rooms()
            await self.send(text_data=json.dumps({
                'type': 'room_status',
                'active_rooms': active_rooms,
                'active_customers': len(active_connections['customers'])
            }))
        except Exception as e:
            logger.error(f"Enhanced Admin WS send_room_status error: {e}")

    @database_sync_to_async
    def get_active_rooms(self):
        """Get list of active chat rooms"""
        try:
            rooms = ChatRoom.objects.filter(status__in=['active', 'waiting']).order_by('-last_message_at')
            return [
                {
                    'id': str(room.id),
                    'customer_name': room.get_display_name(),
                    'customer_email': room.customer_email,
                    'status': room.status,
                    'last_message_at': room.last_message_at.isoformat(),
                    'unread_count': room.get_unread_count(),
                    'is_online': str(room.id) in active_connections['customers']
                }
                for room in rooms
            ]
        except Exception as e:
            logger.error(f"Enhanced Admin WS get_active_rooms error: {e}")
            return []

    @database_sync_to_async
    def save_admin_message(self, room_id, content):
        """Save admin message to database"""
        try:
            room = ChatRoom.objects.get(id=room_id)
            
            # Create admin message
            message = ChatMessage.objects.create(
                room=room,
                sender_type='admin',
                sender_name='Admin',
                sender_user=self.user,
                content=content,
                is_read=True  # Admin messages are read by default
            )
            
            # Update room status and last message time
            room.status = 'active'
            room.last_message_at = message.created_at
            room.save()
            
            # Mark all customer messages as read
            room.messages.filter(sender_type='customer', is_read=False).update(is_read=True)
            
            # Return message data
            return {
                'id': str(message.id),
                'content': message.content,
                'sender_type': message.sender_type,
                'sender_name': message.sender_name,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }
            
        except ChatRoom.DoesNotExist:
            logger.error(f"Enhanced Admin WS room {room_id} not found")
            return None
        except Exception as e:
            logger.error(f"Enhanced Admin WS save_admin_message error: {e}")
            return None
