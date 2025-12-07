import http from 'k6/http';
import { check, sleep } from 'k6';

const RECEIVER_ID = '3'; 
const BASE_URL = 'https://full-stack-chat-application-sb2f.onrender.com/api/messages';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2NTA1MjI3MiwiZXhwIjoxNzY1NjU3MDcyfQ.nVhFxc5g1vpjYiIrcbTyDzYHzaXS1YBrpCpA0G04m80';

export const options = {
    // Vus aur duration ko ignore karte hue scenarios block use karna
    scenarios: {
        constant_load: {
            executor: 'constant-vus',
            vus: 100, // 100 Virtual Users
            duration: '30s', // 30 Seconds tak run karo
            // Graceful stop ko yahaan daal sakte hain agar zaroori ho, ya hata do
        },
    },

    // Thresholds same rakhe hain
    thresholds: {
        http_req_duration: ['p(95)<500'],
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    const url = `${BASE_URL}/${RECEIVER_ID}`;
    
    const params = {
        headers: { 
            'Content-Type': 'application/json',
        },
        cookies: { jwt: TEST_TOKEN }, 
    };

    const res = http.get(url, params);

    // Status code check 200 par hi rahega
    if (res.status !== 200) {
        console.error(`❌ ERROR (VU ${__VU}): Status ${res.status}, URL: ${url}`);
    }

    check(res, {
        'Status is 200': (r) => r.status === 200, 
        'Body exists': (r) => r.body && r.body.length > 0, 
    });

    sleep(Math.random() * 0.1 + 0.1); 
}