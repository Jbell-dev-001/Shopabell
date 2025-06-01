// Component testing utilities for ShopAbell React components

import { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

export interface ComponentTestCase {
  name: string
  component: ReactElement
  expectedElements?: string[]
  interactions?: {
    action: 'click' | 'type' | 'submit'
    target: string
    value?: string
    expectedResult?: string
  }[]
  accessibility?: {
    checkAriaLabels: boolean
    checkKeyboardNavigation: boolean
  }
}

export interface ComponentTestResult {
  testName: string
  status: 'pass' | 'fail'
  error?: string
  renderTime: number
}

export class ComponentTester {
  private results: ComponentTestResult[] = []

  async runTest(testCase: ComponentTestCase): Promise<ComponentTestResult> {
    const startTime = Date.now()
    const result: ComponentTestResult = {
      testName: testCase.name,
      status: 'fail',
      renderTime: 0
    }

    try {
      // Render component
      const { container } = render(testCase.component)
      result.renderTime = Date.now() - startTime

      // Check expected elements
      if (testCase.expectedElements) {
        for (const element of testCase.expectedElements) {
          const found = screen.getByTestId(element) || 
                       screen.getByText(element) || 
                       screen.getByRole(element as any)
          if (!found) {
            throw new Error(`Expected element not found: ${element}`)
          }
        }
      }

      // Run interactions
      if (testCase.interactions) {
        for (const interaction of testCase.interactions) {
          const target = screen.getByTestId(interaction.target) ||
                        screen.getByText(interaction.target) ||
                        screen.getByRole(interaction.target as any)

          switch (interaction.action) {
            case 'click':
              fireEvent.click(target)
              break
            case 'type':
              if (interaction.value) {
                fireEvent.change(target, { target: { value: interaction.value } })
              }
              break
            case 'submit':
              fireEvent.submit(target)
              break
          }

          // Check expected result if specified
          if (interaction.expectedResult) {
            await waitFor(() => {
              expect(screen.getByText(interaction.expectedResult!)).toBeInTheDocument()
            })
          }
        }
      }

      // Accessibility checks
      if (testCase.accessibility?.checkAriaLabels) {
        const buttons = container.querySelectorAll('button')
        buttons.forEach(button => {
          if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
            throw new Error(`Button without aria-label or text content found`)
          }
        })
      }

      result.status = 'pass'
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error'
    }

    this.results.push(result)
    return result
  }

  async runSuite(testCases: ComponentTestCase[]): Promise<ComponentTestResult[]> {
    const suiteResults: ComponentTestResult[] = []

    for (const testCase of testCases) {
      console.log(`  → Testing component: ${testCase.name}`)
      const result = await this.runTest(testCase)
      suiteResults.push(result)
      
      const status = result.status === 'pass' ? '✅' : '❌'
      console.log(`    ${status} ${result.renderTime}ms ${result.error || ''}`)
    }

    return suiteResults
  }

  getSummary(): { total: number; passed: number; failed: number } {
    const total = this.results.length
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length

    return { total, passed, failed }
  }

  printSummary(): void {
    const summary = this.getSummary()
    console.log('\n📊 Component Test Summary:')
    console.log(`   Total: ${summary.total}`)
    console.log(`   ✅ Passed: ${summary.passed}`)
    console.log(`   ❌ Failed: ${summary.failed}`)
    console.log(`   Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`)
  }
}

// Mock components for testing
export const mockComponents = {
  ProductCard: ({ product }: { product: any }) => (
    <div data-testid="product-card">
      <h3 data-testid="product-name">{product.name}</h3>
      <p data-testid="product-price">₹{product.price}</p>
      <button data-testid="add-to-cart">Add to Cart</button>
    </div>
  ),

  LoginForm: () => (
    <form data-testid="login-form">
      <input 
        data-testid="phone-input" 
        placeholder="Phone Number" 
        aria-label="Phone Number"
      />
      <button data-testid="submit-button" type="submit">
        Send OTP
      </button>
    </form>
  ),

  ChatMessage: ({ message }: { message: any }) => (
    <div data-testid="chat-message" className={`message ${message.sender}`}>
      <span data-testid="sender">{message.sender}</span>
      <p data-testid="content">{message.content}</p>
      <time data-testid="timestamp">{message.timestamp}</time>
    </div>
  )
}

// Component test cases
export const componentTestCases: ComponentTestCase[] = [
  {
    name: 'ProductCard renders correctly',
    component: mockComponents.ProductCard({ 
      product: { name: 'Test Product', price: 999 } 
    }),
    expectedElements: ['product-card', 'product-name', 'product-price', 'add-to-cart'],
    accessibility: {
      checkAriaLabels: true,
      checkKeyboardNavigation: false
    }
  },
  {
    name: 'LoginForm handles input',
    component: mockComponents.LoginForm(),
    expectedElements: ['login-form', 'phone-input', 'submit-button'],
    interactions: [
      {
        action: 'type',
        target: 'phone-input',
        value: '9876543210'
      }
    ],
    accessibility: {
      checkAriaLabels: true,
      checkKeyboardNavigation: false
    }
  },
  {
    name: 'ChatMessage displays message data',
    component: mockComponents.ChatMessage({
      message: {
        sender: 'buyer',
        content: 'Hello, is this available?',
        timestamp: '2024-01-15 10:30'
      }
    }),
    expectedElements: ['chat-message', 'sender', 'content', 'timestamp']
  }
]

// Performance testing
export class PerformanceTester {
  static async measureComponentRenderTime(component: ReactElement, iterations: number = 100): Promise<number> {
    const times: number[] = []

    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      render(component)
      const end = performance.now()
      times.push(end - start)
    }

    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  static async measureMemoryUsage(component: ReactElement): Promise<number> {
    if ('memory' in performance) {
      const before = (performance as any).memory.usedJSHeapSize
      render(component)
      const after = (performance as any).memory.usedJSHeapSize
      return after - before
    }
    return 0
  }
}

// Accessibility testing
export class AccessibilityTester {
  static checkColorContrast(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element)
    const bgColor = styles.backgroundColor
    const textColor = styles.color
    
    // This is a simplified check - in practice, you'd use a proper contrast ratio calculation
    return bgColor !== textColor
  }

  static checkFocusability(container: HTMLElement): string[] {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const issues: string[] = []
    
    focusableElements.forEach((element, index) => {
      const el = element as HTMLElement
      if (el.tabIndex < 0) {
        issues.push(`Element ${index} has negative tabindex`)
      }
      if (!el.getAttribute('aria-label') && !el.textContent?.trim()) {
        issues.push(`Element ${index} lacks accessible name`)
      }
    })

    return issues
  }

  static checkHeadingStructure(container: HTMLElement): string[] {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const issues: string[] = []
    let lastLevel = 0

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))
      if (level > lastLevel + 1) {
        issues.push(`Heading level skipped: ${heading.tagName} after h${lastLevel}`)
      }
      lastLevel = level
    })

    return issues
  }
}

// Run all component tests
export async function runAllComponentTests(): Promise<void> {
  const tester = new ComponentTester()
  
  console.log('🧪 Running component tests...')
  await tester.runSuite(componentTestCases)
  tester.printSummary()
  
  // Performance tests
  console.log('\n⚡ Running performance tests...')
  for (const testCase of componentTestCases) {
    const avgTime = await PerformanceTester.measureComponentRenderTime(testCase.component, 50)
    console.log(`  → ${testCase.name}: ${avgTime.toFixed(2)}ms average render time`)
  }
  
  const summary = tester.getSummary()
  if (summary.failed > 0) {
    console.log('\n❌ Some component tests failed.')
    process.exit(1)
  } else {
    console.log('\n✅ All component tests passed!')
  }
}