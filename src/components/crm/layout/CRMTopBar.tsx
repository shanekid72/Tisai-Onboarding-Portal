import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useCRMData } from '../../../context/CRMDataContext';

interface CRMTopBarProps {
  onMenuClick: () => void;
}

const CRMTopBar: React.FC<CRMTopBarProps> = ({ onMenuClick }) => {
  const { authState, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { state, updateSearch, clearSearch, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } = useCRMData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = getUnreadNotificationCount();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      updateSearch(query);
      setShowSearchResults(true);
    } else {
      clearSearch();
      setShowSearchResults(false);
    }
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id);
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Handle logout with proper redirect
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      // Redirect to admin login page with success message
      navigate('/admin?message=Successfully logged out');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="block w-80 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search contacts, organizations, tasks..."
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && state.search.query && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {state.search.isSearching ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">Searching...</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {/* Contacts Results */}
                    {state.search.results.contacts.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
                          Contacts ({state.search.results.contacts.length})
                        </h4>
                        {state.search.results.contacts.slice(0, 3).map((contact) => (
                          <div key={contact.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <img
                                src={contact.photoUrl || `https://ui-avatars.com/api/?name=${contact.displayName}&background=3B82F6&color=fff`}
                                alt={contact.displayName}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.displayName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{contact.company}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Organizations Results */}
                    {state.search.results.organizations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
                          Organizations ({state.search.results.organizations.length})
                        </h4>
                        {state.search.results.organizations.slice(0, 3).map((org) => (
                          <div key={org.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <img
                                src={org.logoUrl || `https://ui-avatars.com/api/?name=${org.name}&background=8B5CF6&color=fff`}
                                alt={org.name}
                                className="w-8 h-8 rounded-lg"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{org.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{org.industry}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {state.search.results.contacts.length === 0 && 
                     state.search.results.organizations.length === 0 && 
                     state.search.results.interactions.length === 0 && 
                     state.search.results.tasks.length === 0 && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <p>No results found for "{state.search.query}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {state.notifications.length > 0 ? (
                    state.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${authState.user?.fullName}&background=3B82F6&color=fff`}
                alt={authState.user?.fullName}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{authState.user?.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{authState.user?.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Preferences
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Help & Support
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CRMTopBar; 