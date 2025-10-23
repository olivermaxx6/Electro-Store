"""
Chat system views for both public and admin endpoints
"""
import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import PermissionDenied
from django.db import transaction, models
from django.utils import timezone

from .models import ChatRoom, ChatMessage
from .serializers import (
    ChatRoomSerializer, ChatRoomListSerializer, 
    ChatMessageSerializer, ChatMessageCreateSerializer
)

logger = logging.getLogger(__name__)


class PublicChatRoomViewSet(viewsets.ModelViewSet):
    """Public chat room endpoint for customers to chat with admin"""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post', 'delete']
    
    def get_queryset(self):
        """Ensure users only see their own chat rooms"""
        # If user is authenticated, show their rooms only
        if self.request.user and not self.request.user.is_anonymous:
            return ChatRoom.objects.filter(user=self.request.user).order_by('-last_message_at')
        
        # For anonymous users, show rooms by session or public rooms
        session_key = self.request.session.session_key
        if session_key:
            # Show rooms for this session OR public rooms (no user assigned)
            return ChatRoom.objects.filter(
                models.Q(customer_session=session_key) | models.Q(user__isnull=True)
            ).order_by('-last_message_at')
        else:
            # No session, only show public rooms
            return ChatRoom.objects.filter(user__isnull=True).order_by('-last_message_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new chat room with proper user isolation"""
        try:
            # Ensure session is created for anonymous users
            if not request.session.session_key:
                request.session.create()
            
            # Check if user already has an active room
            if request.user and not request.user.is_anonymous:
                existing_room = ChatRoom.objects.filter(
                    user=request.user, 
                    status__in=['active', 'waiting']
                ).first()
                if existing_room:
                    serializer = self.get_serializer(existing_room)
                    return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                session_key = request.session.session_key
                if session_key:
                    existing_room = ChatRoom.objects.filter(
                        customer_session=session_key,
                        status__in=['active', 'waiting']
                    ).first()
                    if existing_room:
                        serializer = self.get_serializer(existing_room)
                        return Response(serializer.data, status=status.HTTP_200_OK)
            
            # Create new room
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                room = serializer.save()
                
                # Set user or session based on authentication
                if request.user and not request.user.is_anonymous:
                    room.user = request.user
                    room.customer_name = room.customer_name or self._get_user_display_name(request.user)
                    room.customer_email = room.customer_email or request.user.email
                else:
                    room.customer_session = request.session.session_key
                
                room.save()
            
            logger.info(f"Created chat room {room.id} for user {request.user if request.user and not request.user.is_anonymous else 'anonymous'}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating chat room: {e}")
            return Response(
                {'error': 'Failed to create chat room'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    
    def get_object(self):
        """Ensure users can only access their own rooms"""
        # Use the filtered queryset instead of calling super()
        queryset = self.get_queryset()
        
        # Try to get the object from the filtered queryset first
        try:
            obj = queryset.get(pk=self.kwargs['pk'])
            return obj
        except ChatRoom.DoesNotExist:
            # If not found in filtered queryset, check if it's a user-specific room
            # and the user is authenticated
            if self.request.user and not self.request.user.is_anonymous:
                try:
                    obj = ChatRoom.objects.get(pk=self.kwargs['pk'], user=self.request.user)
                    return obj
                except ChatRoom.DoesNotExist:
                    pass
            
            # For anonymous users, allow access to any room that exists
            # This handles cases where a user was authenticated when creating the room
            # but is now accessing it anonymously (e.g., after session expiry)
            try:
                obj = ChatRoom.objects.get(pk=self.kwargs['pk'])
                # Only allow access to active/waiting rooms for security
                if obj.status in ['active', 'waiting']:
                    return obj
            except ChatRoom.DoesNotExist:
                pass
            
            # If still not found, raise the original exception
            raise ChatRoom.DoesNotExist(f"ChatRoom matching query does not exist.")
    
    @action(detail=True, methods=['get'])
    def get_messages(self, request, pk=None):
        """Get messages for a specific chat room"""
        try:
            room = self.get_object()
            messages = room.messages.all().order_by('created_at')
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        except ChatRoom.DoesNotExist:
            logger.error(f"ChatRoom {pk} not found for user {request.user}")
            return Response(
                {'error': 'Chat room not found. Please refresh and try again.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return Response(
                {'error': 'Failed to get messages'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in a chat room"""
        try:
            room = self.get_object()
            
            # Prepare message data
            message_data = {
                'room': room.id,
                'content': request.data.get('content', '').strip(),
                'sender_type': 'customer',
                'customer_name': request.data.get('customer_name', room.customer_name or 'Customer')
            }
            
            if not message_data['content']:
                return Response(
                    {'error': 'Message content is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update room with customer info if provided
            if 'customer_name' in request.data:
                room.customer_name = request.data['customer_name']
            if 'customer_email' in request.data:
                room.customer_email = request.data['customer_email']
            if 'customer_phone' in request.data:
                room.customer_phone = request.data['customer_phone']
            room.save()
            
            # Create message
            serializer = ChatMessageCreateSerializer(data=message_data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            message = serializer.save()
            
            logger.info(f"Customer sent message {message.id} in room {room.id}")
            
            return Response({
                'data': ChatMessageSerializer(message).data,
                'message': 'Message sent successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return Response(
                {'error': 'Failed to send message'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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


class UserChatRoomViewSet(viewsets.ModelViewSet):
    """User-specific chat room endpoint for authenticated users"""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post']
    
    def get_queryset(self):
        """Get chat rooms for the authenticated user"""
        return ChatRoom.objects.filter(user=self.request.user).order_by('-last_message_at')
    
    def create(self, request, *args, **kwargs):
        """Create or get existing chat room for authenticated user"""
        try:
            # Check if user already has an active room
            existing_room = ChatRoom.objects.filter(
                user=request.user, 
                status__in=['active', 'waiting']
            ).first()
            
            if existing_room:
                serializer = self.get_serializer(existing_room)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            # Create new room for authenticated user
            room_data = {
                'customer_name': self._get_user_display_name(request.user),
                'customer_email': request.user.email,
                'user': request.user.id,
                'status': 'active'
            }
            
            serializer = self.get_serializer(data=room_data)
            serializer.is_valid(raise_exception=True)
            room = serializer.save()
            
            logger.info(f"Created user chat room {room.id} for user {request.user.username}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating user chat room: {e}")
            return Response(
                {'error': 'Failed to create chat room'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in user's chat room"""
        try:
            room = self.get_object()
            
            message_data = {
                'room': room.id,
                'content': request.data.get('content', '').strip(),
                'sender_type': 'customer'
            }
            
            if not message_data['content']:
                return Response(
                    {'error': 'Message content is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ChatMessageCreateSerializer(data=message_data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            message = serializer.save()
            
            logger.info(f"User {request.user.username} sent message {message.id} in room {room.id}")
            
            return Response({
                'data': ChatMessageSerializer(message).data,
                'message': 'Message sent successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error sending user message: {e}")
            return Response(
                {'error': 'Failed to send message'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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


class AdminChatRoomViewSet(viewsets.ModelViewSet):
    """Admin chat room management endpoint"""
    serializer_class = ChatRoomListSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'post', 'patch', 'delete']
    
    def get_queryset(self):
        """Get all chat rooms for admin"""
        return ChatRoom.objects.all().order_by('-last_message_at')
    
    def get_serializer_class(self):
        """Use detailed serializer for individual room retrieval"""
        if self.action == 'retrieve':
            return ChatRoomSerializer
        return ChatRoomListSerializer
    
    @action(detail=True, methods=['get'])
    def get_messages(self, request, pk=None):
        """Get messages for a specific chat room"""
        try:
            room = self.get_object()
            messages = room.messages.all().order_by('created_at')
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return Response(
                {'error': 'Failed to get messages'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send admin message in a chat room"""
        try:
            room = self.get_object()
            
            message_data = {
                'room': room.id,
                'content': request.data.get('content', '').strip(),
                'sender_type': 'admin'
            }
            
            if not message_data['content']:
                return Response(
                    {'error': 'Message content is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ChatMessageCreateSerializer(data=message_data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            message = serializer.save()
            
            # Mark all customer messages as read
            room.messages.filter(sender_type='customer', is_read=False).update(is_read=True)
            
            logger.info(f"Admin {request.user.username} sent message {message.id} in room {room.id}")
            
            return Response({
                'data': ChatMessageSerializer(message).data,
                'message': 'Message sent successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error sending admin message: {e}")
            return Response(
                {'error': 'Failed to send message'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark all customer messages in a room as read"""
        try:
            room = self.get_object()
            updated_count = room.messages.filter(sender_type='customer', is_read=False).update(is_read=True)
            
            logger.info(f"Admin marked {updated_count} messages as read in room {room.id}")
            
            return Response({
                'message': f'Marked {updated_count} messages as read',
                'updated_count': updated_count
            })
            
        except Exception as e:
            logger.error(f"Error marking messages as read: {e}")
            return Response(
                {'error': 'Failed to mark messages as read'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def close_room(self, request, pk=None):
        """Close a chat room"""
        try:
            room = self.get_object()
            room.status = 'closed'
            room.save()
            
            logger.info(f"Admin closed chat room {room.id}")
            
            return Response({
                'message': 'Chat room closed successfully',
                'room': ChatRoomSerializer(room).data
            })
            
        except Exception as e:
            logger.error(f"Error closing chat room: {e}")
            return Response(
                {'error': 'Failed to close chat room'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
