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
    // Note: API_BASE_URL already includes /api if set, otherwise we add it
    const url = API_BASE_URL.includes('/api') 
      ? `${API_BASE_URL}/transactions/analyze-statement-stream`
      : `${API_BASE_URL}/api/transactions/analyze-statement-stream`
    
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
            return
          }
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer
          
          lines.forEach(line => {
            if (!line.trim()) return
            
            const [eventLine, dataLine] = line.split('\n')
            if (!eventLine || !dataLine) return
            
            const event = eventLine.replace('event: ', '')
            const data = JSON.parse(dataLine.replace('data: ', ''))
            
            switch (event) {
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
                onText?.(data)
                break
              case 'complete':
                onComplete?.(data)
                break
              case 'error':
                onError?.(data)
                break
            }
          })
          
          return processStream()
        }).catch(error => {
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


