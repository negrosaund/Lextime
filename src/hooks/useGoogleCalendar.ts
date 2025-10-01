import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useGoogleCalendar() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  const connectGoogleCalendar = async () => {
    alert(
      'Integración con Google Calendar próximamente disponible.\n\n' +
      'Esta función permitirá sincronizar automáticamente tus plazos con Google Calendar.'
    );
  };

  const syncDeadlineToCalendar = async (deadline: any) => {
    if (!isConnected) {
      return;
    }

    console.log('Syncing deadline to Google Calendar:', deadline);
  };

  return {
    isConnected,
    connectGoogleCalendar,
    syncDeadlineToCalendar,
  };
}
