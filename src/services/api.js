import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
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
  
  analyzeJSON: async (transactions) => {
    const response = await api.post('/transactions/analyze-statement', { transactions })
    return response.data
  },
}

export default api

