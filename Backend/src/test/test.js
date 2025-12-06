import http from 'k6/http';
import { check, sleep } from 'k6';

const RECEIVER_ID = '3'; 
const BASE_URL = 'https://full-stack-chat-application-sb2f.onrender.com/api/messages';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2NTA1MjI3MiwiZXhwIjoxNzY1NjU3MDcyfQ.nVhFxc5g1vpjYiIrcbTyDzYHzaXS1YBrpCpA0G04m80';

export const options = {
    stages: [
        { duration: '10s', target: 100 },  
        { duration: '20s', target: 100 },  
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        checks: ['rate>0.99'],
    },
};

export default function () {
    const url = `${BASE_URL}/send/${RECEIVER_ID}`;

    const payload = JSON.stringify({
        text: `Load Test Message from VU ${__VU} at ${Date.now()}`,
        image: null,
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
        cookies: { jwt: TEST_TOKEN },
    };

    const res = http.post(url, payload, params);

    if (res.status !== 201) {
        console.error(`❌ ERROR (VU ${__VU}): Status ${res.status}, Response: ${res.body}`);
    }

    check(res, {
        'Status is 201': (r) => r.status === 201,
        'Body exists': (r) => r.body && r.body.length > 0,
    });

    sleep(Math.random() * 0.5 + 0.5);
}
