require('dotenv').config()
const http = require('http');

const auth = () => {

    const postData = JSON.stringify({
      id:process.env.DEVICE_ID
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
        });
    });

    req.on('error', err => {
        console.error('Error:', err.message);
    });

    req.write(postData);
    req.end();
}

auth();