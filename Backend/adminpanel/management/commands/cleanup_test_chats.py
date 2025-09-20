from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from adminpanel.models import ChatRoom, ChatMessage


class Command(BaseCommand):
    help = 'Delete all test chat rooms and messages from the admin side'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion (required to actually delete)',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL chat rooms and messages. '
                    'Use --confirm flag to proceed with deletion.'
                )
            )
            return

        self.stdout.write('🧹 Cleaning up test chats...')
        
        # Count before deletion
        total_rooms = ChatRoom.objects.count()
        total_messages = ChatMessage.objects.count()
        
        self.stdout.write(f'📊 Found {total_rooms} chat rooms and {total_messages} messages')
        
        # Delete all messages first (to avoid foreign key constraints)
        deleted_messages = ChatMessage.objects.all().delete()
        self.stdout.write(f'🗑️ Deleted {deleted_messages[0]} messages')
        
        # Delete all chat rooms
        deleted_rooms = ChatRoom.objects.all().delete()
        self.stdout.write(f'🗑️ Deleted {deleted_rooms[0]} chat rooms')
        
        # Verify cleanup
        remaining_rooms = ChatRoom.objects.count()
        remaining_messages = ChatMessage.objects.count()
        
        if remaining_rooms == 0 and remaining_messages == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ All test chats cleaned up successfully!')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ Cleanup incomplete: {remaining_rooms} rooms, {remaining_messages} messages remaining')
            )
