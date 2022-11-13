const express = require('express');
const app = express();
const port = 8001;

app.listen(port, () => {
    console.log(`Application server 1 listening at http://localhost:${port}`);
});

app.get('/health', (req, res) => {
    // console.log('Application server 1 is running');
    res.status(200).send('Application server 1 is running');
});

app.get('/', (req, res) => {
    console.log('Application server 1');
    res.send('Rsponse from app server 1')
});