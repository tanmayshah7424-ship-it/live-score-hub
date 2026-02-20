import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    liveMatches: any[];
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false, liveMatches: [] });

// Derive socket URL smartly:
// - If VITE_SOCKET_URL env var is set, use that (explicit override)
// - In production build (Render): connect to same origin (wss:// matches the https:// page)
// - In dev: connect directly to backend port 5001 on the same LAN hostname
const SOCKET_URL = (() => {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
    if (import.meta.env.PROD) return window.location.origin; // e.g. https://scorehub-live.onrender.com
    // Dev: use ws:// with explicit port 5001
    const devProto = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${devProto}//${window.location.hostname}:5001`;
})();

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
