import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    // return io('http://localhost:5001', options);
    return io('https://code-editor-server-production-4dda.up.railway.app/', options);
};
