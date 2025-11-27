import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, BellDot, ChevronDown, LogOut, User, Menu, Check, Mail } from 'lucide-react';
import { UserRole, Notification, NotificationType } from '../../types';

interface HeaderProps {
  userRole: UserRole;
  onLogout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onNavigate: (view: string) => void;
  onToggleMobileSidebar: () => void;
}

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const Header: React.FC<HeaderProps> = ({ userRole, onLogout, notifications, setNotifications, onNavigate, onToggleMobileSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setIsNotificationOpen(false);
        }
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    onNavigate(notification.linkTo);
    setIsNotificationOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: NotificationType) => {
      switch(type) {
          case NotificationType.NewAppointment: return <div className="p-2 bg-blue-100 rounded-full"><User className="h-5 w-5 text-blue-600" /></div>;
          case NotificationType.LowStock: return <div className="p-2 bg-amber-100 rounded-full"><BellDot className="h-5 w-5 text-amber-600" /></div>;
          default: return <div className="p-2 bg-slate-100 rounded-full"><Mail className="h-5 w-5 text-slate-600" /></div>;
      }
  }

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-white shadow-sm flex-shrink-0 z-10 relative">
      <div className="flex items-center">
        {/* Hamburger Menu for mobile */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden mr-3 text-slate-600 hover:text-blue-600"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">{userRole} Dashboard</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-5">
        <div className="relative" ref={notificationRef}>
          <button onClick={() => setIsNotificationOpen(prev => !prev)} className="relative text-slate-500 hover:text-blue-600 transition-colors">
            {unreadCount > 0 ? <BellDot className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center border-2 border-white">{unreadCount}</span>
            )}
          </button>
          {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-20 animate-fade-in-down">
                  <div className="p-3 flex justify-between items-center border-b border-slate-200">
                      <h4 className="font-semibold text-slate-800">Notifications</h4>
                      {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-xs text-blue-600 font-medium hover:underline">Mark all as read</button>
                      )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                          notifications.map(n => (
                              <div key={n.id} onClick={() => handleNotificationClick(n)} className={`flex items-start p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 ${!n.read ? 'bg-blue-50' : ''}`}>
                                  {getNotificationIcon(n.type)}
                                  <div className="ml-3 flex-1">
                                      <p className="text-sm text-slate-700">{n.message}</p>
                                      <p className="text-xs text-slate-500 mt-1">{timeSince(n.timestamp)}</p>
                                  </div>
                                  {!n.read && (
                                      <div className="h-2 w-2 bg-blue-500 rounded-full self-center ml-2 shrink-0"></div>
                                  )}
                              </div>
                          ))
                      ) : (
                          <p className="text-sm text-slate-500 text-center p-6">No new notifications</p>
                      )}
                  </div>
              </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center space-x-2 cursor-pointer group">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-5 w-5 text-slate-600"/>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-700">{userRole}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
           {isProfileOpen && (
             <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 animate-fade-in-down z-20">
                <button
                onClick={onLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
                </button>
            </div>
           )}
        </div>
      </div>
    </header>
  );
};

export default Header;