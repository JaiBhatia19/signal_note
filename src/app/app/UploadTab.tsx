'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Button from '@/components/Button'
import { supabaseBrowser } from '@/lib/supabase/client';

interface CSVRow {
  text: string
  source?: string
  created_at?: string
  errors?: string[]
}

interface UploadTabProps {
  user: any
}

export default function UploadTab({ user }: UploadTabProps) {
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [validRows, setValidRows] = useState<CSVRow[]>([])
  const [invalidRows, setInvalidRows] = useState<CSVRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      // Validate required column
      if (!headers.includes('text')) {
        setError('CSV must contain a "text" column')
        return
      }

      const rows: CSVRow[] = []
      const valid: CSVRow[] = []
      const invalid: CSVRow[] = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: CSVRow = {
          text: values[headers.indexOf('text')] || '',
          source: headers.includes('source') ? values[headers.indexOf('source')] : undefined,
          created_at: headers.includes('created_at') ? values[headers.indexOf('created_at')] : undefined
        }

        // Validate row
        const errors: string[] = []
        if (!row.text.trim()) {
          errors.push('Text is required')
        }
        if (row.text.length > 1000) {
          errors.push('Text too long (max 1000 chars)')
        }

        if (errors.length > 0) {
          row.errors = errors
          invalid.push(row)
        } else {
          valid.push(row)
        }
        rows.push(row)
      }

      // Limit to 5 rows for v1
      const limitedValid = valid.slice(0, 5)
      if (valid.length > 5) {
        setError(`Limited to 5 rows for v1. Only processing first 5 rows.`)
      }

      setCsvData(rows)
      setValidRows(limitedValid)
      setInvalidRows(invalid)
      setError('')
      setSuccess('')
    }
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (validRows.length === 0) return
    
    setUploading(true)
    setError('')
    setSuccess('')

    try {
      // Create a CSV file from valid rows
      const csvContent = [
        'text,source',
        ...validRows.map(row => `${row.text},${row.source || 'upload'}`)
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], 'feedback.csv', { type: 'text/csv' })

      // Upload to batch endpoint using proper form
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/feedback/batch', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setSuccess(`Successfully processed ${result.count} feedback items!`)
      
      // Clear the form
      setCsvData([])
      setValidRows([])
      setInvalidRows([])

    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Feedback</h2>
        <p className="text-gray-600">
          Upload a CSV file with feedback. The file must contain a "text" column. 
          Optional columns: "source" and "created_at". Limited to 5 rows per upload for v1.
        </p>
      </div>

      {/* CSV Upload */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-lg">📁 Drop a CSV file here, or click to select</p>
                <p className="text-sm mt-2">Supports .csv and .txt files (max 5 rows)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Results */}
      {csvData.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Validation Results</h3>
            <div className="text-sm text-gray-600">
              {validRows.length} valid, {invalidRows.length} invalid
            </div>
          </div>

          {/* Valid Rows */}
          {validRows.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-green-700 mb-2">Valid Rows ({validRows.length})</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                {validRows.map((row, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border">
                    <div className="font-medium">{row.text.substring(0, 100)}{row.text.length > 100 ? '...' : ''}</div>
                    {row.source && <div className="text-sm text-gray-600">Source: {row.source}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invalid Rows */}
          {invalidRows.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-red-700 mb-2">Invalid Rows ({invalidRows.length})</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                {invalidRows.map((row, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border">
                    <div className="font-medium">{row.text.substring(0, 100)}{row.text.length > 100 ? '...' : ''}</div>
                    {row.errors && (
                      <div className="text-sm text-red-600">
                        Errors: {row.errors.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {validRows.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : `Upload ${validRows.length} Items`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800">{success}</div>
        </div>
      )}
    </div>
  )
} 