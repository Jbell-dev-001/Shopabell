#!/usr/bin/env tsx
// Test runner script for ShopAbell

import { runAllTests } from '../lib/testing/api-tests'
import { runAllComponentTests } from '../lib/testing/component-tests'
import { globalPerformanceOptimizer } from '../lib/performance/optimization'

interface TestConfig {
  apiTests: boolean
  componentTests: boolean
  performanceTests: boolean
  baseUrl?: string
  verbose?: boolean
}

class TestRunner {
  private config: TestConfig

  constructor(config: TestConfig) {
    this.config = config
  }

  async run(): Promise<void> {
    console.log('🚀 ShopAbell Test Runner Starting...\n')

    const startTime = Date.now()
    let allPassed = true

    try {
      // API Tests
      if (this.config.apiTests) {
        console.log('📡 Running API Tests...')
        try {
          await runAllTests(this.config.baseUrl)
          console.log('✅ API Tests Completed\n')
        } catch (error) {
          console.log('❌ API Tests Failed\n')
          allPassed = false
          if (this.config.verbose) {
            console.error(error)
          }
        }
      }

      // Component Tests
      if (this.config.componentTests) {
        console.log('🧪 Running Component Tests...')
        try {
          await runAllComponentTests()
          console.log('✅ Component Tests Completed\n')
        } catch (error) {
          console.log('❌ Component Tests Failed\n')
          allPassed = false
          if (this.config.verbose) {
            console.error(error)
          }
        }
      }

      // Performance Tests
      if (this.config.performanceTests) {
        console.log('⚡ Running Performance Analysis...')
        try {
          await this.runPerformanceTests()
          console.log('✅ Performance Analysis Completed\n')
        } catch (error) {
          console.log('❌ Performance Analysis Failed\n')
          allPassed = false
          if (this.config.verbose) {
            console.error(error)
          }
        }
      }

      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000

      console.log('📊 Test Summary:')
      console.log(`   Duration: ${duration.toFixed(2)}s`)
      console.log(`   Status: ${allPassed ? '✅ All Passed' : '❌ Some Failed'}`)

      if (!allPassed) {
        process.exit(1)
      }

    } catch (error) {
      console.error('💥 Test runner crashed:', error)
      process.exit(1)
    }
  }

  private async runPerformanceTests(): Promise<void> {
    const report = globalPerformanceOptimizer.generateReport()
    
    console.log('\n🔍 Performance Analysis Results:')
    console.log(`   Total Issues: ${report.summary.totalIssues}`)
    console.log(`   Critical Issues: ${report.summary.criticalIssues}`)
    
    if (report.summary.criticalIssues > 0) {
      console.log('\n🚨 Critical Performance Issues:')
      report.summary.suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`)
      })
    }

    console.log('\n💡 Optimization Recommendations:')
    report.recommendations.slice(0, 10).forEach(rec => {
      console.log(`   • ${rec}`)
    })

    if (report.recommendations.length > 10) {
      console.log(`   ... and ${report.recommendations.length - 10} more recommendations`)
    }

    // Save detailed report
    if (this.config.verbose) {
      const fs = await import('fs')
      const reportPath = './performance-report.json'
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(`\n📄 Detailed report saved to: ${reportPath}`)
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  
  const config: TestConfig = {
    apiTests: true,
    componentTests: true,
    performanceTests: true,
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    verbose: args.includes('--verbose') || args.includes('-v')
  }

  // Parse command line arguments
  if (args.includes('--api-only')) {
    config.componentTests = false
    config.performanceTests = false
  }
  
  if (args.includes('--components-only')) {
    config.apiTests = false
    config.performanceTests = false
  }
  
  if (args.includes('--performance-only')) {
    config.apiTests = false
    config.componentTests = false
  }

  if (args.includes('--no-api')) {
    config.apiTests = false
  }
  
  if (args.includes('--no-components')) {
    config.componentTests = false
  }
  
  if (args.includes('--no-performance')) {
    config.performanceTests = false
  }

  // Override base URL if provided
  const baseUrlArg = args.find(arg => arg.startsWith('--base-url='))
  if (baseUrlArg) {
    config.baseUrl = baseUrlArg.split('=')[1]
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 ShopAbell Test Runner

Usage: npm run test [options]

Options:
  --api-only          Run only API tests
  --components-only   Run only component tests
  --performance-only  Run only performance analysis
  --no-api           Skip API tests
  --no-components    Skip component tests
  --no-performance   Skip performance analysis
  --base-url=URL     Set base URL for API tests (default: http://localhost:3000)
  --verbose, -v      Enable verbose output
  --help, -h         Show this help message

Examples:
  npm run test                    # Run all tests
  npm run test -- --api-only     # Run only API tests
  npm run test -- --verbose      # Run with detailed output
  npm run test -- --base-url=https://api.shopabell.com
`)
    return
  }

  const runner = new TestRunner(config)
  await runner.run()
}

// Health check function
export async function healthCheck(baseUrl: string = 'http://localhost:3000'): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/ping`)
    return response.ok
  } catch {
    return false
  }
}

// Pre-deployment validation
export async function preDeploymentCheck(baseUrl: string): Promise<boolean> {
  console.log('🔍 Running pre-deployment validation...')
  
  const checks = [
    { name: 'Health Check', fn: () => healthCheck(baseUrl) },
    { name: 'API Tests', fn: () => runAllTests(baseUrl).then(() => true).catch(() => false) },
  ]

  let allPassed = true
  
  for (const check of checks) {
    console.log(`  → ${check.name}...`)
    try {
      const passed = await check.fn()
      if (passed) {
        console.log(`    ✅ ${check.name} passed`)
      } else {
        console.log(`    ❌ ${check.name} failed`)
        allPassed = false
      }
    } catch {
      console.log(`    ❌ ${check.name} failed with error`)
      allPassed = false
    }
  }

  console.log(`\n${allPassed ? '✅' : '❌'} Pre-deployment validation ${allPassed ? 'passed' : 'failed'}`)
  return allPassed
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}