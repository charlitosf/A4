const express = require('express');
require('dotenv').config();
const axios = require('axios')

const PORT = process.env.PORT || 5000
const seconds = process.env.SECONDS || 0;
const minutes = process.env.MINUTES || 1;
const hours = process.env.HOURS || 0;
const days = process.env.DAYS || 0;
let interval;
if (days <= 1)
    interval = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000
else
    interval = (86400 + hours * 3600 + minutes * 60 + seconds) * 1000

let i = 1;
console.log(`Requests starting every ${interval / 1000} seconds`)
setInterval(() => {
    if (i < days)
        i++;
    else {
        axios.get('https://www.google.com').then((res) => console.log(res.status))
        i = 1;
    }
}, interval);

express()
    .get('/', (req, res) => res.send({interval: interval}))
    .listen(PORT, () => console.log(`Listening on port: ${PORT}`))
