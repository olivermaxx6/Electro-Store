import json
import logging
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, ChatMessage
from .encryption import encrypt_chat_message, decrypt_chat_message

import logging

logger = logging.getLogger(__name__)

# Global connection tracking - COMMENTED OUT
active_connections = {
    'admin': set(),
    'customers': {}
}

# Active consumers for chat functionality
class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for customer chat rooms with persistent connections"""
    """WebSocket consumer for customer chat rooms with persistent connections"""
    
    async def connect(self):
        try:
            logger.info("Customer WS connect path=%s", self.scope.get("path"))
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.group_name = f'chat_{self.room_id}'
            self.heartbeat_task = None
            self.connection_id = f"{self.room_id}_{id(self)}"
            
            # Get authenticated user from JWT middleware
            self.user = self.scope.get("user")
            jwt_error = self.scope.get("jwt_error")
            logger.info("Customer WS user=%s, is_anonymous=%s, jwt_error=%s", 
                       getattr(self.user, "username", "None"), 
                       getattr(self.user, "is_anonymous", True),
                       jwt_error)
            
            # Check if room exists, create if it doesn't
            room_exists = await self.check_room_exists()
            if not room_exists:
                logger.info("Customer WS room not found: %s, attempting to create", self.room_id)
                room_created = await self.create_room_if_needed()
                if not room_created:
                    logger.warning("Customer WS failed to create room: %s", self.room_id)
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
            
            # Track active connection
            if self.room_id not in active_connections['customers']:
                active_connections['customers'][self.room_id] = set()
            active_connections['customers'][self.room_id].add(self.connection_id)
            
            # Start heartbeat to maintain connection
            # COMMENTED OUT: Heartbeat causing WebSocket connection issues
            # self.heartbeat_task = asyncio.create_task(self.heartbeat())
            
            # Send room info to client
            # COMMENTED OUT: WebSocket send operations causing connection errors
            # room_info = await self.get_room_info()
            # await self.send(text_data=json.dumps({
            #     'type': 'room_info',
            #     'room': room_info
            # }))
            
            # Notify admin about new connection
            await self.channel_layer.group_send(
                'admin_chat',
                {
                    'type': 'customer_connected',
                    'room_id': self.room_id,
                    'connection_id': self.connection_id
                }
            )
            
        except Exception as e:
            logger.exception("Customer WS connect error: %s", e)
            await self.close(code=1011)

    async def disconnect(self, close_code):
        logger.info("Customer WS disconnect code=%s", close_code)
        
        # Stop heartbeat task
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
        
        # Notify admin about disconnection
        await self.channel_layer.group_send(
            'admin_chat',
            {
                'type': 'customer_disconnected',
                'room_id': self.room_id,
                'connection_id': self.connection_id
            }
        )
        
        # Leave room group
        try:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        except Exception as e:
            logger.error("Error leaving group: %s", e)
    
    async def heartbeat(self):
        """Send periodic heartbeat to maintain connection"""
        try:
            while True:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat',
                    'timestamp': asyncio.get_event_loop().time()
                }))
        except asyncio.CancelledError:
            logger.info("Heartbeat task cancelled for room %s", self.room_id)
        except Exception as e:
            logger.error("Heartbeat error for room %s: %s", self.room_id, e)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.info(f"Customer WS received message type: {message_type}, data: {data}")
            
            if message_type == 'chat_message':
                content = data.get('content', '').strip()
                if content:
                    # Ensure room exists before saving message
                    room_exists = await self.check_room_exists()
                    if not room_exists:
                        logger.info(f"Room {self.room_id} doesn't exist, creating it...")
                        room_created = await self.create_room_if_needed()
                        if not room_created:
                            logger.error(f"Failed to create room {self.room_id}")
                            await self.send(text_data=json.dumps({
                                'type': 'error',
                                'message': 'Failed to create chat room'
                            }))
                            return
                    
                    message = await self.save_message(content, 'customer')
                    if message:
                        logger.info(f"Message saved successfully: {message['id']}")
                        
                        # Send message to room group (for other users in same room)
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
                        
                        # Notify admin dashboard about new customer message
                        await self.channel_layer.group_send(
                            'admin_chat',
                            {
                                'type': 'new_customer_message',
                                'room_id': str(self.room_id),
                                'message': message,
                                'room_info': await self.get_room_info()
                            }
                        )
                        
                        # Send acknowledgment to sender
                        # COMMENTED OUT: WebSocket send operations causing connection errors
                        # await self.send(text_data=json.dumps({
                        #     'type': 'message_sent',
                        #     'message': message
                        # }))
                    else:
                        logger.error("Failed to save message")
                        # COMMENTED OUT: WebSocket send operations causing connection errors
                        # await self.send(text_data=json.dumps({
                        #     'type': 'error',
                        #     'message': 'Failed to save message'
                        # }))
                        
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            # COMMENTED OUT: WebSocket send operations causing connection errors
            # await self.send(text_data=json.dumps({
            #     'type': 'error',
            #     'message': 'Invalid message format'
            # }))
        except Exception as e:
            logger.error(f"Error in receive: {e}")
            # COMMENTED OUT: WebSocket send operations causing connection errors
            # await self.send(text_data=json.dumps({
            #     'type': 'error',
            #     'message': 'Server error processing message'
            # }))

    async def chat_message(self, event):
        """Receive message from room group"""
        message = event['message']
        
        # Send message to WebSocket
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps({
        #     'type': 'chat_message',
        #     'message': message
        # }))

    async def room_info(self, event):
        """Receive room info update"""
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps(event))

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
    def create_room_if_needed(self):
        """Create a chat room if it doesn't exist and user is authenticated"""
        try:
            # Only create room for authenticated users
            if not self.user or self.user.is_anonymous:
                logger.warning("Cannot create room for anonymous user")
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
                # Create a dummy session key for WebSocket connections
                session_key = f"ws_{self.room_id}_{self.user.id}"
            
            # Auto-populate customer info from authenticated user
            customer_name = ''
            if self.user.first_name and self.user.last_name:
                customer_name = f"{self.user.first_name} {self.user.last_name}"
            elif self.user.first_name:
                customer_name = self.user.first_name
            elif self.user.username:
                customer_name = self.user.username
            else:
                customer_name = self.user.email or self.user.username
            
            # Create the room
            room = ChatRoom.objects.create(
                id=self.room_id,  # Use the provided room_id
                customer_name=customer_name,
                customer_email=self.user.email,
                customer_session=session_key,
                user=self.user,
                status='active'
            )
            
            logger.info(f"Created new chat room {self.room_id} for user {self.user.username}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating room {self.room_id}: {e}")
            return False

    @database_sync_to_async
    def save_message(self, content, sender_type):
        """Save message to database"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            
            # Use proper customer name for customer messages
            if sender_type == 'customer':
                sender_name = 'Anonymous'
                
                # First try to get name from authenticated user (from WebSocket)
                if hasattr(self, 'user') and self.user and not self.user.is_anonymous:
                    if self.user.first_name and self.user.last_name:
                        sender_name = f"{self.user.first_name} {self.user.last_name}"
                    elif self.user.first_name:
                        sender_name = self.user.first_name
                    elif self.user.username:
                        sender_name = self.user.username
                    elif self.user.email:
                        sender_name = self.user.email
                    
                    # Update room with authenticated user info
                    if not room.user:
                        room.user = self.user
                        room.customer_name = sender_name
                        room.customer_email = self.user.email
                        room.save()
                # Fallback to room's stored customer info
                elif room.customer_name and room.customer_name != 'Anonymous':
                    sender_name = room.customer_name
                elif room.user:
                    if room.user.first_name and room.user.last_name:
                        sender_name = f"{room.user.first_name} {room.user.last_name}"
                    elif room.user.first_name:
                        sender_name = room.user.first_name
                    elif room.user.username:
                        sender_name = room.user.username
            else:
                sender_name = 'Admin'
            
            # Determine sender_user for the message
            sender_user = None
            if sender_type == 'customer' and hasattr(self, 'user') and self.user and not self.user.is_anonymous:
                sender_user = self.user
            elif sender_type == 'admin' and hasattr(self, 'user') and self.user and not self.user.is_anonymous:
                sender_user = self.user
            
            # Encrypt message content
            encrypted_content = encrypt_chat_message(content)
            
            message = ChatMessage.objects.create(
                room=room,
                sender_type=sender_type,
                sender_name=sender_name,
                sender_user=sender_user,
                content=encrypted_content,  # Store encrypted content
                is_read=(sender_type == 'admin')  # Admin messages are auto-read
            )
            
            # Update room's last message time
            room.last_message_at = message.created_at
            room.save()
            
            return {
                'id': message.id,
                'content': decrypt_chat_message(message.content),  # Decrypt for client
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
    """WebSocket consumer for admin chat interface with persistent connections"""
    
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
            self.connection_id = f"admin_{user.id}_{id(self)}"
            self.heartbeat_task = None
            
            await self.accept()
            logger.info("Admin WS accepted user=%s", user.id)
            
            # Track active admin connection
            active_connections['admin'].add(self.connection_id)
            
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
            
            # Start heartbeat to maintain connection
            # COMMENTED OUT: Heartbeat causing WebSocket connection issues
            # self.heartbeat_task = asyncio.create_task(self.admin_heartbeat())
            
            # Send list of active chat rooms with connection status
            # COMMENTED OUT: WebSocket send operations causing connection errors
            # try:
            #     logger.info("Getting active rooms...")
            #     rooms = await self.get_active_rooms_with_status()
            #     logger.info("Got %d rooms, sending to client...", len(rooms))
            #     await self.send(text_data=json.dumps({
            #         'type': 'room_list',
            #         'rooms': rooms,
            #         'connection_status': {
            #             'admin_online': len(active_connections['admin']) > 0,
            #             'active_customers': len(active_connections['customers'])
            #         }
            #     }))
            #     logger.info("Room list sent successfully")
            # except Exception as e:
            #     logger.exception("Error sending room list: %s", e)
            #     raise
            
        except Exception as e:
            logger.exception("Admin WS connect error: %s", e)
            await self.close(code=1011)

    async def disconnect(self, close_code):
        logger.info("Admin WS disconnect code=%s", close_code)
        
        # Stop heartbeat task
        if hasattr(self, 'heartbeat_task') and self.heartbeat_task:
            self.heartbeat_task.cancel()
            try:
                await self.heartbeat_task
            except asyncio.CancelledError:
                pass
        
        # Remove from active connections
        active_connections['admin'].discard(self.connection_id)
        
        # Leave admin group
        try:
            await self.channel_layer.group_discard(
                self.admin_group_name,
                self.channel_name
            )
        except Exception as e:
            logger.error("Error leaving admin group: %s", e)
    
    async def admin_heartbeat(self):
        """Send periodic heartbeat to maintain admin connection"""
        try:
            while True:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat',
                    'timestamp': asyncio.get_event_loop().time(),
                    'connection_status': {
                        'admin_online': len(active_connections['admin']) > 0,
                        'active_customers': len(active_connections['customers'])
                    }
                }))
        except asyncio.CancelledError:
            logger.info("Admin heartbeat task cancelled")
        except Exception as e:
            logger.error("Admin heartbeat error: %s", e)

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
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps({
        #     'type': 'chat_message',
        #     'message': message
        # }))

    async def admin_message_sent(self, event):
        """Receive notification when admin sends message"""
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps(event))

    async def room_list(self, event):
        """Receive updated room list"""
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps(event))

    async def new_customer_message(self, event):
        """Receive notification of new customer message"""
        logger.info(f"Admin WS received new customer message: {event}")
        
        # Send the new message to admin dashboard
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps({
        #     'type': 'new_customer_message',
        #     'room_id': event['room_id'],
        #     'message': event['message'],
        #     'room_info': event.get('room_info')
        # }))
        
        # Also trigger a room list refresh
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps({
        #     'type': 'refresh_room_list'
        # }))
        
        # Refresh room list to show updated unread counts
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # try:
        #     rooms = await self.get_active_rooms_with_status()
        #     await self.send(text_data=json.dumps({
        #         'type': 'room_list',
        #         'rooms': rooms,
        #         'connection_status': {
        #             'admin_online': len(active_connections['admin']) > 0,
        #             'active_customers': len(active_connections['customers'])
        #         }
        #     }))
        # except Exception as e:
        #     logger.error(f"Error refreshing room list: {e}")
    
    async def customer_connected(self, event):
        """Handle customer connection notification"""
        logger.info(f"Admin WS received customer connected: {event}")
        
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps({
        #     'type': 'customer_connected',
        #     'room_id': event['room_id'],
        #     'connection_id': event['connection_id']
        # }))
        
        # Refresh room list to show updated connection status
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # try:
        #     rooms = await self.get_active_rooms_with_status()
        #     await self.send(text_data=json.dumps({
        #         'type': 'room_list',
        #         'rooms': rooms,
        #         'connection_status': {
        #             'admin_online': len(active_connections['admin']) > 0,
        #             'active_customers': len(active_connections['customers'])
        #         }
        #     }))
        # except Exception as e:
        #     logger.error(f"Error refreshing room list after customer connect: {e}")
    
    async def customer_disconnected(self, event):
        """Handle customer disconnection notification"""
        logger.info(f"Admin WS received customer disconnected: {event}")
        
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps({
        #     'type': 'customer_disconnected',
        #     'room_id': event['room_id'],
        #     'connection_id': event['connection_id']
        # }))
        
        # Refresh room list to show updated connection status
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # try:
        #     rooms = await self.get_active_rooms_with_status()
        #     await self.send(text_data=json.dumps({
        #         'type': 'room_list',
        #         'rooms': rooms,
        #         'connection_status': {
        #             'admin_online': len(active_connections['admin']) > 0,
        #             'active_customers': len(active_connections['customers'])
        #         }
        #     }))
        # except Exception as e:
        #     logger.error(f"Error refreshing room list after customer disconnect: {e}")

    async def new_order_notification(self, event):
        """Receive notification of new order"""
        # COMMENTED OUT: WebSocket send operations causing connection errors
        # await self.send(text_data=json.dumps({
        #     'type': 'new_order_notification',
        #     'order': event['order'],
        #     'message': event['message'],
        #     'timestamp': event['timestamp']
        # }))


    @database_sync_to_async
    def save_admin_message(self, room_id, content):
        """Save admin message to database"""
        try:
            room = ChatRoom.objects.get(id=room_id)
            user = self.user  # Use stored user from connection
            
            # Create a more descriptive sender name with user info
            sender_name = f"{user.first_name} {user.last_name}".strip() or user.username
            
            # Encrypt admin message content
            encrypted_content = encrypt_chat_message(content)
            
            message = ChatMessage.objects.create(
                room=room,
                sender_type='admin',
                sender_name=sender_name,
                sender_user=self.user,  # Admin user from WebSocket connection
                content=encrypted_content,  # Store encrypted content
                is_read=True  # Admin messages are auto-read
            )
            
            # Update room status and last message time
            room.status = 'active'
            room.save()
            
            return {
                'id': message.id,
                'content': decrypt_chat_message(message.content),  # Decrypt for client
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
    
    @database_sync_to_async
    def get_active_rooms(self):
        """Get all active chat rooms for admin dashboard"""
        try:
            rooms = ChatRoom.objects.all().select_related('user').order_by('-last_message_at')
            return [
                {
                    'id': str(room.id),
                    'customer_name': room.customer_name,
                    'customer_email': room.customer_email,
                    'status': room.status,
                    'created_at': room.created_at.isoformat(),
                    'last_message_at': room.last_message_at.isoformat(),
                    'unread_count': room.messages.filter(sender_type='customer', is_read=False).count(),
                    'user': room.user.username if room.user else None
                }
                for room in rooms
            ]
        except Exception as e:
            logger.error(f"Error getting active rooms: {e}")
            return []
    
    @database_sync_to_async
    def get_active_rooms_with_status(self):
        """Get all active chat rooms with connection status"""
        try:
            rooms = ChatRoom.objects.all().select_related('user').order_by('-last_message_at')
            return [
                {
                    'id': str(room.id),
                    'customer_name': room.customer_name,
                    'customer_email': room.customer_email,
                    'status': room.status,
                    'created_at': room.created_at.isoformat(),
                    'last_message_at': room.last_message_at.isoformat(),
                    'unread_count': room.messages.filter(sender_type='customer', is_read=False).count(),
                    'user': room.user.username if room.user else None,
                    'is_online': str(room.id) in active_connections['customers'],
                    'connection_count': len(active_connections['customers'].get(str(room.id), set()))
                }
                for room in rooms
            ]
        except Exception as e:
            logger.error(f"Error getting active rooms with status: {e}")
            return []
