const express = require('express');
const axios = require('axios')
const app = express();


const port = 8000;

const SERVER_STATUS = {
    RUNNING: 'RUNNING',
    DOWN: 'DOWN',
    TEMPERARY_REMOVED: 'TEMPERARY_REMOVED'
}

const options = {
    ADD_PORT: 'addPort',
    REMOVE_PORT: 'removePort'
}

const listOfServers = [
    {name: 'Application server 1', link: 'http://localhost:8001', status: SERVER_STATUS.RUNNING},
    {name: 'Application server 2', link: 'http://localhost:8002', status: SERVER_STATUS.RUNNING}, 
    {name: 'Application server 3', link: 'http://localhost:8003', status: SERVER_STATUS.RUNNING}
];

// Track the current application server to send request
let current = 0;

const updateNextRunningServer = () => {
    let nextServer = current;
    for(let index = 0; index < listOfServers.length; index++) {
        nextServer === (listOfServers.length-1) ? nextServer = 0 : nextServer++
        if(listOfServers[nextServer].status === SERVER_STATUS.RUNNING) {
            current = nextServer;
            break;
        }
    }
}

// Receive new request
// Forward to application server
const handler = async (req, res) =>{
  
    // Destructure following properties from request object
    const { method, url, headers, body } = req;
  
    // Select the current server to forward the request
    const server = listOfServers[current];
  
    // Update track to select next server
    updateNextRunningServer()
  
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
    console.log("")
    console.log("")
   console.log("-----------------start of testing-----------------")

   for(let server of listOfServers) {
    if(server.status !== SERVER_STATUS.TEMPERARY_REMOVED) {
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
   }
   let statusString = 'Using server: ';
   for(let server of listOfServers) {
         if(server.status === SERVER_STATUS.RUNNING) {
              statusString += `${server.name}, `
         }
   }
//    console.log(statusString);
   console.log("-----------------end of testing-----------------")
   console.log("")
   console.log("")
}

const setupServer = (req, res, port, option) => {
    if(option === options.ADD_PORT) {
        for(let index = 0; index < listOfServers.length; index++) {
            if(listOfServers[index].link.includes(port)) {
                listOfServers[index].status = SERVER_STATUS.RUNNING;
                console.log(`${listOfServers[index].name} is added`);
                return res.status(200).send('Server with port ' + port + ' is added');
            }
        }
    }
    else if(option === options.REMOVE_PORT) {
        for(let index = 0; index < listOfServers.length; index++) {
            if(listOfServers[index].link.includes(port)) {
                listOfServers[index].status = SERVER_STATUS.TEMPERARY_REMOVED;
                console.log(`${listOfServers[index].name} is removed`);
                return res.status(200).send('Server with port ' + port + ' is removed');

            }
        }
    }
}

// When receive new request
// Pass it to handler method
app.use((req,res)=>{
    if(req.method === 'GET' && req._parsedUrl.pathname === '/serverSetup') {
        const port = req.query.port;
        const option = req.query.option;
        setupServer(req, res, port, option);
    }
    else {
        handler(req, res)
    }
});

app.listen(port, () => {
    console.log(`Main server listening at http://localhost:${port}`);
    setInterval(healthCheckForMultipleServer, 5000);
});