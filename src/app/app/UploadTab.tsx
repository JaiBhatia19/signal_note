'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase'
import Button from '@/components/Button'

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
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
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

      setCsvData(rows)
      setValidRows(valid)
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

  const handleAnalyze = async () => {
    if (validRows.length === 0) return
    
    setAnalyzing(true)
    setProgress(0)
    setError('')
    setSuccess('')

    try {
      // Upload feedback items first
      const supabase = createClient()
      const feedbackItems = validRows.map(row => ({
        user_id: user.id,
        text: row.text,
        source: row.source || 'upload',
        created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
      }))

      const { data: items, error: insertError } = await supabase
        .from('feedback_items')
        .insert(feedbackItems)
        .select()

      if (insertError) throw insertError

      // Start analysis
      const response = await fetch('/api/feedback/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemIds: items.map(item => item.id),
          userId: user.id
        })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const { jobId } = await response.json()
      
      // Poll for progress
      const pollProgress = async () => {
        const progressResponse = await fetch(`/api/feedback/batch?jobId=${jobId}`)
        if (progressResponse.ok) {
          const { status, progress: jobProgress } = await progressResponse.json()
          setProgress(jobProgress)
          
          if (status === 'completed') {
            setSuccess(`Analysis complete! ${items.length} items processed.`)
            setAnalyzing(false)
            // Refresh data in other tabs
            window.location.reload()
          } else if (status === 'failed') {
            throw new Error('Analysis failed')
          } else {
            // Continue polling
            setTimeout(pollProgress, 2000)
          }
        }
      }

      pollProgress()

    } catch (err: any) {
      setError(err.message || 'Analysis failed')
      setAnalyzing(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Feedback</h2>
        <p className="text-gray-600">
          Upload a CSV file with feedback. The file must contain a "text" column. 
          Optional columns: "source" and "created_at".
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
                <p className="text-sm mt-2">Supports .csv and .txt files</p>
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

          {validRows.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-green-800 mb-2">Valid Rows ({validRows.length})</h4>
              <div className="space-y-2">
                {validRows.slice(0, 5).map((row, i) => (
                  <div key={i} className="text-sm text-green-700">
                    "{row.text.substring(0, 100)}{row.text.length > 100 ? '...' : ''}"
                  </div>
                ))}
                {validRows.length > 5 && (
                  <div className="text-sm text-green-600">...and {validRows.length - 5} more</div>
                )}
              </div>
            </div>
          )}

          {invalidRows.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="font-medium text-red-800 mb-2">Invalid Rows ({invalidRows.length})</h4>
              <div className="space-y-2">
                {invalidRows.slice(0, 3).map((row, i) => (
                  <div key={i} className="text-sm text-red-700">
                    <div>"{row.text.substring(0, 100)}{row.text.length > 100 ? '...' : ''}"</div>
                    <div className="text-xs text-red-600">Errors: {row.errors?.join(', ')}</div>
                  </div>
                ))}
                {invalidRows.length > 3 && (
                  <div className="text-sm text-red-600">...and {invalidRows.length - 3} more</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {validRows.length > 0 && (
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {analyzing ? 'Analyzing...' : `Analyze ${validRows.length} Items`}
          </Button>
          
          {analyzing && (
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}
    </div>
  )
} 