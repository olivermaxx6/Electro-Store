import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.core.cache import cache
from django.utils import timezone
import asyncio

logger = logging.getLogger(__name__)

class AdminRealtimeConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time admin dashboard updates"""
    
    async def connect(self):
        try:
            logger.info("Admin Realtime WS connect path=%s", self.scope.get("path"))
            user = self.scope.get("user")
            jwt_error = self.scope.get("jwt_error")
            
            logger.info("Admin Realtime WS user=%s, is_anonymous=%s, is_staff=%s, is_superuser=%s", 
                       getattr(user, "username", "None"), 
                       getattr(user, "is_anonymous", True),
                       getattr(user, "is_staff", False),
                       getattr(user, "is_superuser", False))
            
            # Check authentication
            if not user or getattr(user, "is_anonymous", True):
                logger.warning("Admin Realtime WS unauthorized jwt_error=%s", jwt_error)
                await self.close(code=4401)
                return
                
            if not (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)):
                logger.warning("Admin Realtime WS forbidden user=%s", getattr(user, "id", None))
                await self.close(code=4403)
                return

            self.user = user
            self.group_name = 'admin_realtime'
            self.connection_id = f"admin_realtime_{user.id}_{id(self)}"
            self.heartbeat_task = None
            
            await self.accept()
            logger.info("Admin Realtime WS accepted user=%s", user.id)
            
            # Join admin realtime group
            try:
                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
            except Exception as e:
                logger.exception("Channel layer/group_add failed: %s", e)
                await self.close(code=1011)
                return
            
            # Start heartbeat
            self.heartbeat_task = asyncio.create_task(self.heartbeat())
            
            # Send initial connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'auth_success',
                'message': 'Connected to real-time updates',
                'user_id': user.id,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.exception("Admin Realtime WS connect error: %s", e)
            await self.close(code=1011)

    async def disconnect(self, close_code):
        logger.info("Admin Realtime WS disconnect code=%s", close_code)
        
        # Stop heartbeat task
        if hasattr(self, 'heartbeat_task') and self.heartbeat_task:
            self.heartbeat_task.cancel()
            try:
                await self.heartbeat_task
            except asyncio.CancelledError:
                pass
        
        # Leave admin group
        try:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        except Exception as e:
            logger.error("Error leaving admin realtime group: %s", e)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.info(f"Admin Realtime WS received message type: {message_type}")
            
            if message_type == 'auth':
                # Authentication is handled in connect()
                await self.send(text_data=json.dumps({
                    'type': 'auth_success',
                    'message': 'Authentication confirmed',
                    'timestamp': timezone.now().isoformat()
                }))
                
            elif message_type == 'heartbeat':
                # Respond to heartbeat
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat_response',
                    'timestamp': timezone.now().isoformat()
                }))
                
            elif message_type == 'refresh_request':
                # Handle refresh request
                resource = data.get('resource')
                if resource:
                    await self.handle_refresh_request(resource)
                    
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error in receive: {e}")

    async def heartbeat(self):
        """Send periodic heartbeat to maintain connection"""
        try:
            while True:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat',
                    'timestamp': timezone.now().isoformat()
                }))
        except asyncio.CancelledError:
            logger.info("Heartbeat task cancelled")
        except Exception as e:
            logger.error("Heartbeat error: %s", e)

    async def handle_refresh_request(self, resource):
        """Handle refresh request for specific resource"""
        try:
            logger.info(f"Handling refresh request for resource: {resource}")
            
            # Get fresh data based on resource type
            if resource in ['categories', 'products', 'services']:
                fresh_data = await self.get_fresh_data(resource)
                
                await self.send(text_data=json.dumps({
                    'type': 'data_update',
                    'resource': resource,
                    'action': 'bulk_update',
                    'data': fresh_data,
                    'timestamp': timezone.now().isoformat()
                }))
                
        except Exception as e:
            logger.error(f"Error handling refresh request for {resource}: {e}")

    @database_sync_to_async
    def get_fresh_data(self, resource_type):
        """Get fresh data for the specified resource type"""
        try:
            if resource_type == 'categories':
                from .models import Category
                from .serializers import CategoryListSerializer
                categories = Category.objects.all().select_related("parent").prefetch_related("children").order_by("name")
                serializer = CategoryListSerializer(categories, many=True)
                return serializer.data
                
            elif resource_type == 'products':
                from .models import Product
                from .serializers import ProductSerializer
                products = Product.objects.all().select_related("brand", "category").prefetch_related("images").order_by("-created_at")
                serializer = ProductSerializer(products, many=True)
                return serializer.data
                
            elif resource_type == 'services':
                from .models import Service
                from .serializers import ServiceSerializer
                services = Service.objects.all().select_related("category").order_by("-created_at")
                serializer = ServiceSerializer(services, many=True)
                return serializer.data
                
            else:
                logger.warning(f"Unknown resource type for refresh: {resource_type}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting fresh data for {resource_type}: {e}")
            return []

    # Message handlers for different update types
    async def data_update(self, event):
        """Handle data update messages"""
        await self.send(text_data=json.dumps(event))

    async def category_update(self, event):
        """Handle category-specific updates"""
        await self.send(text_data=json.dumps({
            'type': 'data_update',
            'resource': 'categories',
            **event
        }))

    async def product_update(self, event):
        """Handle product-specific updates"""
        await self.send(text_data=json.dumps({
            'type': 'data_update',
            'resource': 'products',
            **event
        }))

    async def service_update(self, event):
        """Handle service-specific updates"""
        await self.send(text_data=json.dumps({
            'type': 'data_update',
            'resource': 'services',
            **event
        }))

    async def order_update(self, event):
        """Handle order-specific updates"""
        await self.send(text_data=json.dumps({
            'type': 'data_update',
            'resource': 'orders',
            **event
        }))
