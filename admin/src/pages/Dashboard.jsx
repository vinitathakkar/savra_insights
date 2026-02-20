import { useState, useEffect } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Users, BookOpen, ClipboardList, FileText, TrendingUp, AlertTriangle, Zap, Search, ChevronDown, GraduationCap } from 'lucide-react'
import { getStats, getWeeklyTrend, getAISummary, seedDB, getFilters } from '../api'

const PERIODS = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
]

const pulseIcon = (type) => {
    if (type === 'workload') return <TrendingUp size={15} />
    if (type === 'enrollment') return <GraduationCap size={15} />
    return <AlertTriangle size={15} />
}

export default function Dashboard() {
    const [period, setPeriod] = useState('week')
    const [grade, setGrade] = useState('')
    const [subject, setSubject] = useState('')
    const [search, setSearch] = useState('')
    const [grades, setGrades] = useState([])
    const [subjects, setSubjects] = useState([])
    const [stats, setStats] = useState(null)
    const [trend, setTrend] = useState([])
    const [pulse, setPulse] = useState([])
    const [loading, setLoading] = useState(true)
    const [seeding, setSeeding] = useState(false)
    const [seeded, setSeeded] = useState(false)
    const [error, setError] = useState(null)

    // Load available filter options once
    useEffect(() => {
        getFilters().then(res => {
            setGrades(res.data.grades || [])
            setSubjects(res.data.subjects || [])
        }).catch(() => { })
    }, [])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [s, t, p] = await Promise.all([
                getStats(period, grade, subject),
                getWeeklyTrend(grade, subject),
                getAISummary(),
            ])
            setStats(s.data)
            setTrend(t.data)
            setPulse(p.data)
        } catch (e) {
            setError('Could not load data. Make sure the backend is running on port 5000.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [period, grade, subject])

    const handleSeed = async () => {
        setSeeding(true)
        try {
            await seedDB()
            setSeeded(true)
            // Reload filters after seed
            const f = await getFilters()
            setGrades(f.data.grades || [])
            setSubjects(f.data.subjects || [])
            await loadData()
        } catch {
            setError('Seeding failed.')
        } finally {
            setSeeding(false)
        }
    }

    const periodLabel = PERIODS.find(p => p.value === period)?.label

    return (
        <div>
            {/* Top bar */}
            <div className="topbar">
                <div className="topbar-left">
                    <h1>Admin Companion</h1>
                    <p>See What's Happening Across your School</p>
                    <h1 style={{
                        color: 'black'
                    }}>INSIGHTS</h1>
                </div>

                {/* Search + Filters */}
                <div className="topbar-filters">

                    <div className="filter-select-wrap">
                        <select
                            className="filter-select"
                            value={grade}
                            onChange={e => setGrade(e.target.value)}
                        >
                            <option value="">All Grades</option>
                            {grades.map(g => (
                                <option key={g} value={g}>Grade {g}</option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="select-chevron" />
                    </div>

                    <div className="filter-select-wrap">
                        <select
                            className="filter-select"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="select-chevron" />
                    </div>
                </div>
            </div>

            {/* Period tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {(grade || subject) && (
                        <span className="filter-active-badge">
                            {[grade && `Grade ${grade}`, subject].filter(Boolean).join(' · ')}
                            <button onClick={() => { setGrade(''); setSubject('') }}>✕</button>
                        </span>
                    )}
                </div>
                <div className="period-tabs">
                    {PERIODS.map(p => (
                        <button
                            key={p.value}
                            className={`period-tab${period === p.value ? ' active' : ''}`}
                            onClick={() => setPeriod(p.value)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
            ) : (
                <>
                    {/* Stats cards */}
                    <div className="stats-grid">
                        <div className="stat-card c-indigo">
                            <div className="stat-top">
                                <span className="stat-label">Active Teachers</span>
                                <span className="stat-badge c-indigo"><Users size={16} /></span>
                            </div>
                            <div className="stat-value">{stats?.activeTeachers ?? 0}</div>
                            <div className="stat-sub">{periodLabel}</div>
                        </div>

                        <div className="stat-card c-green">
                            <div className="stat-top">
                                <span className="stat-label">Lessons Created</span>
                                <span className="stat-badge c-green"><BookOpen size={16} /></span>
                            </div>
                            <div className="stat-value">{stats?.lessons ?? 0}</div>
                            <div className="stat-sub">{periodLabel}</div>
                        </div>

                        <div className="stat-card c-amber">
                            <div className="stat-top">
                                <span className="stat-label">Assessments Made</span>
                                <span className="stat-badge c-amber"><ClipboardList size={16} /></span>
                            </div>
                            <div className="stat-value">{stats?.assessments ?? 0}</div>
                            <div className="stat-sub">{periodLabel}</div>
                        </div>

                        <div className="stat-card c-blue">
                            <div className="stat-top">
                                <span className="stat-label">Quizzes Conducted</span>
                                <span className="stat-badge c-blue"><FileText size={16} /></span>
                            </div>
                            <div className="stat-value">{stats?.quizzes ?? 0}</div>
                            <div className="stat-sub">{periodLabel}</div>
                        </div>
                    </div>

                    {/* Chart + AI Pulse */}
                    <div className="two-col">
                        <div className="glass-card">
                            <div className="card-title">Weekly Activity</div>
                            <div className="card-sub">Content creation trends — last 7 days</div>
                            <ResponsiveContainer width="100%" height={230}>
                                <AreaChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gLesson" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="gQuiz" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="gAssess" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                    <Tooltip contentStyle={{
                                        fontSize: '0.78rem', borderRadius: 10,
                                        background: '#1e1e2e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0',
                                    }} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
                                    <Area type="monotone" dataKey="lesson" name="Lessons" stroke="#6366f1" fill="url(#gLesson)" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
                                    <Area type="monotone" dataKey="quiz" name="Quizzes" stroke="#10b981" fill="url(#gQuiz)" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                                    <Area type="monotone" dataKey="assessment" name="Assessments" stroke="#f59e0b" fill="url(#gAssess)" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="glass-card">
                            <div className="card-title">
                                <Zap size={16} style={{ marginRight: 6, color: '#a78bfa', verticalAlign: 'middle' }} />
                                AI Pulse Summary
                            </div>
                            <div className="card-sub">Real-time insights from your data</div>
                            {pulse.length === 0 ? (
                                <div className="empty-box">
                                    <p>No insights yet</p>
                                    <p>Seed the database first</p>
                                </div>
                            ) : (
                                <div className="pulse-list">
                                    {pulse.map((item, i) => (
                                        <div key={i} className={`pulse-item ${item.type}`}>
                                            <span className="pulse-icon">{pulseIcon(item.type)}</span>
                                            <span>{item.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
