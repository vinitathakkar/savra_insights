import axios from 'axios'

const api = axios.create({
    baseURL: '/api'  
})

const buildQuery = (params) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v) })
    const s = q.toString()
    return s ? `?${s}` : ''
}

export const getStats = (period = 'week', grade = '', subject = '') =>
    api.get(`/insights/stats${buildQuery({ period, grade, subject })}`)
export const getOverview = (period = 'week', grade = '', subject = '') =>
    api.get(`/insights/overview${buildQuery({ period, grade, subject })}`)
export const getWeeklyTrend = (grade = '', subject = '') =>
    api.get(`/insights/weekly${buildQuery({ grade, subject })}`)
export const getAISummary = () => api.get('/insights/ai-summary')
export const getTeacherDetail = (id, period = 'week') => api.get(`/insights/teacher/${id}?period=${period}`)
export const seedDB = () => api.get('/insights/seed')
export const getFilters = () => api.get('/insights/filters')

export default api
