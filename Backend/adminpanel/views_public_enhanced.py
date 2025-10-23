# Enhanced Chat Room ViewSet with proper user isolation
class PublicChatRoomViewSet(viewsets.ModelViewSet):
    """Public chat room endpoint for customers to chat with admin"""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post', 'delete']  # Allow GET, POST, DELETE
    
    def get_queryset(self):
        """Ensure users only see their own chat rooms"""
        # If user is authenticated, show their rooms only
        if self.request.user and not self.request.user.is_anonymous:
            return ChatRoom.objects.filter(user=self.request.user).order_by('-last_message_at')
        
        # Anonymous users see rooms by session only
        session_key = self.request.session.session_key
        if not session_key:
            return ChatRoom.objects.none()
        
        return ChatRoom.objects.filter(customer_session=session_key).order_by('-last_message_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new chat room for customer with proper isolation"""
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        # Check if customer already has an active chat room
        existing_room = None
        
        if request.user and not request.user.is_anonymous:
            # For authenticated users, check by user
            existing_room = ChatRoom.objects.filter(
                user=request.user, 
                status__in=['active', 'waiting']
            ).first()
        else:
            # For anonymous users, check by session
            existing_room = ChatRoom.objects.filter(
                customer_session=session_key,
                status__in=['active', 'waiting']
            ).first()
        
        if existing_room:
            serializer = self.get_serializer(existing_room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Create new chat room with proper user isolation
        room_data = {
            'customer_session': session_key,
            'customer_name': request.data.get('customer_name', 'Customer'),
            'customer_email': request.data.get('customer_email', ''),
            'status': 'active'
        }
        
        # Link to authenticated user if logged in
        if request.user and not request.user.is_anonymous:
            room_data['user'] = request.user.id
            # Update customer info from user data
            if not room_data['customer_name'] or room_data['customer_name'] == 'Customer':
                if request.user.first_name and request.user.last_name:
                    room_data['customer_name'] = f"{request.user.first_name} {request.user.last_name}"
                elif request.user.first_name:
                    room_data['customer_name'] = request.user.first_name
                elif request.user.username:
                    room_data['customer_name'] = request.user.username
                else:
                    room_data['customer_name'] = request.user.email or 'User'
            
            if not room_data['customer_email']:
                room_data['customer_email'] = request.user.email
        
        serializer = self.get_serializer(data=room_data)
        serializer.is_valid(raise_exception=True)
        chat_room = serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def get_object(self):
        """Ensure users can only access their own rooms"""
        obj = super().get_object()
        
        # Additional security check
        if self.request.user and not self.request.user.is_anonymous:
            if obj.user != self.request.user:
                raise PermissionDenied("You can only access your own chat rooms")
        else:
            session_key = self.request.session.session_key
            if obj.customer_session != session_key:
                raise PermissionDenied("You can only access your own chat rooms")
        
        return obj

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message from customer to admin with proper validation"""
        room = self.get_object()  # This ensures user can only access their own room
        content = request.data.get('content', '').strip()
        
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update customer name if provided and better than current
        customer_name = request.data.get('customer_name', '').strip()
        if customer_name and customer_name != 'Customer' and customer_name != room.customer_name:
            room.customer_name = customer_name
            room.save()
        
        # Create customer message
        message = ChatMessage.objects.create(
            room=room,
            sender_type='customer',
            sender_name=room.customer_name or 'Customer',
            sender_user=room.user,  # Link to user if authenticated
            content=content,
            is_read=False  # Customer messages start as unread
        )
        
        # Update room status and last message time
        room.status = 'waiting'  # Waiting for admin response
        room.last_message_at = message.created_at
        room.save()
        
        # Return the created message
        message_serializer = ChatMessageSerializer(message)
        return Response({
            'message': 'Message sent successfully',
            'data': message_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def get_messages(self, request, pk=None):
        """Get all messages for a chat room with proper access control"""
        room = self.get_object()  # This ensures user can only access their own room
        messages = room.messages.all().order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

class UserChatRoomViewSet(viewsets.ModelViewSet):
    """User-specific chat room endpoint for authenticated users"""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']  # Allow GET, POST, DELETE
    
    def get_queryset(self):
        """Authenticated users can only see their own chat rooms"""
        return ChatRoom.objects.filter(user=self.request.user).order_by('-last_message_at')
    
    def list(self, request, *args, **kwargs):
        """Get user's chat room (should be only one active room per user)"""
        queryset = self.get_queryset()
        
        if queryset.exists():
            # Return the most recent active room
            room = queryset.first()
            serializer = self.get_serializer(room)
            return Response({
                'count': 1,
                'results': [serializer.data]
            })
        else:
            # No room exists for this user
            return Response({
                'count': 0,
                'results': []
            })
    
    def create(self, request, *args, **kwargs):
        """Create a new chat room for authenticated user"""
        # Check if user already has an active chat room
        existing_room = ChatRoom.objects.filter(
            user=request.user, 
            status__in=['active', 'waiting']
        ).first()
        
        if existing_room:
            # Return existing room instead of creating new one
            serializer = self.get_serializer(existing_room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Create new chat room for authenticated user
        room_data = {
            'user': request.user.id,
            'customer_name': self._get_user_display_name(request.user),
            'customer_email': request.user.email,
            'status': 'active'
        }
        
        serializer = self.get_serializer(data=room_data)
        serializer.is_valid(raise_exception=True)
        chat_room = serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _get_user_display_name(self, user):
        """Get display name for user"""
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        elif user.first_name:
            return user.first_name
        elif user.username:
            return user.username
        else:
            return user.email or 'User'
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message from authenticated user to admin"""
        room = self.get_object()
        content = request.data.get('content', '').strip()
        
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update customer name if provided and better than current
        customer_name = request.data.get('customer_name', '').strip()
        if customer_name and customer_name != 'Customer' and customer_name != room.customer_name:
            room.customer_name = customer_name
            room.save()
        
        # Create customer message
        message = ChatMessage.objects.create(
            room=room,
            sender_type='customer',
            sender_name=room.customer_name or 'Customer',
            sender_user=request.user,  # Link to authenticated user
            content=content,
            is_read=False  # Customer messages start as unread
        )
        
        # Update room status and last message time
        room.status = 'waiting'  # Waiting for admin response
        room.last_message_at = message.created_at
        room.save()
        
        # Return the created message
        message_serializer = ChatMessageSerializer(message)
        return Response({
            'message': 'Message sent successfully',
            'data': message_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def get_messages(self, request, pk=None):
        """Get all messages for a chat room"""
        room = self.get_object()
        messages = room.messages.all().order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
