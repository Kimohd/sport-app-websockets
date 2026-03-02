import { WebSocket, WebSocketServer } from "ws";

// Helper Function Sending JSON object, actually it prevent repetitive JSON.stringify calls and ensure the socket is open before sending
function sendJson( socket, payload){
    // CHECKING THE STATE OF THE SOCKET
    if(socket.readyState !== WebSocket.OPEN) return; // 'return'= gard function, if not open exit
    
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload){  
    // WSS.CLIENTS = ALL ACTIVE USERS
    for (const client of wss.clients){ 
        //CHECKING THE STATE OF THE CLIENT
        if (client.readyState !== WebSocket.OPEN) continue;
        client.send(JSON.stringify(payload));
    } 
}

// Attach the websocket logic to our node server
export function attachWebsocketServer(server){
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024
    });

    wss.on('connection', (socket) => {
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true });

        sendJson(socket, { type:'Welcome' });

        socket.on('error', console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach( (ws) => {
            if(ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    function broadcastMatchCreated(match){
        broadcast(wss, { type: 'match created', data: match });

    }

    return { broadcastMatchCreated };
} 