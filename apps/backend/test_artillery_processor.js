import {
  generateEmail,
  generateName,
  generatePhone,
  logRequest,
  logResponse,
  trackMetrics
} from './artillery-processor.js';

/**
 * Test Suite for Artillery Processor Functions
 */

const testResults = [];

// Mock Artillery context and utilities
function createMockContext() {
  return {
    vars: {}
  };
}

function createMockEE() {
  const events = [];
  return {
    emit: (eventName, data) => {
      events.push({ eventName, data });
    },
    getEvents: () => events
  };
}

// Test 1: Generate Email
console.log('\n--- Test 1: Generate Email ---');
try {
  const context = createMockContext();
  const ee = createMockEE();
  const requestParams = {};
  
  generateEmail(requestParams, context, ee, () => {
    const email = context.vars.email;
    if (email && email.includes('loadtest-') && email.includes('@example.com')) {
      console.log('✓ PASSED: Email generated correctly');
      console.log(`  Email: ${email}`);
      testResults.push({ test: 'generateEmail', status: 'PASSED' });
    } else {
      console.error('✗ FAILED: Email format incorrect');
      testResults.push({ test: 'generateEmail', status: 'FAILED' });
    }
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'generateEmail', status: 'FAILED' });
}

// Test 2: Generate Name
console.log('\n--- Test 2: Generate Name ---');
try {
  const context = createMockContext();
  const ee = createMockEE();
  const requestParams = {};
  
  generateName(requestParams, context, ee, () => {
    const name = context.vars.full_name;
    if (name && name.split(' ').length === 2) {
      console.log('✓ PASSED: Name generated correctly');
      console.log(`  Name: ${name}`);
      testResults.push({ test: 'generateName', status: 'PASSED' });
    } else {
      console.error('✗ FAILED: Name format incorrect');
      testResults.push({ test: 'generateName', status: 'FAILED' });
    }
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'generateName', status: 'FAILED' });
}

// Test 3: Generate Phone
console.log('\n--- Test 3: Generate Phone ---');
try {
  const context = createMockContext();
  const ee = createMockEE();
  const requestParams = {};
  
  generatePhone(requestParams, context, ee, () => {
    const phone = context.vars.phone;
    if (phone && phone.startsWith('071') && phone.length === 9) {
      console.log('✓ PASSED: Phone generated correctly');
      console.log(`  Phone: ${phone}`);
      testResults.push({ test: 'generatePhone', status: 'PASSED' });
    } else {
      console.error('✗ FAILED: Phone format incorrect');
      console.error(`  Expected 071XXXXXX, got: ${phone}`);
      testResults.push({ test: 'generatePhone', status: 'FAILED' });
    }
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'generatePhone', status: 'FAILED' });
}

// Test 4: Log Request
console.log('\n--- Test 4: Log Request ---');
try {
  const context = createMockContext();
  context.vars.email = 'test@example.com';
  const ee = createMockEE();
  const requestParams = { url: '/api/test' };
  
  logRequest(requestParams, context, ee, () => {
    console.log('✓ PASSED: Log request executed without errors');
    testResults.push({ test: 'logRequest', status: 'PASSED' });
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'logRequest', status: 'FAILED' });
}

// Test 5: Log Response - Success
console.log('\n--- Test 5: Log Response (Success) ---');
try {
  const context = createMockContext();
  const ee = createMockEE();
  const requestParams = { url: '/api/test' };
  const response = { statusCode: 200, body: 'OK' };
  
  logResponse(requestParams, response, context, ee, () => {
    console.log('✓ PASSED: Log response (200) executed without errors');
    testResults.push({ test: 'logResponse-200', status: 'PASSED' });
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'logResponse-200', status: 'FAILED' });
}

// Test 6: Log Response - Error
console.log('\n--- Test 6: Log Response (Error) ---');
try {
  const context = createMockContext();
  const ee = createMockEE();
  const requestParams = { url: '/api/test' };
  const response = { statusCode: 404, body: 'Not Found' };
  
  logResponse(requestParams, response, context, ee, () => {
    console.log('✓ PASSED: Log response (404) executed without errors');
    testResults.push({ test: 'logResponse-404', status: 'PASSED' });
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'logResponse-404', status: 'FAILED' });
}

// Test 7: Track Metrics
console.log('\n--- Test 7: Track Metrics ---');
try {
  const context = createMockContext();
  const ee = createMockEE();
  const requestParams = { url: '/api/test' };
  const response = { statusCode: 200, responseTime: 25 };
  
  trackMetrics(requestParams, response, context, ee, () => {
    const events = ee.getEvents();
    if (events.length > 0 && events[0].eventName === 'customStat') {
      console.log('✓ PASSED: Metrics tracked correctly');
      console.log(`  Event: ${events[0].eventName}`);
      console.log(`  Stat: ${events[0].data.stat}`);
      testResults.push({ test: 'trackMetrics', status: 'PASSED' });
    } else {
      console.error('✗ FAILED: Metrics not tracked');
      testResults.push({ test: 'trackMetrics', status: 'FAILED' });
    }
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'trackMetrics', status: 'FAILED' });
}

// Test 8: Track Metrics - Error Case
console.log('\n--- Test 8: Track Metrics (Error Response) ---');
try {
  const context = createMockContext();
  const ee = createMockEE();
  const requestParams = { url: '/api/test' };
  const response = { statusCode: 500, responseTime: 100 };
  
  trackMetrics(requestParams, response, context, ee, () => {
    const events = ee.getEvents();
    if (events.length >= 2 && events[1].data.stat === 'error_count') {
      console.log('✓ PASSED: Error metrics tracked correctly');
      console.log(`  Error Count Event: ${events[1].data.stat}`);
      testResults.push({ test: 'trackMetrics-error', status: 'PASSED' });
    } else {
      console.error('✗ FAILED: Error metrics not tracked');
      testResults.push({ test: 'trackMetrics-error', status: 'FAILED' });
    }
  });
} catch (error) {
  console.error('✗ FAILED:', error.message);
  testResults.push({ test: 'trackMetrics-error', status: 'FAILED' });
}

// Summary Report
console.log('\n========== TEST SUMMARY ==========');
const passed = testResults.filter(r => r.status === 'PASSED').length;
const failed = testResults.filter(r => r.status === 'FAILED').length;
const total = testResults.length;

console.log(`\nTotal Tests: ${total}`);
console.log(`✓ Passed: ${passed}`);
console.log(`✗ Failed: ${failed}`);
console.log(`Pass Rate: ${((passed / total) * 100).toFixed(2)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED!');
} else {
  console.log('\n⚠️  Some tests failed. Check output above.');
}
console.log('===================================\n');
