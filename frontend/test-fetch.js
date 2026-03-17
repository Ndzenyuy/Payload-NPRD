const axios = require('axios');

async function testFetch() {
    try {
        console.log('Fetching from http://localhost:3000/api/pages?limit=100');
        const res = await axios.get('http://localhost:3000/api/pages?limit=100', {
            headers: { 'Origin': 'http://localhost:3001' }
        });
        console.log('Success:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

testFetch();
