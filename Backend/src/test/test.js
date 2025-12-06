import http from 'k6/http';
import { check, sleep } from 'k6';

const RECEIVER_ID = '3'; // must exist in your users table
const BASE_URL = 'https://full-stack-chat-application-sb2f.onrender.com/api/messages';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2NDQ0NjM0NywiZXhwIjoxNzY1MDUxMTQ3fQ.Q5G8Wln2um-as8LkN_EK-MgcVBWM2jEASagD9iG9Pek';

export const options = {
    stages: [
        { duration: '10s', target: 100 },  // 10 second mein 1 se 100 VUs tak jao
        { duration: '20s', target: 100 },  // 20 second tak 100 VUs par maintain rakho
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

    // ✅ Send cookie named 'jwt'
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
