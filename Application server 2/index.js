const express = require('express');
const app = express();
const port = 8002;

app.listen(port, () => {
    console.log(`Application server 2 listening at http://localhost:${port}`);
});

app.get('/health', (req, res) => {
    // console.log('Application server 2 is running');
    res.status(200).send('Application server 2 is running');
});

app.get('/', (req, res) => {
    console.log('Application server 2');
    res.send('Rsponse from app server 2')
});