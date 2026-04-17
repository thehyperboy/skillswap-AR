# SkillSwap AR - Testing Guide

## Overview

Phase 14 includes comprehensive test coverage with:
- **Unit Tests**: Validator and security function tests (vitest)
- **Integration Tests**: API route tests (vitest)
- **E2E Tests**: User flow tests (Playwright)

---

## Running Tests

### All Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on file changes)
npm test -- --watch
```

### Unit Tests Only
```bash
# All validators
npm test -- tests/validators.test.ts

# Security utilities
npm test -- tests/security.test.ts

# Specific test
npm test -- tests/validators.test.ts -t "signupSchema"
```

### E2E Tests Only
```bash
# All E2E tests
npm run test:e2e

# Specific suite
npm run test:e2e -- -g "Auth Flow"

# Specific test
npm run test:e2e -- -g "should display login page"

# With UI (visual mode)
npm run test:e2e -- --ui

# Debug mode
npm run test:e2e -- --debug

# Headed mode (watch test run)
npm run test:e2e -- --headed

# Generate HTML report
npm run test:e2e
# Open: playwright-report/index.html
```

---

## Test Structure

### Unit Tests: `tests/validators.test.ts`

Tests all input validation schemas:

```typescript
✓ signupSchema validates email/password/name
✓ loginSchema validates credentials
✓ profileSchema validates user profile
✓ skillSchema validates skill data
✓ collaborationRequestSchema validates requests
✓ reviewSchema validates review data
```

Run specific schema tests:
```bash
npm test -- tests/validators.test.ts -t "signupSchema"
```

### Security Tests: `tests/security.test.ts`

Tests security utilities:

```typescript
✓ CSRF Token generation and verification
✓ Token hashing (SHA-256)
✓ Password strength validation
✓ Input sanitization (XSS prevention)
✓ Email format validation
```

Run security tests:
```bash
npm test -- tests/security.test.ts -t "Password"
```

### E2E Tests: `tests/e2e/auth-flows.spec.ts`

Tests complete user flows in browser:

```typescript
describe("Auth Flow")
  ✓ Display login page
  ✓ Display signup page
  ✓ Validate signup errors
  ✓ Navigate between login/signup
  ✓ Reject weak passwords

describe("Protected Routes")
  ✓ Redirect unauthenticated to login
  ✓ Protect dashboard
  ✓ Protect onboarding
  ✓ Protect profile page

describe("Landing Page")
  ✓ Display hero section
  ✓ Display stats
  ✓ Display CTAs
  ✓ Navigate to pages

describe("Form Validation")
  ✓ Email validation
  ✓ Trim whitespace
  ✓ Password strength

describe("Responsive Design")
  ✓ Mobile (375x667)
  ✓ Tablet (768x1024)
  ✓ Desktop (1920x1080)
```

---

## Test Coverage Goals

### Current Coverage

| Module | Coverage | Status |
|--------|----------|--------|
| Validators | 95%+ | ✓ Complete |
| Security | 90%+ | ✓ Complete |
| Auth Routes | 85%+ | ✓ Partial |
| API Routes | 80%+ | 🟡 Planned |
| Components | 70%+ | ⏳ Future |

### Running Coverage Report

```bash
# Generate coverage
npm test -- --coverage

# View HTML report
# Open: coverage/index.html
```

---

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from "vitest";

describe("My Module", () => {
  it("should do something specific", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });

  it("should handle edge cases", () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

Adding to test suite:
```bash
# vitest auto-discovers tests ending in .test.ts or .spec.ts
# Create file: src/lib/mymodule.test.ts
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test.describe("My Feature", () => {
  test("should perform action", async ({ page }) => {
    await page.goto("/my-page");
    await page.click("button");
    await expect(page.getByText("Success")).toBeVisible();
  });
});
```

Adding to test suite:
```bash
# Create file: tests/e2e/my-feature.spec.ts
# Playwright auto-discovers *.spec.ts files in tests/e2e/
```

---

## Continuous Integration Setup

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: skillswap_ar_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - run: npm run test:e2e
```

---

## Common Test Scenarios

### Testing Protected Routes

```bash
# Test tries to access protected page
# Should redirect to login unless authenticated
npm run test:e2e -- -g "Protected Routes"
```

### Testing Form Validation

```bash
# Tests invalid email, weak password, etc.
npm run test:e2e -- -g "Form Validation"

# Or test validators directly
npm test -- tests/validators.test.ts
```

### Testing API Rate Limiting

```typescript
// tests/rate-limit.test.ts
import { signupLimiter } from "@/lib/rate-limit";

it("should rate limit after max requests", () => {
  for (let i = 0; i < 5; i++) {
    expect(signupLimiter.check({} as Request, "test-ip")).toBe(true);
  }
  // 6th request should fail
  expect(signupLimiter.check({} as Request, "test-ip")).toBe(false);
});
```

---

## Debugging Tests

### Debug Unit Tests
```bash
# Drop into debugger
npm test -- --inspect-brk

# Then: chrome://inspect in Chrome DevTools
```

### Debug E2E Tests
```bash
# Step-by-step execution
npm run test:e2e -- --debug

# Watch execution in browser
npm run test:e2e -- --headed

# Generate trace for debugging
npm run test:e2e -- --trace on
```

### View Test Report
```bash
# After E2E tests run
npx playwright show-report
```

---

## Best Practices

### Unit Tests
✓ Test one thing per test  
✓ Use descriptive names  
✓ Test happy path + edge cases  
✓ Keep tests independent  
✓ Mock external dependencies  

### E2E Tests
✓ Test user workflows, not implementation  
✓ Use accessible queries (getByRole, getByLabel)  
✓ Avoid hard waits, use explicit waits  
✓ Keep tests isolated  
✓ Clean up after tests  

### Performance
✓ Run tests frequently during development  
✓ Use --watch mode for rapid feedback  
✓ Parallelize tests in CI  
✓ Cache dependencies  

---

## Troubleshooting

### Tests fail locally but pass in CI
- Check Node.js version matches CI
- Check environment variables are set
- Database might be missing migrations

### E2E tests timeout
```bash
# Increase timeout
npm run test:e2e -- --timeout 30000

# Or update playwright.config.ts:
timeout: 30 * 1000
```

### Port 3000 already in use
```bash
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Database state issues
```bash
# Reset test database
npm run prisma:migrate reset -- --force

# Or manually delete and recreate:
dropdb skillswap_ar_test
createdb skillswap_ar_test
npm run prisma:migrate
```

---

## Next Steps After Tests

1. **Coverage Gaps**: Add tests for remaining API routes
2. **Integration Tests**: Add database integration tests
3. **Performance Tests**: Add load testing with k6 or artillery
4. **Visual Regression**: Add Percy or Chromatic
5. **Accessibility**: Add axe-core tests

---

## Resources

- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- Testing Library: https://testing-library.com/
- Jest: https://jestjs.io/ (alternative to Vitest)
