const express = require('express');
const app = express();
const port = 8003;

app.listen(port, () => {
    console.log(`Application server 3 listening at http://localhost:${port}`);
});

app.get('/health', (req, res) => {
    // console.log('Application server 3 is running');
    res.status(200).send('Application server 3 is running');
});

app.get('/', (req, res) => {
    setTimeout(() => {
        console.log('Application server 3');
        res.send('Rsponse from app server 3')
    }, 2000);
});