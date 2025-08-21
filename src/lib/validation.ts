import { NextResponse } from 'next/server'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export function validateInput(data: any, schema: ValidationSchema): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]

    if (rules.required && (!value || value.trim() === '')) {
      errors.push(`${field} is required`)
      continue
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`)
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} must be no more than ${rules.maxLength} characters`)
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`)
    }

    if (value && rules.custom) {
      const customResult = rules.custom(value)
      if (typeof customResult === 'string') {
        errors.push(customResult)
      } else if (!customResult) {
        errors.push(`${field} validation failed`)
      }
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function withValidation(schema: ValidationSchema) {
  return function(handler: Function) {
    return async function(req: Request) {
      try {
        const body = await req.json()
        const validation = validateInput(body, schema)
        
        if (!validation.isValid) {
          return NextResponse.json({ 
            error: 'Validation failed', 
            details: validation.errors 
          }, { status: 400 })
        }

        return handler(req)
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }
    }
  }
} 