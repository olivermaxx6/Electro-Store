from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from adminpanel.models import ChatRoom, ChatMessage


class Command(BaseCommand):
    help = 'Clean up chat rooms by removing test/unused rooms and keeping only rooms linked to real registered users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting anything',
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion (required to actually delete when not using --dry-run)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        confirm = options['confirm']
        
        if not dry_run and not confirm:
            self.stdout.write(
                self.style.WARNING(
                    'This will permanently delete chat rooms and their messages. '
                    'Use --dry-run to see what would be deleted, or --confirm to proceed with deletion.'
                )
            )
            return

        self.stdout.write('🧹 Starting chat room cleanup...')
        
        # Get initial counts
        total_rooms_before = ChatRoom.objects.count()
        total_messages_before = ChatMessage.objects.count()
        
        self.stdout.write(f'📊 Initial state: {total_rooms_before} chat rooms, {total_messages_before} messages')
        
        # Identify rooms to delete
        rooms_to_delete = self._identify_rooms_to_delete()
        
        if not rooms_to_delete:
            self.stdout.write(
                self.style.SUCCESS('✅ No rooms need to be cleaned up! All rooms are linked to real users.')
            )
            return
        
        # Show what will be deleted
        self._show_deletion_summary(rooms_to_delete, dry_run)
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('🔍 DRY RUN: No actual deletions performed. Use --confirm to proceed.')
            )
            return
        
        # Perform the actual deletion
        deleted_rooms, deleted_messages = self._perform_deletion(rooms_to_delete)
        
        # Show final results
        self._show_final_results(total_rooms_before, total_messages_before, deleted_rooms, deleted_messages)

    def _identify_rooms_to_delete(self):
        """
        Identify chat rooms that should be deleted based on the cleanup criteria:
        1. Rooms with no related user (room.user is None)
        2. Rooms named "Anonymous User" 
        3. Rooms with no messages
        """
        rooms_to_delete = []
        
        # Get all chat rooms
        all_rooms = ChatRoom.objects.all()
        
        for room in all_rooms:
            should_delete = False
            reason = []
            
            # Check if room has no user
            if room.user is None:
                should_delete = True
                reason.append("no user")
            
            # Check if room is named "Anonymous User"
            if room.customer_name == "Anonymous User":
                should_delete = True
                reason.append("Anonymous User")
            
            # Check if room has no messages
            message_count = room.messages.count()
            if message_count == 0:
                should_delete = True
                reason.append("no messages")
            
            if should_delete:
                rooms_to_delete.append({
                    'room': room,
                    'reason': ', '.join(reason),
                    'message_count': message_count,
                    'customer_name': room.customer_name,
                    'user': room.user.username if room.user else 'None'
                })
        
        return rooms_to_delete

    def _show_deletion_summary(self, rooms_to_delete, dry_run):
        """Show a summary of what will be deleted"""
        total_messages_to_delete = sum(room['message_count'] for room in rooms_to_delete)
        
        self.stdout.write(f'\n📋 Cleanup Summary:')
        self.stdout.write(f'   Rooms to delete: {len(rooms_to_delete)}')
        self.stdout.write(f'   Messages to delete: {total_messages_to_delete}')
        
        # Group by reason for better visibility
        reason_counts = {}
        for room in rooms_to_delete:
            reason = room['reason']
            reason_counts[reason] = reason_counts.get(reason, 0) + 1
        
        self.stdout.write(f'\n📊 Deletion reasons:')
        for reason, count in reason_counts.items():
            self.stdout.write(f'   - {reason}: {count} rooms')
        
        # Show some examples (first 10)
        if rooms_to_delete:
            self.stdout.write(f'\n🔍 Example rooms to be deleted:')
            for i, room_info in enumerate(rooms_to_delete[:10]):
                room = room_info['room']
                self.stdout.write(
                    f'   {i+1}. ID: {room.id} | '
                    f'Customer: {room_info["customer_name"]} | '
                    f'User: {room_info["user"]} | '
                    f'Messages: {room_info["message_count"]} | '
                    f'Reason: {room_info["reason"]}'
                )
            
            if len(rooms_to_delete) > 10:
                self.stdout.write(f'   ... and {len(rooms_to_delete) - 10} more rooms')

    def _perform_deletion(self, rooms_to_delete):
        """Perform the actual deletion of rooms and their messages"""
        deleted_rooms = 0
        deleted_messages = 0
        
        self.stdout.write(f'\n🗑️ Deleting {len(rooms_to_delete)} rooms...')
        
        with transaction.atomic():
            for room_info in rooms_to_delete:
                room = room_info['room']
                
                # Count messages before deletion
                message_count = room.messages.count()
                
                # Delete the room (messages will be cascade deleted)
                room.delete()
                
                deleted_rooms += 1
                deleted_messages += message_count
                
                # Show progress for large deletions
                if deleted_rooms % 100 == 0:
                    self.stdout.write(f'   Progress: {deleted_rooms}/{len(rooms_to_delete)} rooms deleted')
        
        return deleted_rooms, deleted_messages

    def _show_final_results(self, total_rooms_before, total_messages_before, deleted_rooms, deleted_messages):
        """Show the final results of the cleanup operation"""
        remaining_rooms = ChatRoom.objects.count()
        remaining_messages = ChatMessage.objects.count()
        
        self.stdout.write(f'\n📈 Cleanup Results:')
        self.stdout.write(f'   Rooms before: {total_rooms_before}')
        self.stdout.write(f'   Rooms deleted: {deleted_rooms}')
        self.stdout.write(f'   Rooms remaining: {remaining_rooms}')
        self.stdout.write(f'   Messages before: {total_messages_before}')
        self.stdout.write(f'   Messages deleted: {deleted_messages}')
        self.stdout.write(f'   Messages remaining: {remaining_messages}')
        
        # Show remaining rooms info
        if remaining_rooms > 0:
            self.stdout.write(f'\n✅ Remaining rooms (linked to real users):')
            remaining_room_list = ChatRoom.objects.select_related('user').all()[:10]
            for room in remaining_room_list:
                user_info = room.user.username if room.user else 'No user'
                message_count = room.messages.count()
                self.stdout.write(
                    f'   - ID: {room.id} | '
                    f'Customer: {room.customer_name} | '
                    f'User: {user_info} | '
                    f'Messages: {message_count}'
                )
            
            if remaining_rooms > 10:
                self.stdout.write(f'   ... and {remaining_rooms - 10} more rooms')
        
        # Success message
        if deleted_rooms > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Cleanup completed successfully! '
                    f'Deleted {deleted_rooms} rooms and {deleted_messages} messages. '
                    f'{remaining_rooms} rooms remain (all linked to real users).'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('✅ No cleanup needed - all rooms are already properly linked to real users!')
            )
