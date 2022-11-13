const express = require('express');
const axios = require('axios')
const app = express();


const port = 8000;

const SERVER_STATUS = {
    RUNNING: 'RUNNING',
    DOWN: 'DOWN'
}

const listOfServers = [
    {name: 'Application server 1', link: 'http://localhost:8001', status: SERVER_STATUS.RUNNING},
    {name: 'Application server 2', link: 'http://localhost:8002', status: SERVER_STATUS.RUNNING}, 
    {name: 'Application server 3', link: 'http://localhost:8003', status: SERVER_STATUS.RUNNING}
];

// Track the current application server to send request
let current = 0;

// Receive new request
// Forward to application server
const handler = async (req, res) =>{
  
    // Destructure following properties from request object
    const { method, url, headers, body } = req;
  
    // Select the current server to forward the request
    const server = listOfServers[current];
  
    // Update track to select next server
    current === (listOfServers.length-1) ? current = 0 : current++
  
    try{
        // Requesting to underlying application server
        const response = await axios({
            url: `${server.link}${url}`,
            method: method,
            headers: headers,
            data: body
        });
        // Send back the response data
        // from application server to client 
        res.send(response.data)
    }
    catch(err){
        // Send back the error message 
        res.status(500).send("Server error!")    
    }
}

const healthCheckForMultipleServer = async () => {
   console.log("-----------------start of testing-----------------")

   for(let server of listOfServers) {
         await axios.get(`${server.link}/health`)
                .then((res) => {
                    console.log(res.data);
                    listOfServers.find((serverCheck) => server.link === serverCheck.link).status = SERVER_STATUS.RUNNING;
                })
                .catch((err) => {
                    console.log(`${server.name} is down`);
                    listOfServers.find((serverCheck) => server.link === serverCheck.link).status = SERVER_STATUS.DOWN;
                })
   }
   let statusString = 'Using server: ';
   for(let server of listOfServers) {
         if(server.status === SERVER_STATUS.RUNNING) {
              statusString += `${server.name}, `
         }
   }
    console.log(statusString);
   console.log("-----------------end of testing-----------------")
}

// When receive new request
// Pass it to handler method
app.use((req,res)=>{handler(req, res)});

app.listen(port, () => {
    console.log(`Main server listening at http://localhost:${port}`);
    setInterval(healthCheckForMultipleServer, 5000);
    healthCheckForMultipleServer();
});