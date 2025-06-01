// Performance optimization utilities for ShopAbell

import { performance } from 'perf_hooks'

export interface PerformanceMetrics {
  timestamp: number
  metric: string
  value: number
  unit: string
  component?: string
  page?: string
}

export interface OptimizationReport {
  summary: {
    totalIssues: number
    criticalIssues: number
    suggestions: string[]
  }
  metrics: PerformanceMetrics[]
  recommendations: string[]
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []

  // Web Performance API integration
  initPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return

    // Core Web Vitals monitoring
    this.monitorLCP() // Largest Contentful Paint
    this.monitorFID() // First Input Delay
    this.monitorCLS() // Cumulative Layout Shift
    this.monitorFCP() // First Contentful Paint
    this.monitorTTFB() // Time to First Byte
  }

  private monitorLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        this.addMetric({
          metric: 'LCP',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: Date.now()
        })
      })
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(observer)
    }
  }

  private monitorFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.addMetric({
            metric: 'FID',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: Date.now()
          })
        })
      })
      
      observer.observe({ type: 'first-input', buffered: true })
      this.observers.push(observer)
    }
  }

  private monitorCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        this.addMetric({
          metric: 'CLS',
          value: clsValue,
          unit: 'score',
          timestamp: Date.now()
        })
      })
      
      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(observer)
    }
  }

  private monitorFCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.addMetric({
            metric: 'FCP',
            value: entry.startTime,
            unit: 'ms',
            timestamp: Date.now()
          })
        })
      })
      
      observer.observe({ type: 'paint', buffered: true })
      this.observers.push(observer)
    }
  }

  private monitorTTFB(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.addMetric({
          metric: 'TTFB',
          value: navigation.responseStart - navigation.requestStart,
          unit: 'ms',
          timestamp: Date.now()
        })
      }
    }
  }

  // Component performance monitoring
  measureComponentRender<T>(
    componentName: string,
    renderFn: () => T
  ): T {
    const start = performance.now()
    const result = renderFn()
    const end = performance.now()

    this.addMetric({
      metric: 'Component Render Time',
      value: end - start,
      unit: 'ms',
      component: componentName,
      timestamp: Date.now()
    })

    return result
  }

  // API call performance monitoring
  async measureAPICall<T>(
    endpoint: string,
    apiFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await apiFn()
      const end = performance.now()

      this.addMetric({
        metric: 'API Response Time',
        value: end - start,
        unit: 'ms',
        page: endpoint,
        timestamp: Date.now()
      })

      return result
    } catch (error) {
      const end = performance.now()
      
      this.addMetric({
        metric: 'API Error Time',
        value: end - start,
        unit: 'ms',
        page: endpoint,
        timestamp: Date.now()
      })

      throw error
    }
  }

  // Memory usage monitoring
  measureMemoryUsage(label: string): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      
      this.addMetric({
        metric: 'JS Heap Used',
        value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        unit: 'MB',
        component: label,
        timestamp: Date.now()
      })

      this.addMetric({
        metric: 'JS Heap Total',
        value: memory.totalJSHeapSize / 1024 / 1024,
        unit: 'MB',
        component: label,
        timestamp: Date.now()
      })
    }
  }

  // Bundle size analysis
  analyzeBundle(): string[] {
    const recommendations: string[] = []
    
    // Check for large dependencies (mock analysis)
    const largeDependencies = [
      'moment.js (use date-fns instead)',
      'lodash (use individual functions)',
      'entire Material-UI (use tree shaking)'
    ]
    
    recommendations.push(...largeDependencies.map(dep => 
      `Consider optimizing large dependency: ${dep}`
    ))

    return recommendations
  }

  // Image optimization analysis
  analyzeImages(): string[] {
    if (typeof window === 'undefined') return []
    
    const recommendations: string[] = []
    const images = document.querySelectorAll('img')
    
    images.forEach((img, index) => {
      // Check for missing alt text
      if (!img.alt) {
        recommendations.push(`Image ${index + 1}: Missing alt text for accessibility`)
      }

      // Check for unoptimized formats
      if (img.src.includes('.png') || img.src.includes('.jpg')) {
        recommendations.push(`Image ${index + 1}: Consider using WebP format for better compression`)
      }

      // Check for missing lazy loading
      if (!img.loading || img.loading !== 'lazy') {
        recommendations.push(`Image ${index + 1}: Add lazy loading for better performance`)
      }
    })

    return recommendations
  }

  // Database query optimization suggestions
  analyzeDatabaseQueries(): string[] {
    return [
      'Add database indexes for frequently queried fields (phone, seller_id, created_at)',
      'Implement query result caching for product catalogs',
      'Use database connection pooling for better performance',
      'Consider read replicas for analytics queries',
      'Optimize N+1 queries in chat message loading',
      'Add pagination to prevent large dataset fetches',
      'Use EXPLAIN ANALYZE to identify slow queries'
    ]
  }

  // Caching strategy recommendations
  analyzeCaching(): string[] {
    return [
      'Implement Redis caching for frequently accessed data',
      'Add browser caching headers for static assets',
      'Use Service Worker for offline caching',
      'Cache product images on CDN',
      'Implement server-side caching for API responses',
      'Use stale-while-revalidate strategy for better UX',
      'Cache seller store configurations'
    ]
  }

  // Network optimization
  analyzeNetwork(): string[] {
    return [
      'Enable gzip/brotli compression on server',
      'Use HTTP/2 for multiplexed requests',
      'Implement resource hints (preload, prefetch)',
      'Minimize HTTP requests through bundling',
      'Use CDN for static assets',
      'Optimize API payload sizes',
      'Implement request debouncing for search'
    ]
  }

  // Code splitting recommendations
  analyzeCodeSplitting(): string[] {
    return [
      'Split admin panel into separate bundle',
      'Lazy load dashboard components',
      'Split vendor libraries from main bundle',
      'Use dynamic imports for heavy components',
      'Implement route-based code splitting',
      'Split CSS into critical and non-critical',
      'Use React.lazy for component splitting'
    ]
  }

  // Generate comprehensive optimization report
  generateReport(): OptimizationReport {
    const criticalThresholds = {
      LCP: 2500, // ms
      FID: 100,  // ms
      CLS: 0.1,  // score
      'API Response Time': 1000 // ms
    }

    let criticalIssues = 0
    const suggestions: string[] = []

    // Analyze current metrics
    this.metrics.forEach(metric => {
      const threshold = criticalThresholds[metric.metric as keyof typeof criticalThresholds]
      if (threshold && metric.value > threshold) {
        criticalIssues++
        suggestions.push(`${metric.metric} is above threshold: ${metric.value}${metric.unit} > ${threshold}${metric.unit}`)
      }
    })

    // Collect all recommendations
    const recommendations = [
      ...this.analyzeBundle(),
      ...this.analyzeImages(),
      ...this.analyzeDatabaseQueries(),
      ...this.analyzeCaching(),
      ...this.analyzeNetwork(),
      ...this.analyzeCodeSplitting()
    ]

    return {
      summary: {
        totalIssues: suggestions.length + recommendations.length,
        criticalIssues,
        suggestions
      },
      metrics: this.metrics,
      recommendations
    }
  }

  private addMetric(metric: Omit<PerformanceMetrics, 'timestamp'> & { timestamp?: number }): void {
    this.metrics.push({
      timestamp: Date.now(),
      ...metric
    })
  }

  // Cleanup
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  // Get metrics
  getMetrics(): PerformanceMetrics[] {
    return this.metrics
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = []
  }
}

// Performance optimization hooks for React components
export function usePerformanceMonitor(componentName: string) {
  const optimizer = new PerformanceOptimizer()

  const measureRender = <T>(fn: () => T): T => {
    return optimizer.measureComponentRender(componentName, fn)
  }

  const measureAPI = async <T>(endpoint: string, fn: () => Promise<T>): Promise<T> => {
    return await optimizer.measureAPICall(endpoint, fn)
  }

  return { measureRender, measureAPI, getMetrics: () => optimizer.getMetrics() }
}

// Global performance instance
export const globalPerformanceOptimizer = new PerformanceOptimizer()

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  globalPerformanceOptimizer.initPerformanceMonitoring()
}