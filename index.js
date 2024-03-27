require('dotenv').config();
const http = require('http');

let authkey = "";

function setauthkey(key) {
    authkey = key;
    return true;
}

async function getauthkey() {
    return authkey;
}

const auth = () => {
    const postData = JSON.stringify({
        id: process.env.DEVICE_ID
    });

    const options = {
        hostname: process.env.SERVER_HOST,
        port: process.env.SERVER_PORT,
        path: '/api/weather/auth',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const req = http.request(options, res => {
        let data = [];
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Status Code:', res.statusCode);
        console.log('Date in Response header:', headerDate);

        res.on('data', chunk => {
            data.push(chunk);
        });

        res.on('end', () => {
            const responseData = Buffer.concat(data).toString();
            console.log('Response Data:', JSON.parse(responseData));
            setauthkey(JSON.parse(responseData).token);
            setInterval(write, process.env.DATA_INTERVAL); 
        });
    });

    req.on('error', err => {
        console.error('Error:', err.message);
    });

    req.write(postData);
    req.end();
};

const write = () => {
    const postData = JSON.stringify({
        stationId: process.env.DEVICE_ID,
        timestamp: new Date(),
        temperature:Math.floor(Math.random() * (30 - 20 + 1)) + 20,
        humidity:Math.floor(Math.random() * (80 - 40 + 1)) + 40,
        airPressure:Math.floor(Math.random() * (1020 - 1000 + 1)) + 1000,

    });

    const options = {
        hostname: process.env.SERVER_HOST,
        port: process.env.SERVER_PORT,
        path: '/api/metrics/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'authorization': "Bearer " + authkey
        },
    };

    const req = http.request(options, res => {
        let data = [];
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Status Code:', res.statusCode);
        console.log('Date in Response header:', headerDate);

        res.on('data', chunk => {
            data.push(chunk);
        });

        res.on('end', () => {
            const responseData = Buffer.concat(data).toString();
            console.log('Response Data:', JSON.parse(responseData));
        });
    });

    req.on('error', err => {
        console.error('Error:', err.message);
    });

    req.write(postData);
    req.end();
};

if (authkey == "") {
    auth();
} else {
    console.log("writing....")
    setInterval(write, process.env.DATA_INTERVAL);
}
