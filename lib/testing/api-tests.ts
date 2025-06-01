// API endpoint testing utilities for ShopAbell

export interface TestResult {
  endpoint: string
  method: string
  status: 'pass' | 'fail' | 'skip'
  responseTime: number
  statusCode?: number
  error?: string
  data?: any
}

export interface TestSuite {
  name: string
  tests: TestCase[]
}

export interface TestCase {
  name: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  expectedStatus?: number
  expectedKeys?: string[]
  timeout?: number
}

export class APITester {
  private baseUrl: string
  private results: TestResult[] = []

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async runTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now()
    const result: TestResult = {
      endpoint: testCase.endpoint,
      method: testCase.method,
      status: 'fail',
      responseTime: 0
    }

    try {
      const response = await fetch(`${this.baseUrl}${testCase.endpoint}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          ...testCase.headers
        },
        body: testCase.body ? JSON.stringify(testCase.body) : undefined,
        signal: AbortSignal.timeout(testCase.timeout || 5000)
      })

      result.responseTime = Date.now() - startTime
      result.statusCode = response.status

      if (testCase.expectedStatus && response.status !== testCase.expectedStatus) {
        result.error = `Expected status ${testCase.expectedStatus}, got ${response.status}`
        return result
      }

      if (response.headers.get('content-type')?.includes('application/json')) {
        result.data = await response.json()
        
        if (testCase.expectedKeys) {
          const missingKeys = testCase.expectedKeys.filter(key => !(key in result.data))
          if (missingKeys.length > 0) {
            result.error = `Missing expected keys: ${missingKeys.join(', ')}`
            return result
          }
        }
      }

      result.status = 'pass'
    } catch (error) {
      result.responseTime = Date.now() - startTime
      result.error = error instanceof Error ? error.message : 'Unknown error'
    }

    this.results.push(result)
    return result
  }

  async runSuite(suite: TestSuite): Promise<TestResult[]> {
    console.log(`\n🧪 Running test suite: ${suite.name}`)
    const suiteResults: TestResult[] = []

    for (const testCase of suite.tests) {
      console.log(`  → Testing ${testCase.method} ${testCase.endpoint}`)
      const result = await this.runTest(testCase)
      suiteResults.push(result)
      
      const status = result.status === 'pass' ? '✅' : '❌'
      console.log(`    ${status} ${result.responseTime}ms ${result.error || ''}`)
    }

    return suiteResults
  }

  getResults(): TestResult[] {
    return this.results
  }

  getSummary(): { total: number; passed: number; failed: number; skipped: number } {
    const total = this.results.length
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const skipped = this.results.filter(r => r.status === 'skip').length

    return { total, passed, failed, skipped }
  }

  printSummary(): void {
    const summary = this.getSummary()
    console.log('\n📊 Test Summary:')
    console.log(`   Total: ${summary.total}`)
    console.log(`   ✅ Passed: ${summary.passed}`)
    console.log(`   ❌ Failed: ${summary.failed}`)
    console.log(`   ⏭️  Skipped: ${summary.skipped}`)
    console.log(`   Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`)
  }
}

// Test suites for different API groups
export const authTestSuite: TestSuite = {
  name: 'Authentication API',
  tests: [
    {
      name: 'WhatsApp onboarding start',
      endpoint: '/api/whatsapp/onboarding',
      method: 'POST',
      body: { phoneNumber: '+919876543210' },
      expectedStatus: 200,
      expectedKeys: ['success', 'sessionId']
    },
    {
      name: 'Demo seed users',
      endpoint: '/api/demo/seed-users',
      method: 'POST',
      expectedStatus: 200,
      expectedKeys: ['success', 'message']
    }
  ]
}

export const productsTestSuite: TestSuite = {
  name: 'Products API',
  tests: [
    {
      name: 'Get products list',
      endpoint: '/api/products',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Create product',
      endpoint: '/api/products',
      method: 'POST',
      body: {
        name: 'Test Product',
        description: 'Test Description',
        price: 999,
        category: 'fashion'
      },
      expectedStatus: 201
    }
  ]
}

export const ordersTestSuite: TestSuite = {
  name: 'Orders API',
  tests: [
    {
      name: 'Get orders list',
      endpoint: '/api/orders',
      method: 'GET',
      expectedStatus: 200
    }
  ]
}

export const analyticsTestSuite: TestSuite = {
  name: 'Analytics API',
  tests: [
    {
      name: 'Get analytics overview',
      endpoint: '/api/analytics/overview',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Get sales metrics',
      endpoint: '/api/analytics/sales',
      method: 'GET',
      expectedStatus: 200
    }
  ]
}

export const webhooksTestSuite: TestSuite = {
  name: 'Webhooks API',
  tests: [
    {
      name: 'WhatsApp webhook verification',
      endpoint: '/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test&hub.challenge=test123',
      method: 'GET',
      expectedStatus: 200
    }
  ]
}

// Run all test suites
export async function runAllTests(baseUrl: string = ''): Promise<void> {
  const tester = new APITester(baseUrl)
  
  const suites = [
    authTestSuite,
    productsTestSuite,
    ordersTestSuite,
    analyticsTestSuite,
    webhooksTestSuite
  ]

  console.log('🚀 Starting API tests...')
  
  for (const suite of suites) {
    await tester.runSuite(suite)
  }

  tester.printSummary()
  
  const summary = tester.getSummary()
  if (summary.failed > 0) {
    console.log('\n❌ Some tests failed. Check the details above.')
    process.exit(1)
  } else {
    console.log('\n✅ All tests passed!')
  }
}