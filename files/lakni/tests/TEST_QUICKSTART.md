**Author:** Lakni (IT23772922)  

# Quick Start Guide - Running Tests

This guide provides quick commands to run the test suites for MediLab.

## Prerequisites

### Backend

```bash
cd apps/backend
npm install
```

### Frontend

```bash
cd apps/web
npm install
```

---

## Backend Testing

### All Tests

```bash
cd apps/backend
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

Runs:

- `auth.service.unit.test.js` - Auth service logic tests
- `auth.controller.unit.test.js` - Auth controller tests
- `member.service.unit.test.js` - Member service logic tests
- `member.controller.unit.test.js` - Member controller tests

### Integration Tests Only

```bash
npm run test:integration
```

Runs:

- `auth.integration.test.js` - Complete auth API flow tests
- `patient.integration.test.js` - Complete patient API flow tests

### Performance Tests Only

```bash
npm run test:performance
```

Runs:

- `api.performance.test.js` - Load and stress testing

### Specific Module Tests

```bash
# Auth module tests
npm run test:auth

# Patient module tests
npm run test:patient
```

### Test Coverage

```bash
npm run test:coverage
```

Generates coverage report showing:

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### Watch Mode (Re-run on file changes)

```bash
npm run test:watch
```

### Verbose Output

```bash
npm test -- --verbose
```

---

## Frontend Testing

### Install Testing Dependencies First

```bash
cd apps/web
npm install
```

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Test Coverage

```bash
npm run test:coverage
```

### Specific Component Tests

```bash
# Auth pages tests
npm run test:auth

# Patient pages tests
npm run test:patient
```

### UI Dashboard

```bash
npm run test:ui
```

Opens interactive test dashboard at `http://localhost:51204/__vitest__/`

---

## Performance Testing with Artillery

### Install Artillery

```bash
npm install -g artillery
```

### Run Load Test

```bash
cd apps/backend
artillery run src/modules/__tests__/api.performance.config.yaml
```

### Run with Custom Settings

```bash
# Override target
artillery run -t http://localhost:3000 src/modules/__tests__/api.performance.config.yaml

# Override arrival rate (requests per second)
artillery run -r 10 src/modules/__tests__/api.performance.config.yaml

# Override duration (in seconds)
artillery run -d 120 src/modules/__tests__/api.performance.config.yaml
```

### Generate HTML Report

```bash
artillery run src/modules/__tests__/api.performance.config.yaml -o report.json
artillery report report.json
```

---

## Running Full Test Suite

### Backend - All Tests with Coverage

```bash
cd apps/backend
npm run test:all
```

### Frontend - All Tests with Coverage

```bash
cd apps/web
npm run test:coverage
```

### Both Frontend and Backend

```bash
# Terminal 1 - Backend
cd apps/backend
npm run test:coverage

# Terminal 2 - Frontend
cd apps/web
npm run test:coverage
```

---

## Test Output Examples

### Success Output

```
 PASS  src/modules/auth/__tests__/auth.controller.unit.test.js
  AuthController - Unit Tests
    registerPatient
      ✓ should return 201 and success message on successful registration (45ms)
      ✓ should return 400 on registration error (12ms)
    loginPatient
      ✓ should return 200 and user data on successful login (8ms)
      ✓ should return 401 on login failure (6ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

### Coverage Output

```
------------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------|---------|----------|---------|---------|-------------------
All files  |   88.5  |   85.2   |   90.1  |   88.5  |
 service   |   92.1  |   88.3   |   94.5  |   92.1  | 45,67,89
 controller|   85.2  |   82.1   |   86.7  |   85.2  | 23,56
------------|---------|----------|---------|---------|-------------------
```

---

## Debugging Tests

### Run Single Test File

```bash
npm test -- auth.service.unit.test.js
```

### Run Specific Test

```bash
npm test -- --testNamePattern="hashPassword"
```

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome DevTools.

### Verbose Output

```bash
npm test -- --verbose
```

### Show Which Tests Took Longest

```bash
npm test -- --detectOpenHandles
```

---

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error

```bash
# Make sure MongoDB is running
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Jest Transform Error

```bash
# Ensure jest.config.cjs is properly configured
# Or clear Jest cache
npm test -- --clearCache
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Backend Tests
        run: |
          cd apps/backend
          npm ci
          npm run test:coverage

      - name: Frontend Tests
        run: |
          cd apps/web
          npm ci
          npm run test:coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

---

## Next Steps

1. **Review test results** - Check coverage and fix low-coverage areas
2. **Set up pre-commit hooks** - Run tests before committing
3. **Monitor performance** - Track metrics over time
4. **Update tests** - Keep tests in sync with code changes
5. **Add more tests** - Increase coverage for critical paths

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Artillery Docs](https://artillery.io/docs)
- [TESTING.md](./TESTING.md) - Comprehensive testing guide

---

For detailed information on test organization and best practices, see [TESTING.md](./TESTING.md)
