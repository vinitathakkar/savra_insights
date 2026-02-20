import { useState, useEffect, useCallback } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BookOpen, ClipboardList, FileText, ArrowLeft, Download, Search } from 'lucide-react'
import { getOverview, getTeacherDetail } from '../api'

const PERIODS = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
]

function formatDate(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981']

function exportCSV(teacher, detail) {
    const rows = [
        ['Teacher', teacher.teacherName],
        ['Subjects', (detail.subjects || []).join(', ')],
        ['Grades', (detail.grades || []).map(g => `Grade ${g}`).join(', ')],
        [],
        ['Activity Type', 'Count'],
        ['Lessons', detail.lessons],
        ['Quizzes', detail.quizzes],
        ['Assessments', detail.assessments],
        [],
        ['Class', 'Avg Score', 'Total Activities'],
        ...(detail.classBreakdown || []).map(c => [c.class, c.avgScore, c.completion]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${teacher.teacherName.replace(' ', '_')}_report.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export default function Teachers() {
    const [period, setPeriod] = useState('week')
    const [overview, setOverview] = useState([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [detailLoad, setDetailLoad] = useState(false)
    const [error, setError] = useState(null)

    const loadOverview = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getOverview(period)
            setOverview(res.data)
        } catch {
            setError('Could not load teachers. Make sure backend is running.')
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => { loadOverview() }, [loadOverview])

    const loadDetail = async (teacher) => {
        setSelected(teacher)
        setDetailLoad(true)
        setDetail(null)
        try {
            const res = await getTeacherDetail(teacher.teacherId, period)
            setDetail(res.data)
        } catch {
            setError('Could not load teacher detail.')
        } finally {
            setDetailLoad(false)
        }
    }

    const handleBack = () => {
        setSelected(null)
        setDetail(null)
    }

    const filtered = overview.filter(t =>
        t.teacherName.toLowerCase().includes(search.toLowerCase())
    )

    if (selected) {
        const avatarColor = AVATAR_COLORS[
            selected.teacherName.charCodeAt(0) % AVATAR_COLORS.length
        ]
        return (
            <div className="detail-view">
                {/* Top bar */}
                <div className="topbar">
                    <div className="topbar-left">
                        <h1>Teachers</h1>
                        <p>Per-teacher performance overview</p>
                    </div>
                    <div className="period-tabs">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                className={`period-tab${period === p.value ? ' active' : ''}`}
                                onClick={() => { setPeriod(p.value); loadDetail({ ...selected }) }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hero */}
                <div className="detail-hero">
                    <div className="detail-back-row">
                        <button className="back-btn" onClick={handleBack}>
                            <ArrowLeft size={14} />
                            Back to Teachers
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="teacher-avatar" style={{ background: avatarColor, width: 52, height: 52, fontSize: '1.1rem' }}>
                            {getInitials(selected.teacherName)}
                        </div>
                        <div>
                            <div className="detail-name">{selected.teacherName}</div>
                            <div className="detail-meta">
                                {detail?.subjects?.map(s => (
                                    <span key={s} className="chip subject">{s}</span>
                                ))}
                                {detail?.grades?.map(g => (
                                    <span key={g} className="chip grade">Class {g}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {detailLoad || !detail ? (
                    <div className="spinner-wrap"><div className="spinner" /></div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className="stats-grid">
                            <div className="stat-card c-green">
                                <div className="stat-top">
                                    <span className="stat-label">Lessons Created</span>
                                    <span className="stat-badge c-green"><BookOpen size={16} /></span>
                                </div>
                                <div className="stat-value">{detail.lessons}</div>
                                <div className="stat-sub">All time</div>
                            </div>
                            <div className="stat-card c-blue">
                                <div className="stat-top">
                                    <span className="stat-label">Quizzes Conducted</span>
                                    <span className="stat-badge c-blue"><FileText size={16} /></span>
                                </div>
                                <div className="stat-value">{detail.quizzes}</div>
                                <div className="stat-sub">All time</div>
                            </div>
                            <div className="stat-card c-amber">
                                <div className="stat-top">
                                    <span className="stat-label">Assessments Assigned</span>
                                    <span className="stat-badge c-amber"><ClipboardList size={16} /></span>
                                </div>
                                <div className="stat-value">{detail.assessments}</div>
                                <div className="stat-sub">All time</div>
                            </div>
                        </div>

                        {detail.lowEngagement && (
                            <div className="low-engage">
                                âš ï¸ Low engagement detected. Average score is 0%. Consider reviewing teaching methods or checking data.
                            </div>
                        )}

                        {/* Class-wise breakdown + Recent Activity */}
                        <div className="two-col">
                            <div className="glass-card">
                                <div className="card-title">Class-wise Breakdown</div>
                                <div className="card-sub">Activity count per class</div>
                                {detail.classBreakdown?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={detail.classBreakdown} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                            <XAxis dataKey="class" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                            <Tooltip contentStyle={{
                                                fontSize: '0.78rem', borderRadius: 10,
                                                background: '#1e1e2e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0'
                                            }} />
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
                                            <Bar dataKey="avgScore" name="Avg Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="completion" name="Activities" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-box">
                                        <p>No class data yet</p>
                                        <p>No lessons or quizzes created yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="glass-card">
                                <div className="card-title">Recent Activity</div>
                                <div className="card-sub" style={{ marginBottom: 12 }}>Latest 5 activities</div>
                                {detail.recentActivities?.length > 0 ? (
                                    <div className="activity-list">
                                        {detail.recentActivities.map((r, i) => (
                                            <div key={i} className="activity-row">
                                                <div className={`activity-dot ${r.type}`} />
                                                <div style={{ flex: 1 }}>
                                                    <div className="activity-type">{r.type}</div>
                                                    <div className="activity-sub">{r.subject} Â· Class {r.class}</div>
                                                </div>
                                                <div className="activity-date">{formatDate(r.createdAt)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-box">
                                        <p>No Recent Activity</p>
                                        <p>No lessons or quizzes created yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Export */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button className="export-btn" onClick={() => exportCSV(selected, detail)}>
                                <Download size={14} />
                                Export Report (CSV)
                            </button>
                        </div>
                    </>
                )}
            </div>
        )
    }

    // â”€â”€ Teacher list view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <div>
            {/* Top bar */}
            <div className="topbar">
                <div className="topbar-left">
                    <h1>Teachers</h1>
                    <p>Overview of all teacher activity</p>
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

            <div className="glass-card">
                {/* Search */}
                <div className="search-row">
                    <div className="search-box">
                        <Search size={15} style={{ color: '#64748b' }} />
                        <input
                            className="search-input"
                            placeholder="Search teacher by name.."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="spinner-wrap"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-box">
                        <p>No teachers found</p>
                        <p>Seed the database from the Dashboard page first</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Teacher</th>
                                    <th>Subjects</th>
                                    <th>Grades</th>
                                    <th>Lessons</th>
                                    <th>Quizzes</th>
                                    <th>Assessments</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t, idx) => {
                                    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                    return (
                                        <tr
                                            key={t.teacherId}
                                            onClick={() => loadDetail(t)}
                                            title="Click to view per-teacher analysis"
                                        >
                                            <td>
                                                <div className="teacher-name-cell">
                                                    <div className="teacher-avatar" style={{ background: avatarColor }}>
                                                        {getInitials(t.teacherName)}
                                                    </div>
                                                    {t.teacherName}
                                                </div>
                                            </td>
                                            <td>
                                                {(t.subjects || []).map(s => (
                                                    <span key={s} className="chip subject">{s}</span>
                                                ))}
                                            </td>
                                            <td>
                                                {(t.grades || []).map(g => (
                                                    <span key={g} className="chip grade">Cls {g}</span>
                                                ))}
                                            </td>
                                            <td><span className="num-badge lesson">{t.lessons}</span></td>
                                            <td><span className="num-badge quiz">{t.quizzes}</span></td>
                                            <td><span className="num-badge assessment">{t.assessments}</span></td>
                                            <td style={{ fontWeight: 700, color: '#e2e8f0' }}>
                                                {t.lessons + t.quizzes + t.assessments}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
