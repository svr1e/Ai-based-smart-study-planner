import axios from 'axios'

// In production (Netlify), use the Render backend URL via env var.
// In dev, Vite's proxy handles /api → localhost:8080
const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
})

// Attach JWT token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const BASE = '/api'

// Auth
export const register = (data) => api.post(`${BASE}/auth/register`, data)
export const login = (data) => api.post(`${BASE}/auth/login`, data)

// Materials
export const uploadMaterial = (formData) =>
  api.post(`${BASE}/materials/upload`, formData)

export const getMaterials = (userId) =>
  api.get(`${BASE}/materials/user/${userId}`)

export const getMaterial = (id) =>
  api.get(`${BASE}/materials/${id}`)

export const askQuestion = (materialId, question) =>
  api.post(`${BASE}/materials/${materialId}/ask`, { question })

export const summarizeMaterial = (materialId) =>
  api.post(`${BASE}/materials/${materialId}/summarize`, {})

export const deleteMaterial = (id) =>
  api.delete(`${BASE}/materials/${id}`)

// Study Plans
export const generatePlan = (data) =>
  api.post(`${BASE}/plans/generate`, data)

export const getUserPlans = (userId) =>
  api.get(`${BASE}/plans/user/${userId}`)

export const getTodayPlans = (userId) =>
  api.get(`${BASE}/plans/user/${userId}/today`)

export const getStats = (userId) =>
  api.get(`${BASE}/plans/user/${userId}/stats`)

export const markComplete = (planId) =>
  api.patch(`${BASE}/plans/${planId}/complete`, {})

export const markIncomplete = (planId) =>
  api.patch(`${BASE}/plans/${planId}/incomplete`, {})

export const deletePlan = (planId) =>
  api.delete(`${BASE}/plans/${planId}`)

// Quiz
export const generateQuiz = (materialId, numQuestions = 5) =>
  api.get(`${BASE}/quiz/generate/${materialId}?numQuestions=${numQuestions}`)

export const submitQuiz = (data) =>
  api.post(`${BASE}/quiz/submit`, data)

export const getUserQuizzes = (userId) =>
  api.get(`${BASE}/quiz/user/${userId}`)
