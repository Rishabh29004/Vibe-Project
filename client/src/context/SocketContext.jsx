import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5001', {
        query: { userId: user._id },
        transports: ['websocket'] // Force websocket for reliability
      });

      console.log('Attempting socket connection for user:', user._id);

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      setSocket(newSocket);

      newSocket.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        console.log('Closing socket connection');
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
