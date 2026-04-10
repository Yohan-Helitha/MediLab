/**
 * API Performance Tests
 * Tests for API performance under various loads using Artillery
 * Measures response times, throughput, and latency
 *
 * To run: artillery run api.performance.test.yaml
 * Or use Artillery programmatically as shown in integration test scenarios
 * @author Lakni (IT23772922)
 */

import axios from 'axios';

describe('API Performance Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
  const NUM_REQUESTS = 100;
  const NUM_CONCURRENT = 10;

  /**
   * Helper function to measure response time
   */
  const measureResponse = async (fn) => {
    const startTime = Date.now();
    const response = await fn();
    const endTime = Date.now();
    return {
      response,
      duration: endTime - startTime
    };
  };

  /**
   * Helper function to run concurrent requests
   */
  const runConcurrentRequests = async (request, count) => {
    const requests = Array(count).fill(null).map(() => request());
    const results = await Promise.allSettled(requests);
    const times = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.duration || 0);

    const avgTime = times.length
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : Infinity;

    const minTime = times.length ? Math.min(...times) : Infinity;
    const maxTime = times.length ? Math.max(...times) : 0;

    return {
      total: results.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      avgTime,
      minTime,
      maxTime
    };
  };

  describe('Auth API Performance', () => {
    it('should handle multiple registration requests with acceptable latency', async () => {
      const registrationRequests = () =>
        measureResponse(() =>
          axios.post(`${API_BASE_URL}/auth/patient/register`, {
            full_name: `Test User ${uniqueId()}`,
            email: `test.${uniqueId()}@example.com`,
            contact_number: uniqueContactNumber(),
            password: 'TestPassword123!'
          })
        );

      const results = await runConcurrentRequests(
        registrationRequests,
        NUM_CONCURRENT
      );

      console.log(`\n🔐 Patient Registration Performance:`);
      console.log(`   Concurrent Requests: ${results.total}`);
      console.log(`   Successful: ${results.successful}`);
      console.log(`   Failed: ${results.failed}`);
      console.log(`   Average Response Time: ${results.avgTime}ms`);
      console.log(`   Min Response Time: ${results.minTime}ms`);
      console.log(`   Max Response Time: ${results.maxTime}ms`);

      // Performance threshold: configurable per environment
      expect(results.avgTime).toBeLessThan(PERF_REGISTRATION_AVG_MS);
      expect(results.successful).toBeGreaterThan(results.total * 0.8); // At least 80% success rate
    }, 30000);

    it('should handle multiple login requests efficiently', async () => {
      // Create a test account first
      const testEmail = `perf-test${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      try {
        await axios.post(`${API_BASE_URL}/auth/patient/register`, {
          full_name: 'Performance Test User',
          email: testEmail,
          contact_number: uniqueContactNumber(),
          password: testPassword
        });
      } catch (error) {
        console.log('Setup error:', error.message);
      }

      const loginRequests = () =>
        measureResponse(() =>
          axios.post(`${API_BASE_URL}/auth/patient/login`, {
            identifier: testEmail,
            password: testPassword
          })
        );

      const results = await runConcurrentRequests(loginRequests, NUM_CONCURRENT);

      console.log(`\n🔐 Login Performance:`);
      console.log(`   Concurrent Requests: ${results.total}`);
      console.log(`   Average Response Time: ${results.avgTime}ms`);
      console.log(`   Min Response Time: ${results.minTime}ms`);
      console.log(`   Max Response Time: ${results.maxTime}ms`);

      // Login should be fast, typically < 500ms per request
      expect(results.avgTime).toBeLessThan(3500);
    }, 30000);

    it('should handle token verification efficiently', async () => {
      // Create a test account and get token
      let token = null;
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/patient/register`, {
          full_name: `Token Test ${Date.now()}`,
          email: `token${Date.now()}@example.com`,
          contact_number: uniqueContactNumber(),
          password: 'TestPassword123!'
        });
        token = response.data.data.token;
      } catch (error) {
        console.log('Setup error:', error.message);
        return;
      }

      const verifyRequests = () =>
        measureResponse(() =>
          axios.post(`${API_BASE_URL}/auth/verify`, { token })
        );

      const results = await runConcurrentRequests(verifyRequests, NUM_CONCURRENT);

      console.log(`\n✅ Token Verification Performance:`);
      console.log(`   Concurrent Requests: ${results.total}`);
      console.log(`   Average Response Time: ${results.avgTime}ms`);
      console.log(`   Min Response Time: ${results.minTime}ms`);
      console.log(`   Max Response Time: ${results.maxTime}ms`);

      expect(results.avgTime).toBeLessThan(1000);
    }, 30000);
  });

  describe('Patient API Performance', () => {
    it('should retrieve members list with acceptable response time', async () => {
      const getMembers = () =>
        measureResponse(() =>
          axios.get(`${API_BASE_URL}/members?page=1&limit=10`, {
            headers: authHeaders(),
          })
        );

      const results = await runConcurrentRequests(
        getMembers,
        NUM_CONCURRENT
      );

      console.log(`\n👥 Get Members Performance:`);
      console.log(`   Concurrent Requests: ${results.total}`);
      console.log(`   Average Response Time: ${results.avgTime}ms`);
      console.log(`   Min Response Time: ${results.minTime}ms`);
      console.log(`   Max Response Time: ${results.maxTime}ms`);

      // Reading should be fast, < 500ms typically
      expect(results.avgTime).toBeLessThan(1000);
    }, 30000);

    it('should handle sequential member creation requests', async () => {
      const createdMembers = [];
      const times = [];

      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        try {
          const response = await axios.post(
            `${API_BASE_URL}/members`,
            {
              household_id: 'ANU-PADGNDIV-00001',
              full_name: `Performance Member ${i}`,
              address: '123 Test Street',
              contact_number: uniqueContactNumber(),
              password_hash: 'TestPassword@123',
              date_of_birth: '1990-01-01',
              gender: 'male',
              gn_division: 'Test GN Division',
              district: 'Test District',
            },
            { headers: authHeaders() },
          );
          createdMembers.push(response.data.data._id);
        } catch (error) {
          console.log(`Error creating member ${i}:`, error.message);
        }
        times.push(Date.now() - startTime);
      }

      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

      console.log(`\n📝 Create Members Performance:`);
      console.log(`   Total Created: ${createdMembers.length}`);
      console.log(`   Average Response Time: ${avgTime}ms`);
      console.log(`   Min Response Time: ${Math.min(...times)}ms`);
      console.log(`   Max Response Time: ${Math.max(...times)}ms`);

      expect(avgTime).toBeLessThan(2000);
      expect(createdMembers.length).toBeGreaterThanOrEqual(8);
    }, 60000);

    it('should handle concurrent member retrieval efficiently', async () => {
      const getMember = (memberId) =>
        measureResponse(() =>
          axios.get(`${API_BASE_URL}/members/${memberId}`, {
            headers: authHeaders(),
          })
        );

      // First, create a test member
      let testMemberId = null;
      try {
        const response = await axios.post(
          `${API_BASE_URL}/members`,
          {
            household_id: 'ANU-PADGNDIV-00001',
            full_name: 'Perf Test Member',
            address: '123 Test Street',
            contact_number: uniqueContactNumber(),
            password_hash: 'TestPassword@123',
            date_of_birth: '1990-01-01',
            gender: 'male',
            gn_division: 'Test GN Division',
            district: 'Test District',
          },
          { headers: authHeaders() },
        );
        testMemberId = response.data.data._id;
      } catch (error) {
        console.log('Setup error:', error.message);
        return;
      }

      const requests = () => getMember(testMemberId);
      const results = await runConcurrentRequests(requests, NUM_CONCURRENT);

      console.log(`\n👤 Get Single Member Performance:`);
      console.log(`   Concurrent Requests: ${results.total}`);
      console.log(`   Average Response Time: ${results.avgTime}ms`);
      console.log(`   Min Response Time: ${results.minTime}ms`);
      console.log(`   Max Response Time: ${results.maxTime}ms`);

      expect(results.avgTime).toBeLessThan(800);
    }, 30000);
  });

  describe('Load Testing - Stress Scenarios', () => {
    it('should handle sustained load without degradation', async () => {
      const responseTimes = [];
      const startTime = Date.now();
      const duration = 10000; // 10 seconds

      let requestCount = 0;
      let errorCount = 0;

      while (Date.now() - startTime < duration) {
        const reqStart = Date.now();
        try {
          await axios.get(`${API_BASE_URL}/members?page=1&limit=5`, {
            timeout: 5000,
            headers: authHeaders(),
          });
          responseTimes.push(Date.now() - reqStart);
          requestCount++;
        } catch (error) {
          errorCount++;
        }
      }

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const throughput = (requestCount + errorCount) / (duration / 1000);

      console.log(`\n⚡ Sustained Load Test (10 seconds):`);
      console.log(`   Total Requests: ${requestCount + errorCount}`);
      console.log(`   Successful: ${requestCount}`);
      console.log(`   Failed: ${errorCount}`);
      console.log(`   Throughput: ${throughput.toFixed(2)} requests/sec`);
      console.log(`   Average Response Time: ${avgTime.toFixed(0)}ms`);

      expect(errorCount).toBeLessThan(requestCount * 0.1); // < 10% error rate
    }, 20000);

    it('should handle spike in traffic gracefully', async () => {
      console.log(`\n📊 Traffic Spike Test:`);
      const results = {
        phase1: null,
        phase2: null,
        phase3: null
      };

      // Phase 1: Normal load
      console.log('   Phase 1: Normal Load (5 concurrent)...');
      results.phase1 = await runConcurrentRequests(
        () =>
          measureResponse(() =>
            axios.get(`${API_BASE_URL}/members?page=1`, {
              headers: authHeaders(),
            })
          ),
        5
      );
      console.log(`     Avg Time: ${results.phase1.avgTime}ms`);

      // Phase 2: Increased load
      console.log('   Phase 2: Increased Load (20 concurrent)...');
      results.phase2 = await runConcurrentRequests(
        () =>
          measureResponse(() =>
            axios.get(`${API_BASE_URL}/members?page=1`, {
              headers: authHeaders(),
            })
          ),
        20
      );
      console.log(`     Avg Time: ${results.phase2.avgTime}ms`);

      // Phase 3: Peak load
      console.log('   Phase 3: Peak Load (50 concurrent)...');
      results.phase3 = await runConcurrentRequests(
        () =>
          measureResponse(() =>
            axios.get(`${API_BASE_URL}/members?page=1`, {
              headers: authHeaders(),
            })
          ),
        50
      );
      console.log(`     Avg Time: ${results.phase3.avgTime}ms`);

      // Response time degradation should be acceptable
      const degradation = ((results.phase3.avgTime - results.phase1.avgTime) / results.phase1.avgTime) * 100;
      console.log(`   Response Time Degradation: ${degradation.toFixed(1)}%`);

      // Allow configurable degradation under peak load
      expect(degradation).toBeLessThan(PERF_SPIKE_MAX_DEGRADATION_PCT);
      expect(results.phase3.successful).toBeGreaterThan(results.phase3.total * 0.7); // At least 70% success
    }, 60000);
  });

  describe('Error Rate Tests', () => {
    it('should handle invalid requests without crashing', async () => {
      const invalidRequests = [
        { url: `${API_BASE_URL}/members/invalid-id`, headers: authHeaders() },
        { url: `${API_BASE_URL}/members`, method: 'post', data: {}, headers: authHeaders() }, // Missing required fields
        { url: `${API_BASE_URL}/auth/verify`, method: 'post', data: { token: 'invalid' } }
      ];

      let errorCount = 0;
      let totalRequests = 0;

      for (const req of invalidRequests) {
        try {
          totalRequests++;
          if (req.method === 'post') {
            await axios.post(req.url, req.data, { headers: req.headers });
          } else {
            await axios.get(req.url, { headers: req.headers });
          }
        } catch (error) {
          errorCount++;
        }
      }

      console.log(`\n⚠️  Error Handling Test:`);
      console.log(`   Total Requests: ${totalRequests}`);
      console.log(`   Expected Errors: ${errorCount}`);

      // All invalid requests should error
      expect(errorCount).toBe(totalRequests);
    });
  });
});
