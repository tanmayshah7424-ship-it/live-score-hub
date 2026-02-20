import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    liveMatches: any[];
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false, liveMatches: [] });

// Production (Render): frontend + backend on same origin → use window.location.origin
// Development: connect directly to backend port 5001 so other LAN devices work too
const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.PROD
        ? window.location.origin
        : `${window.location.protocol}//${window.location.hostname}:5001`);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [liveMatches, setLiveMatches] = useState<any[]>([]);

    useEffect(() => {
        const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

        s.on('connect', () => {
            console.log('Socket.IO connected:', s.id);
            setConnected(true);
        });

        s.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            setConnected(false);
        });

        // Listen for live match updates
        s.on('liveMatches', (matches: any[]) => {
            setLiveMatches(matches);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected, liveMatches }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
