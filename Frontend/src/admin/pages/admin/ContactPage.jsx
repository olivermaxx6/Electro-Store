import React, { useState, useEffect } from 'react';
import { Mail, User, Clock, CheckCircle, XCircle, MessageSquare, Trash2, AlertTriangle } from 'lucide-react';
import { ThemeLayout, ThemeCard, SectionHeader } from '@shared/theme';
import { listContacts, markContactAsRead, markContactAsReplied, closeContact, deleteContact } from '@shared/admin/lib/api';

export default function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionContactId, setActionContactId] = useState(null);

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await listContacts();
        setContacts(response.data.results || response.data);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
        setError(err.uiMessage || 'Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    // Mark as read if it's new
    if (contact.status === 'new') {
      markAsRead(contact.id);
    }
  };

  const markAsRead = async (contactId) => {
    try {
      await markContactAsRead(contactId);
      // Update the contact status in the list
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, status: 'read' } : contact
      ));
      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => ({ ...prev, status: 'read' }));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAsReplied = async (contactId) => {
    try {
      await markContactAsReplied(contactId);
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, status: 'replied' } : contact
      ));
      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => ({ ...prev, status: 'replied' }));
      }
    } catch (err) {
      console.error('Failed to mark as replied:', err);
    }
  };

  const closeContactHandler = async (contactId) => {
    setActionContactId(contactId);
    setShowCloseConfirm(true);
  };

  const confirmCloseContact = async () => {
    try {
      await closeContact(actionContactId);
      setContacts(prev => prev.map(contact => 
        contact.id === actionContactId ? { ...contact, status: 'closed' } : contact
      ));
      if (selectedContact?.id === actionContactId) {
        // Immediately close the contact details panel
        setSelectedContact(null);
      }
    } catch (err) {
      console.error('Failed to close contact:', err);
    } finally {
      setShowCloseConfirm(false);
      setActionContactId(null);
    }
  };

  const deleteContactHandler = async (contactId) => {
    setActionContactId(contactId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteContact = async () => {
    try {
      await deleteContact(actionContactId);
      setContacts(prev => prev.filter(contact => contact.id !== actionContactId));
      if (selectedContact?.id === actionContactId) {
        setSelectedContact(null);
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
    } finally {
      setShowDeleteConfirm(false);
      setActionContactId(null);
    }
  };

  const closeContactDetails = () => {
    setSelectedContact(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'read': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'replied': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <MessageSquare className="w-4 h-4" />;
      case 'read': return <CheckCircle className="w-4 h-4" />;
      case 'replied': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const newContactsCount = contacts.filter(contact => contact.status === 'new').length;

  return (
    <ThemeLayout>
      <SectionHeader 
        title="Contact Messages" 
        icon="📧" 
        color="primary"
        subtitle="Manage contact form submissions from customers"
      />
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contacts List */}
        <ThemeCard className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Contact Messages
            </h3>
            {newContactsCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {newContactsCount}
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-slate-500 dark:text-slate-400">Loading contacts...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 dark:text-red-400">{error}</div>
              </div>
            ) : !contacts || contacts.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No contact messages yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Messages will appear here when customers submit the contact form
                </p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                      {contact.name ? contact.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {contact.name}
                        </p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(contact.status)}`}>
                          {getStatusIcon(contact.status)}
                          <span className="ml-1 capitalize">{contact.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-1">
                        {contact.subject}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {formatTime(contact.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ThemeCard>

        {/* Contact Details */}
        <ThemeCard className="lg:col-span-2">
          {selectedContact ? (
            <div className="space-y-6">
              {/* Contact Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                    {selectedContact.name ? selectedContact.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {selectedContact.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedContact.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(selectedContact.status)}`}>
                    {getStatusIcon(selectedContact.status)}
                    <span className="ml-2 capitalize">{selectedContact.status}</span>
                  </div>
                  <button
                    onClick={closeContactDetails}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Close contact details"
                  >
                    <XCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Subject
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300">
                    {selectedContact.subject}
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Message
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Received {formatTime(selectedContact.created_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {/* Main Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => markAsRead(selectedContact.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedContact.status === 'read' || selectedContact.status === 'replied'
                        ? 'bg-blue-700 text-white cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={selectedContact.status === 'read' || selectedContact.status === 'replied'}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => closeContactHandler(selectedContact.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedContact.status === 'closed'
                        ? 'bg-gray-700 text-white cursor-default'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                    disabled={selectedContact.status === 'closed'}
                  >
                    Closed
                  </button>
                </div>
                
                {/* Delete Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => deleteContactHandler(selectedContact.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    title="Permanently delete this conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Mail className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Select a contact message to view details
                </p>
              </div>
            </div>
          )}
        </ThemeCard>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Close Conversation
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to close this conversation? This action can be undone by marking it as read again.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  setActionContactId(null);
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseContact}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Delete Conversation
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              <strong>Warning:</strong> This action cannot be undone. The conversation and all its data will be permanently deleted.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setActionContactId(null);
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteContact}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeLayout>
  );
}
