require('dotenv').config();
const http = require('http');
const { stations } = require('./data/stationSet');

let authKeys = {};

async function setAuthKey(deviceId, key) {
    authKeys[deviceId] = key;
}

async function getAuthKey(deviceId) {
    return authKeys[deviceId];
}

const auth = (station) => {
    const postData = JSON.stringify({

        dname: station.name,
        apiKey: station.apiKey

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

        res.on('end', async () => {
            const responseData = Buffer.concat(data).toString();
            console.log('Response Data:', JSON.parse(responseData));
            await setAuthKey(station._id, JSON.parse(responseData).token);
            write(station);
        });
    });

    req.on('error', err => {
        console.error('Error:', err.message);
    });

    req.write(postData);
    req.end();
};

const write = (station) => {
    const postData = JSON.stringify({
        stationId: station._id,
        timestamp: new Date(),
        temperature: Math.floor(Math.random() * (40 - (-20) + 1)) + (-20),
        humidity: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
        airPressure: Math.floor(Math.random() * (1050 - 950 + 1)) + 950,
    });

    const options = {
        hostname: process.env.SERVER_HOST,
        port: process.env.SERVER_PORT,
        path: '/api/metrics/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'authorization': "Bearer " + authKeys[station._id]
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
           // console.log('Response Data:', JSON.parse(responseData));
        });
    });

    req.on('error', err => {
        console.error('Error:', err.message);
    });

    req.write(postData);
    req.end();
};

async function main() {
    while (true) {
        stations.forEach(station => {
            if (!authKeys[station._id]) {
                auth(station);
            } else {
                console.log(`Station ${station.name} already authenticated. Writing data...`);
                write(station);
            }
        });
        await new Promise(resolve => setTimeout(resolve, process.env.DATA_INTERVAL));
    }
}

main();
