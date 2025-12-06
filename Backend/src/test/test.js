import http from 'k6/http';
import { check, sleep } from 'k6';

// ------------------------------
// CONFIGURATION
// ------------------------------
const RECEIVER_ID = '8';
const BASE_URL = 'https://full-stack-chat-application-sb2f.onrender.com/api/messages';


// ------------------------------
// TEST OPTIONS
// ------------------------------
export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};

// ------------------------------
// MAIN LOGIC PER VU
// ------------------------------
export default function () {
  const url = `${BASE_URL}/send/${RECEIVER_ID}`;

  const payload = JSON.stringify({
    text: `Load Test Message from VU ${__VU} at ${Date.now()}`,
    image: null,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_TOKEN}`, // ✅ send token via Authorization header
    },
  };

  const res = http.post(url, payload, params);

  if (res.status !== 201) {
    console.error(
      `❌ ERROR (VU ${__VU}): Status ${res.status}, Response: ${res.body}`
    );
  }

  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Body exists': (r) => r.body && r.body.length > 0,
  });

  sleep(Math.random() * 0.5 + 0.5);
}
