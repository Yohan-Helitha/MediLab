/**
 * Artillery Processor for Dynamic Data Generation
 * @author Lakni (IT23772922)
 * 
 * Generates unique test data for load testing scenarios
 */

// Generate random email
export function generateEmail(requestParams, context, ee, next) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  context.vars.email = `loadtest-${timestamp}-${random}@example.com`;
  return next();
}

// Generate random full name
export function generateName(requestParams, context, ee, next) {
  const firstNames = ['John', 'Jane', 'Robert', 'Mary', 'Michael', 'Patricia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  context.vars.full_name = `${firstName} ${lastName}`;
  return next();
}

// Generate random phone number
export function generatePhone(requestParams, context, ee, next) {
  const prefix = '071';
  const remaining = Math.random().toString().substring(2, 8);
  context.vars.phone = `${prefix}${remaining}`;
  return next();
}

// Log request details
export function logRequest(requestParams, context, ee, next) {
  console.log(`Request to ${requestParams.url} with email: ${context.vars.email}`);
  return next();
}

// Capture and log response metrics
export function logResponse(requestParams, response, context, ee, next) {
  const statusCode = response.statusCode;
  const headers = response.headers;
  const body = response.body;

  if (statusCode < 300) {
    console.log(`✓ ${requestParams.url} - ${statusCode}ms`);
  } else if (statusCode < 400) {
    console.log(`→ ${requestParams.url} - ${statusCode}`);
  } else {
    console.error(`✗ ${requestParams.url} - ${statusCode}`);
  }

  return next();
}

// Track performance metrics
export function trackMetrics(requestParams, response, context, ee, next) {
  const responseTime = response.responseTime || 0;
  const statusCode = response.statusCode;

  // Emit custom metrics to Artillery
  ee.emit('customStat', {
    stat: 'response_time_ms',
    value: responseTime,
    tags: [`endpoint:${requestParams.url}`]
  });

  if (statusCode >= 400) {
    ee.emit('customStat', {
      stat: 'error_count',
      value: 1,
      tags: [`endpoint:${requestParams.url}`, `status:${statusCode}`]
    });
  }

  return next();
}
