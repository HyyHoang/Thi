import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dashboardService from '../../services/dashboardService';
import './AdminHome.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ExamItem {
  exam_id: string;
  title: string;
  subject_name: string;
  section_name: string;
  start_time: string | null;
  end_time: string | null;
  duration: number;
  question_count: number;
  attempt_count: number;
  status: 'past' | 'ongoing' | 'upcoming';
  created_by: string;
  creator_name: string;
}

interface SemesterInfo {
  semester_id: string;
  semester_name: string;
  academic_year: string;
}

interface Overview {
  total_exams: number;
  total_attempts: number;
  avg_score: number;
  pass_rate: number;
}

interface ScoreBucket {
  range: string;
  count: number;
}

interface SubjectScoreDist {
  subject_name: string;
  distribution: ScoreBucket[];
}

interface SubjectPassFail {
  subject_name: string;
  pass: number;
  fail: number;
  total: number;
}

type TabKey = 'past' | 'ongoing' | 'upcoming';

const TAB_LABELS: Record<TabKey, string> = {
  past: 'Quá khứ',
  ongoing: 'Hiện tại',
  upcoming: 'Tương lai',
};

const TAB_ICONS: Record<TabKey, string> = {
  past: '📋',
  ongoing: '🔴',
  upcoming: '📅',
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  past: { label: 'Đã kết thúc', cls: 'badge-past' },
  ongoing: { label: 'Đang diễn ra', cls: 'badge-ongoing' },
  upcoming: { label: 'Sắp tới', cls: 'badge-upcoming' },
};

function formatDateTime(dt: string | null): string {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminHome() {
  const [user] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  });

  const [semester, setSemester] = useState<SemesterInfo | null>(null);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [scoreDistBySubject, setScoreDistBySubject] = useState<SubjectScoreDist[]>([]);
  const [subjectPF, setSubjectPF] = useState<SubjectPassFail[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('ongoing');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [examRes, statsRes]: any = await Promise.all([
          dashboardService.getExams(),
          dashboardService.getExamStats(),
        ]);
        setSemester(examRes.data?.semester || null);
        setExams(examRes.data?.exams || []);
        setOverview(statsRes.data?.overview || null);
        const distData = statsRes.data?.score_distribution || [];
        setScoreDistBySubject(distData);
        if (distData.length > 0) setSelectedSubject(distData[0].subject_name);
        setSubjectPF(statsRes.data?.subject_pass_fail || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-select tab with data
  useEffect(() => {
    if (exams.length === 0) return;
    const ongoingCount = exams.filter(e => e.status === 'ongoing').length;
    const upcomingCount = exams.filter(e => e.status === 'upcoming').length;
    if (ongoingCount > 0) setActiveTab('ongoing');
    else if (upcomingCount > 0) setActiveTab('upcoming');
    else setActiveTab('past');
  }, [exams]);

  const filteredExams = useMemo(
    () => exams.filter(e => e.status === activeTab),
    [exams, activeTab]
  );

  const tabCounts = useMemo(() => ({
    past: exams.filter(e => e.status === 'past').length,
    ongoing: exams.filter(e => e.status === 'ongoing').length,
    upcoming: exams.filter(e => e.status === 'upcoming').length,
  }), [exams]);

  // ── Chart: Phân bố điểm theo môn ──
  const currentScoreDist = useMemo(() => {
    const found = scoreDistBySubject.find(s => s.subject_name === selectedSubject);
    return found?.distribution || [];
  }, [scoreDistBySubject, selectedSubject]);

  const subjectNames = useMemo(
    () => scoreDistBySubject.map(s => s.subject_name),
    [scoreDistBySubject]
  );

  const scoreChartData = useMemo(() => ({
    labels: currentScoreDist.map(b => b.range),
    datasets: [{
      label: 'Số lượng',
      data: currentScoreDist.map(b => b.count),
      backgroundColor: currentScoreDist.map((_, i) => {
        const colors = [
          '#ef4444', '#f97316', '#f59e0b', '#eab308',
          '#84cc16', '#22c55e', '#10b981', '#14b8a6',
          '#06b6d4', '#3b82f6',
        ];
        return colors[i] || '#6366f1';
      }),
      borderRadius: 6,
      borderSkipped: false,
    }],
  }), [currentScoreDist]);

  const scoreChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', size: 13, weight: 600 as const },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => `  ${ctx.parsed.y} sinh viên`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          font: { family: 'Inter', size: 11 },
          color: '#64748b',
          stepSize: 1,
        },
      },
    },
  }), []);

  // ── Chart: Đạt/rớt theo môn ──
  const subjectChartData = useMemo(() => ({
    labels: subjectPF.map(s => s.subject_name),
    datasets: [
      {
        label: 'Đạt (≥4đ)',
        data: subjectPF.map(s => s.pass),
        backgroundColor: '#22c55e',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Rớt (<4đ)',
        data: subjectPF.map(s => s.fail),
        backgroundColor: '#ef4444',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }), [subjectPF]);

  const subjectChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { family: 'Inter', size: 12, weight: 600 as const },
          color: '#334155',
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', size: 13, weight: 600 as const },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => `  ${ctx.dataset.label}: ${ctx.parsed.y} sinh viên`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          font: { family: 'Inter', size: 11 },
          color: '#64748b',
          stepSize: 1,
        },
      },
    },
  }), []);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-home">
      {/* ── Header ── */}
      <div className="dash-header">
        <div className="dash-greeting">
          <h2>Dashboard</h2>
          <p className="dash-welcome">
            Xin chào, <strong>{user.FullName || user.username || user.email || 'Người dùng'}</strong>! 👋
          </p>
        </div>
        {semester && (
          <div className="dash-semester-badge">
            <span className="dash-semester-icon">🎓</span>
            <div>
              <div className="dash-semester-name">{semester.semester_name}</div>
              <div className="dash-semester-year">{semester.academic_year}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Overview cards ── */}
      {overview && (
        <div className="dash-overview">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>📝</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{overview.total_exams}</div>
              <div className="dash-stat-label">Đề thi</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>📊</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{overview.total_attempts}</div>
              <div className="dash-stat-label">Lượt thi</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>⭐</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{overview.avg_score}</div>
              <div className="dash-stat-label">Điểm TB</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>✅</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{overview.pass_rate}%</div>
              <div className="dash-stat-label">Tỷ lệ đạt</div>
            </div>
          </div>
        </div>
      )}

      {!semester && (
        <div className="dash-empty-state">
          <div className="dash-empty-icon">📅</div>
          <h3>Không có học kỳ đang diễn ra</h3>
          <p>Hiện tại không có học kỳ nào trong thời gian hoạt động.</p>
        </div>
      )}

      {semester && (
        <div className="dash-main-grid">
          {/* ── PHẦN TRÁI: Danh sách đề thi ── */}
          <div className="dash-panel dash-exam-panel">
            <div className="dash-panel-header">
              <h3>📋 Đề thi kỳ hiện tại</h3>
              <span className="dash-exam-count">{exams.length} đề thi</span>
            </div>

            <div className="dash-tabs">
              {(Object.keys(TAB_LABELS) as TabKey[]).map(key => (
                <button
                  key={key}
                  className={`dash-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  <span className="dash-tab-icon">{TAB_ICONS[key]}</span>
                  {TAB_LABELS[key]}
                  <span className="dash-tab-count">{tabCounts[key]}</span>
                </button>
              ))}
            </div>

            <div className="dash-exam-list">
              {filteredExams.length === 0 ? (
                <div className="dash-exam-empty">
                  <span>🔍</span>
                  <p>Không có đề thi nào trong mục này</p>
                </div>
              ) : (
                filteredExams.map(exam => (
                  <div key={exam.exam_id} className="dash-exam-card">
                    <div className="dash-exam-card-top">
                      <span className={`dash-badge ${STATUS_BADGE[exam.status].cls}`}>
                        {STATUS_BADGE[exam.status].label}
                      </span>
                      <span className="dash-exam-attempts">
                        {exam.attempt_count} lượt thi
                      </span>
                    </div>
                    <h4 className="dash-exam-title">{exam.title}</h4>
                    <div className="dash-exam-meta">
                      <div className="dash-exam-meta-item">
                        <span className="dash-meta-icon">📚</span>
                        {exam.subject_name}
                      </div>
                      <div className="dash-exam-meta-item">
                        <span className="dash-meta-icon">🏫</span>
                        {exam.section_name}
                      </div>
                      <div className="dash-exam-meta-item">
                        <span className="dash-meta-icon">⏱️</span>
                        {exam.duration} phút · {exam.question_count} câu
                      </div>
                    </div>
                    <div className="dash-exam-time">
                      <div>
                        <span className="dash-time-label">Bắt đầu:</span>
                        <span>{formatDateTime(exam.start_time)}</span>
                      </div>
                      <div>
                        <span className="dash-time-label">Kết thúc:</span>
                        <span>{formatDateTime(exam.end_time)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── PHẦN PHẢI: Biểu đồ ── */}
          <div className="dash-charts-col">
            {/* Biểu đồ 1: Phân bố điểm theo môn */}
            <div className="dash-panel dash-chart-panel">
              <div className="dash-panel-header">
                <h3>📊 Phân bố điểm số</h3>
                {subjectNames.length > 0 && (
                  <select
                    className="dash-subject-select"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                  >
                    {subjectNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="dash-chart-container">
                {currentScoreDist.some(b => b.count > 0) ? (
                  <Bar data={scoreChartData} options={scoreChartOptions} />
                ) : (
                  <div className="dash-chart-empty">
                    <span>📉</span>
                    <p>Chưa có dữ liệu điểm số cho môn này</p>
                  </div>
                )}
              </div>
            </div>

            {/* Biểu đồ 2: Đạt/rớt theo môn */}
            <div className="dash-panel dash-chart-panel">
              <div className="dash-panel-header">
                <h3>📈 Tỷ lệ đạt/rớt theo môn</h3>
              </div>
              <div className="dash-chart-container">
                {subjectPF.length > 0 ? (
                  <Bar data={subjectChartData} options={subjectChartOptions} />
                ) : (
                  <div className="dash-chart-empty">
                    <span>📉</span>
                    <p>Chưa có dữ liệu thống kê theo môn</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
