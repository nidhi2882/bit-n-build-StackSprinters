import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration for ResQGrid Multi-Source Ingestion Pipeline
// Target: 500 req/sec sustained load with < 2000ms latency p95
export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Warm-up ramp
    { duration: '1m', target: 500 },  // Peak load: 500 req/sec
    { duration: '30s', target: 500 },  // Sustained stress
    { duration: '20s', target: 0 },    // Cool-down ramp
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must finish within 2 seconds
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080/api';

export default function () {
  // Scenario 1: Citizen SOS One-Tap Ingestion
  const sosPayload = JSON.stringify({
    latitude: 22.3072 + (Math.random() - 0.5) * 0.05,
    longitude: 73.1812 + (Math.random() - 0.5) * 0.05,
    reporterPhone: "+919876543210",
    emergencyType: "FLOOD_TRAPPED_CIVILIANS"
  });

  const headers = { 'Content-Type': 'application/json' };

  const sosRes = http.post(`${BASE_URL}/reports/sos`, sosPayload, { headers });
  check(sosRes, {
    'SOS status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'SOS returns trackingNumber': (r) => r.body && r.body.includes('trackingNumber'),
  });

  // Scenario 2: Public Report Ingestion
  const reportPayload = JSON.stringify({
    title: "Rising Flood Water in Ward 4",
    type: "Flood",
    category: "FLOOD",
    description: "Inundation level crossed 3 feet near riverbank. Immediate boat assistance requested.",
    severity: 4,
    locationName: "Vishwamitri Embankment Ward 4",
    lat: 22.3040,
    lng: 73.1905,
    reporterName: "Load Test Citizen",
    reporterPhone: "+919988776655"
  });

  const reportRes = http.post(`${BASE_URL}/reports`, reportPayload, { headers });
  check(reportRes, {
    'Report status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(0.1);
}
