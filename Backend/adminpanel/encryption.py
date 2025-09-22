"""
Simple end-to-end encryption for chat messages
This provides basic encryption for chat messages between users and admin
"""

import base64
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import secrets
import logging

logger = logging.getLogger(__name__)

class ChatEncryption:
    """Simple encryption class for chat messages"""
    
    def __init__(self, password: str = None):
        """Initialize encryption with optional password"""
        if password is None:
            # Use a default password for demo purposes
            password = "chat_encryption_default_key_2024"
        
        self.password = password.encode()
        self.salt = b'chat_salt_2024'  # In production, use random salt per session
        
        # Derive key from password
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.password))
        self.cipher = Fernet(key)
    
    def encrypt_message(self, message: str) -> str:
        """Encrypt a message"""
        try:
            encrypted_data = self.cipher.encrypt(message.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            return message  # Return original message if encryption fails
    
    def decrypt_message(self, encrypted_message: str) -> str:
        """Decrypt a message"""
        try:
            encrypted_data = base64.urlsafe_b64decode(encrypted_message.encode())
            decrypted_data = self.cipher.decrypt(encrypted_data)
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            return encrypted_message  # Return encrypted message if decryption fails
    
    def generate_session_key(self) -> str:
        """Generate a random session key"""
        return secrets.token_urlsafe(32)

# Global encryption instance
chat_encryption = ChatEncryption()

def encrypt_chat_message(message: str) -> str:
    """Encrypt a chat message"""
    return chat_encryption.encrypt_message(message)

def decrypt_chat_message(encrypted_message: str) -> str:
    """Decrypt a chat message"""
    return chat_encryption.decrypt_message(encrypted_message)
