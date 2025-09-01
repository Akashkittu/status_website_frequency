import { useEffect, useRef } from 'react';
import socket from '../utils/socket';

export const useSocket = () => {
  const socketRef = useRef(socket);

  useEffect(() => {
    const currentSocket = socketRef.current;
    
    return () => {
      if (currentSocket) {
        currentSocket.removeAllListeners();
      }
    };
  }, []);

  return socketRef.current;
};