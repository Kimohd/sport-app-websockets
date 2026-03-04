import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

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

    wss.on('connection', async (socket, req) => {

        if(wsArcjet){
            
            try {

                const decision = await wsArcjet.protect(req);
                
                if(decision.isDenied()) {
                   const code = decision.reason.isRateLimit() ? 1013 : 1008;
                   const reason = decision.reason.isRateLimit() ? 'Rate limit exceeded' : 'Access denied';

                   socket.close(code, reason);
                   return;
                }


            } catch(e){
                console.error('Ws connection error', e)
                socket.close(1011, "Server security error");
                return;
            }
        }
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true });

        sendJson(socket, { type:'Welcome' });

        socket.on('error', console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach( (ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })}, 30000);

    wss.on('close', () => clearInterval(interval));

    function broadcastMatchCreated(match){
        broadcast(wss, { type: 'match created', data: match });

    }

    return { broadcastMatchCreated };
} 