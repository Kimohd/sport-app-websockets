import express from 'express';
import {matchRouter} from "./routes/matches.js";

const app = express();
const port = 8000;

/* The Middleware To read Json Context  */
app.use(express.json());

// Root Route 
app.get('/', (req, res) =>{
    res.send('Hello from express server!');
});

app.use('/matches', matchRouter);

// The Logging to let us know we're live
app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});



