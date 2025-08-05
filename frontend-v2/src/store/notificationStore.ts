/*
 * ================================================================================================
 * STORE NOTIFICATIONS - ZUSTAND
 * ================================================================================================
 * 
 * Gestion globale des notifications utilisateur avec Zustand.
 * Support des notifications toast, alertes et messages système.
 * 
 * ================================================================================================
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  timestamp: number;
}

interface NotificationState {
  // État
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  // État initial
  notifications: [],

  // Actions
  addNotification: (notificationData) => {
    const notification: Notification = {
      id: nanoid(),
      timestamp: Date.now(),
      duration: 4500, // Durée par défaut
      ...notificationData,
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-suppression après la durée spécifiée
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== notification.id),
        }));
      }, notification.duration);
    }
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),

  clearAllNotifications: () => set({ notifications: [] }),
}));
