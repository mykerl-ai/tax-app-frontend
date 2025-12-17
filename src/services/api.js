import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tax API
export const taxAPI = {
  calculate: async (data) => {
    const response = await api.post('/tax/calculate', data)
    return response.data
  },
  
  compare: async (scenarios) => {
    const response = await api.post('/tax/compare', { scenarios })
    return response.data
  },
  
  getConfig: async () => {
    const response = await api.get('/tax/config')
    return response.data
  },
}

// AI API
export const aiAPI = {
  chat: async (message, context = {}) => {
    const response = await api.post('/ai/chat', { message, context })
    return response.data
  },
  
  explain: async (calculationResult) => {
    const response = await api.post('/ai/explain', { calculationResult })
    return response.data
  },
  
  question: async (question) => {
    const response = await api.post('/ai/question', { question })
    return response.data
  },
}

// Transaction API
export const transactionAPI = {
  analyzeStatement: async (file) => {
    const formData = new FormData()
    formData.append('statement', file)
    
    const response = await api.post('/transactions/analyze-statement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  analyzeStatementStream: (file, onProgress, onAnalysis, onTaxEstimate, onTaxAdvisory, onComplete, onError, onText) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const formData = new FormData()
    formData.append('statement', file)
    
    // Use fetch for streaming with FormData
    const url = API_BASE_URL.includes('/api') 
      ? `${API_BASE_URL}/transactions/analyze-statement-stream`
      : `${API_BASE_URL}/api/transactions/analyze-statement-stream`
    
    console.log('[STREAM] Starting connection to:', url)
    
    return fetch(url, {
      method: 'POST',
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      const processStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('[STREAM] Stream ended')
            return
          }
          
          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true })
          
          // Process all complete NDJSON lines (separated by \n)
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer
          
          // Process each complete JSON line
          lines.forEach(line => {
            if (!line.trim()) return
            
            try {
              const data = JSON.parse(line)
              console.log(`[STREAM] Received: ${data.type}`, { preview: JSON.stringify(data).substring(0, 80) })
              
              // Route based on type field
              switch (data.type) {
                case 'progress':
                  onProgress?.(data)
                  break
                case 'analysis':
                  onAnalysis?.(data)
                  break
                case 'taxEstimate':
                  onTaxEstimate?.(data)
                  break
                case 'taxAdvisory':
                  onTaxAdvisory?.(data)
                  break
                case 'text':
                  // Transform to match expected format
                  onText?.({
                    type: data.textType,
                    text: data.text,
                    isComplete: data.isComplete,
                    data: { title: data.title }
                  })
                  break
                case 'complete':
                  onComplete?.(data)
                  break
                case 'error':
                  onError?.(data)
                  break
              }
            } catch (err) {
              console.error('[STREAM] Error parsing JSON line:', err, line.substring(0, 100))
            }
          })
          
          // Continue reading
          return processStream()
        }).catch(error => {
          console.error('[STREAM] Read error:', error)
          onError?.({ error: error.message })
        })
      }
      
      return processStream()
    })
  },
  
  analyzeJSON: async (transactions) => {
    const response = await api.post('/transactions/analyze-statement', { transactions })
    return response.data
  },
}

export default api


