export interface AppError {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  details?: string
  timestamp: Date
  retryable?: boolean
  action?: string
  onRetry?: () => void
  onAction?: () => void
}

export interface ErrorConfig {
  showRetry?: boolean
  showDetails?: boolean
  autoClose?: boolean
  autoCloseDelay?: number
}

class ErrorHandler {
  private errors: AppError[] = []
  private listeners: ((errors: AppError[]) => void)[] = []

  /**
   * Add an error listener
   */
  addListener(listener: (errors: AppError[]) => void) {
    this.listeners.push(listener)
  }

  /**
   * Remove an error listener
   */
  removeListener(listener: (errors: AppError[]) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.errors]))
  }

  /**
   * Add a new error
   */
  addError(error: Omit<AppError, 'id' | 'timestamp'>) {
    const newError: AppError = {
      ...error,
      id: this.generateId(),
      timestamp: new Date(),
    }

    this.errors.unshift(newError)
    this.notifyListeners()

    return newError.id
  }

  /**
   * Remove an error by ID
   */
  removeError(errorId: string) {
    const index = this.errors.findIndex((error) => error.id === errorId)
    if (index > -1) {
      this.errors.splice(index, 1)
      this.notifyListeners()
    }
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = []
    this.notifyListeners()
  }

  /**
   * Get all current errors
   */
  getErrors(): AppError[] {
    return [...this.errors]
  }

  /**
   * Handle API errors
   */
  handleApiError(error: any, context?: string): string {
    let message = 'An unexpected error occurred'
    let details = ''
    let retryable = false

    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          message = data?.error || 'Invalid request'
          details = this.formatErrorDetails(data)
          break
        case 401:
          message = 'Authentication required'
          details = 'Please log in to continue'
          break
        case 403:
          message = 'Access denied'
          details = 'You do not have permission to perform this action'
          break
        case 404:
          message = 'Resource not found'
          details = 'The requested resource could not be found'
          break
        case 422:
          message = 'Validation error'
          details = this.formatValidationErrors(data)
          break
        case 429:
          message = 'Too many requests'
          details = 'Please wait a moment before trying again'
          retryable = true
          break
        case 500:
          message = 'Server error'
          details = 'Something went wrong on our end. Please try again later.'
          retryable = true
          break
        default:
          message = data?.error || `Server error (${status})`
          details = this.formatErrorDetails(data)
          retryable = status >= 500
      }
    } else if (error.request) {
      // Network error
      message = 'Network error'
      details = 'Please check your internet connection and try again'
      retryable = true
    } else {
      // Other error
      message = error.message || 'An unexpected error occurred'
      details = error.stack || ''
    }

    return this.addError({
      type: 'error',
      title: context ? `${context} Error` : 'Error',
      message,
      details,
      retryable,
    })
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: Record<string, string[]>): string {
    const message = 'Please fix the following errors:'
    const details = Object.entries(errors)
      .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
      .join('\n')

    return this.addError({
      type: 'error',
      title: 'Validation Error',
      message,
      details,
      retryable: false,
    })
  }

  /**
   * Handle file upload errors
   */
  handleUploadError(error: any, fileName?: string): string {
    let message = 'File upload failed'
    let details = ''

    if (error.response?.data?.error) {
      message = error.response.data.error
    } else if (error.message) {
      message = error.message
    }

    if (fileName) {
      message = `Failed to upload ${fileName}`
    }

    return this.addError({
      type: 'error',
      title: 'Upload Error',
      message,
      details,
      retryable: true,
    })
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any): string {
    let message = 'Authentication failed'
    let details = ''

    if (error.response?.status === 401) {
      message = 'Session expired'
      details = 'Please log in again to continue'
    } else if (error.response?.data?.error) {
      message = error.response.data.error
    }

    return this.addError({
      type: 'error',
      title: 'Authentication Error',
      message,
      details,
      retryable: false,
    })
  }

  /**
   * Add a warning
   */
  addWarning(title: string, message: string, details?: string): string {
    return this.addError({
      type: 'warning',
      title,
      message,
      details,
      retryable: false,
    })
  }

  /**
   * Add an info message
   */
  addInfo(title: string, message: string, details?: string): string {
    return this.addError({
      type: 'info',
      title,
      message,
      details,
      retryable: false,
    })
  }

  /**
   * Generate unique error ID
   */
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Format error details
   */
  private formatErrorDetails(data: any): string {
    if (!data) return ''

    if (typeof data === 'string') return data

    if (data.error) return data.error

    if (data.message) return data.message

    return JSON.stringify(data, null, 2)
  }

  /**
   * Format validation errors
   */
  private formatValidationErrors(data: any): string {
    if (!data || !data.errors) return ''

    if (typeof data.errors === 'object') {
      return Object.entries(data.errors)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('\n')
    }

    return data.errors
  }
}

export const errorHandler = new ErrorHandler()
