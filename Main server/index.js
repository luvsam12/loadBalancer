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

app.listen(port, () => {
    console.log(`Main server listening at http://localhost:${port}`);
    setInterval(healthCheckForMultipleServer, 5000);
    healthCheckForMultipleServer();
});

app.get('/', (req, res) => {
    console.log('web server');
    res.send('Rsponse from web server ')
});