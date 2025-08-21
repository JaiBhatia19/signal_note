export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startTimer(name: string): () => void {
    const start = performance.now()
    return () => this.endTimer(name, start)
  }

  private endTimer(name: string, start: number) {
    const duration = performance.now() - start
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)
  }

  getMetrics() {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    this.metrics.forEach((values, name) => {
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      result[name] = { avg, min, max, count: values.length }
    })
    
    return result
  }

  reset() {
    this.metrics.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor() 