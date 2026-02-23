import axios from 'axios'

const BASE = '/api'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Auth
export const register = (data) => axios.post(`${BASE}/auth/register`, data)
export const login = (data) => axios.post(`${BASE}/auth/login`, data)

// Materials
export const uploadMaterial = (formData) =>
  axios.post(`${BASE}/materials/upload`, formData, { headers: getHeaders() })

export const getMaterials = (userId) =>
  axios.get(`${BASE}/materials/user/${userId}`, { headers: getHeaders() })

export const getMaterial = (id) =>
  axios.get(`${BASE}/materials/${id}`, { headers: getHeaders() })

export const askQuestion = (materialId, question) =>
  axios.post(`${BASE}/materials/${materialId}/ask`, { question }, { headers: getHeaders() })

export const summarizeMaterial = (materialId) =>
  axios.post(`${BASE}/materials/${materialId}/summarize`, {}, { headers: getHeaders() })

export const deleteMaterial = (id) =>
  axios.delete(`${BASE}/materials/${id}`, { headers: getHeaders() })

// Study Plans
export const generatePlan = (data) =>
  axios.post(`${BASE}/plans/generate`, data, { headers: getHeaders() })

export const getUserPlans = (userId) =>
  axios.get(`${BASE}/plans/user/${userId}`, { headers: getHeaders() })

export const getTodayPlans = (userId) =>
  axios.get(`${BASE}/plans/user/${userId}/today`, { headers: getHeaders() })

export const getStats = (userId) =>
  axios.get(`${BASE}/plans/user/${userId}/stats`, { headers: getHeaders() })

export const markComplete = (planId) =>
  axios.patch(`${BASE}/plans/${planId}/complete`, {}, { headers: getHeaders() })

export const markIncomplete = (planId) =>
  axios.patch(`${BASE}/plans/${planId}/incomplete`, {}, { headers: getHeaders() })

export const deletePlan = (planId) =>
  axios.delete(`${BASE}/plans/${planId}`, { headers: getHeaders() })

// Quiz
export const generateQuiz = (materialId, numQuestions = 5) =>
  axios.get(`${BASE}/quiz/generate/${materialId}?numQuestions=${numQuestions}`, { headers: getHeaders() })

export const submitQuiz = (data) =>
  axios.post(`${BASE}/quiz/submit`, data, { headers: getHeaders() })

export const getUserQuizzes = (userId) =>
  axios.get(`${BASE}/quiz/user/${userId}`, { headers: getHeaders() })
