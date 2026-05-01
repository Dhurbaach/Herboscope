import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './context/userContext';
import api from '../utils/api';

export default function NotificationCenter({ inline = false, includeRead = false }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Fetch notifications when user logs in or component mounts
  useEffect(() => {
    if (user && user.email) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user, includeRead]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const endpoint = includeRead
        ? `/inquiries/user/replies/${user.email}`
        : `/inquiries/user/notifications/${user.email}`;
      const response = await api.get(endpoint);
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (inquiryId) => {
    try {
      await api.put(`/inquiries/user/mark-read/${inquiryId}`);
      setNotifications((prev) => {
        if (includeRead) {
          return prev.map((n) => (n._id === inquiryId ? { ...n, userRead: true } : n));
        }
        return prev.filter((n) => n._id !== inquiryId);
      });
      setExpandedId(null);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismissAll = async () => {
    const unreadItems = notifications.filter((notification) => !notification.userRead);
    for (const notification of unreadItems) {
      try {
        await api.put(`/inquiries/user/mark-read/${notification._id}`);
      } catch (error) {
        console.error('Error dismissing notification:', error);
      }
    }
    if (includeRead) {
      setNotifications((prev) => prev.map((n) => ({ ...n, userRead: true })));
    } else {
      setNotifications([]);
    }
  };

  const getPlantId = (notification) => {
    if (!notification?.plantId) return null;
    return typeof notification.plantId === 'object' ? notification.plantId._id : notification.plantId;
  };

  const getPlantLabel = (notification) => {
    if (!notification?.plantId) return 'Unknown plant';
    if (typeof notification.plantId === 'object') {
      const plantName = notification.plantId.plantName || 'Unknown plant';
      const scientificName = notification.plantId.scientificName;
      return scientificName ? `${plantName} (${scientificName})` : plantName;
    }
    return 'Selected plant';
  };

  const getLatestReply = (notification) => {
    if (notification?.replies && notification.replies.length > 0) {
      return notification.replies[notification.replies.length - 1];
    }
    return { replyText: notification?.reply, replyDate: notification?.replyDate, adminName: 'Expert' };
  };

  const getAllReplies = (notification) => {
    if (notification?.replies && notification.replies.length > 0) {
      return notification.replies;
    }
    return notification?.reply ? [{ replyText: notification.reply, replyDate: notification.replyDate, adminName: 'Expert' }] : [];
  };

  if (!inline && notifications.length === 0) {
    return null;
  }

  if (loadingNotifications && inline) {
    return (
      <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl z-50 border border-white/10 p-4 text-sm text-slate-200">
        Loading notifications...
      </div>
    );
  }

  if (inline && notifications.length === 0) {
    return (
      <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl z-50 border border-white/10 p-4 text-white">
        <p className="font-semibold text-cyan-100">Expert Replies</p>
        <p className="text-sm text-slate-300/80 mt-2">No replies yet.</p>
      </div>
    );
  }

  const containerClass = inline
    ? 'absolute right-0 mt-2 w-80 rounded-xl z-50'
    : 'fixed top-20 right-4 z-50 max-w-md space-y-3';

  return (
    <div className={containerClass}>
      {/* Notification Count Badge */}
      <div className={inline ? 'p-4 text-white bg-gray-800 rounded-xl border border-white/10' : 'bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg p-4 text-white shadow-lg border border-cyan-400/50'}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-700 rounded-full text-sm font-bold text-white">
              {notifications.length}
            </span>
            <span className="font-semibold text-slate-50">
              {includeRead ? 'Expert Reply History' : `New Expert Reply${notifications.length > 1 ? 's' : ''}`}
            </span>
          </div>
          <button
            onClick={handleDismissAll}
            className="text-xs hover:bg-white/20 px-2 py-1 rounded transition"
          >
            Mark All Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/80 transition"
              onClick={() => setExpandedId(expandedId === notification._id ? null : notification._id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Expert Reply</p>
                  <p className="text-[11px] text-cyan-100/80 mt-1">
                    Plant: {getPlantLabel(notification)}
                  </p>
                  <p className="text-[11px] text-slate-200/70 mt-1">
                    {notification.userRead ? 'Read' : 'Unread'}
                  </p>
                  <p className="text-xs text-slate-100/85 mt-1">
                    {getLatestReply(notification).replyText?.substring(0, 60)}
                    {getLatestReply(notification).replyText && getLatestReply(notification).replyText.length > 60 ? '...' : ''}
                  </p>
                </div>
                {!notification.userRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                    className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold transition"
                  >
                    Read
                  </button>
                )}
              </div>

              {/* Expanded View */}
              {expandedId === notification._id && (
                <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                  {getAllReplies(notification).map((r, idx) => (
                    <div key={idx} className="mb-2 pb-2 border-b border-white/10 last:border-b-0">
                      <p className="text-[11px] text-cyan-100/80 font-semibold">{r.adminName} ({new Date(r.replyDate).toLocaleString()})</p>
                      <p className="text-sm text-white mt-1">{r.replyText}</p>
                    </div>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const plantId = getPlantId(notification);
                      if (plantId) {
                        navigate(`/plant/${plantId}`);
                      }
                      handleMarkAsRead(notification._id);
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded font-semibold transition mt-3"
                  >
                    View Plant & Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
