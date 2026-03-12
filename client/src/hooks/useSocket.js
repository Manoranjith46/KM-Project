import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';

export default function useSocket(phoneNumber, role = 'resident') {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!phoneNumber) return;

    const socket = io(SOCKET_URL, {
      query: { phoneNumber, role },
      withCredentials: true,
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [phoneNumber]);

  return socketRef;
}
