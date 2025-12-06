import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// 1. Configuration: Test Users/JWT Token/Receiver ID
// IMPORTANT: Receiver ID must be different from the Sender ID (encoded in AUTH_TOKEN)
const RECEIVER_ID = '2'; // Assuming user ID 2 exists and is different from Sender (ID 1)
const BASE_URL = 'https://full-stack-chat-application-sb2f.onrender.com/api/messages';

// IMPORTANT: Yahan par ek valid JWT token daalo jo User ID 1 ka hai.
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2NDQ0NjM0NywiZXhwIjoxNzY1MDUxMTQ3fQ.Q5G8Wln2um-as8LkN_EK-MgcVBWM2jEASagD9iG9Pek'; 

// Test Configuration
export const options = {
    // Stage 1: Debugging test (only 1 Virtual User for 10 seconds)
    stages: [
        { duration: '10s', target: 1 },    // Only 1 VU
    ],
    // Latency target abhi ignore karte hain, pehle functionality fix karni hai
    thresholds: {
        'http_req_duration': ['p(95) < 500'],
        'checks': ['rate>0.99'], 
    },
};

// Main function jo har Virtual User (VU) run karega
export default function () {
    // 1. URL Setup: POST /api/messages/send/2
    const url = `${BASE_URL}/send/${RECEIVER_ID}`;

    // 2. Headers Setup (Bearer token mandatory)
    const headers = {
        'Content-Type': 'application/json',
        // Authorization header, jo tumhare protectRoute middleware ke liye zaruri hai
        'Cookie': `jwt=${AUTH_TOKEN}`,
    };
    
    // 3. Payload Setup
    const payload = JSON.stringify({
        text: `Load Test Message from VU ${__VU} at time ${Date.now()}`,
        image: null 
    });

    // 4. POST request bhejte hain
    const res = http.post(url, payload, { headers: headers });

    // 🚨 Critical Debugging Step: Check if the request failed
    if (res.status !== 201) {
        // Agar status 201 nahi hai, toh Status Code aur Response Body log karo
        console.error(`❌ ERROR: VU ${__VU} - Status: ${res.status}, Response: ${res.body}`);
    }

    // 5. Check karte hain ki response status 201 (Created) hona chahiye
    check(res, {
        'is status 201': (r) => r.status === 201,
    });
    
    // 6. Wait time
    sleep(Math.random() * 0.5 + 0.5); 
}