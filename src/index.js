import express from 'express';
import {matchRouter} from "./routes/matches.js";
import http from 'http';
import { attachWebsocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';
import { commentaryRouter } from './routes/commentary.js';

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

/* The Middleware To read Json Context  */
app.use(express.json());

app.use(securityMiddleware());

// Root Route 
app.get('/', (req, res) =>{
    res.send('Hello from express server!');
});


app.use('/matches', matchRouter);
app.use('/matches/:id/commentary', commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary} = attachWebsocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated; 
app.locals.broadcastCommentary = broadcastCommentary; 

// The Logging to let us know we're live
server.listen(PORT, HOST,()=>{
    
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}`: `http://${HOST}:${PORT}`;

    console.log(`Server is running on ${baseUrl}`);
    console.log(`Websocket Server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});
