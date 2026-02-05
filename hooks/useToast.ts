import { useCallback, useState } from 'react';
import { ToastNotificationData } from '../components/overlays/ToastNotification';

export const useToast = () => {
  const [notification, setNotification] = useState<ToastNotificationData | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((prev) => (prev && prev.message === message ? null : prev));
    }, 3000);
  }, []);

  return { notification, showToast };
};
