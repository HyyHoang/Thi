import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dashboardService from '../../../services/dashboardService';
import './StudentDashboard.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface StudentExamItem {
  exam_id: string;
  title: string;
  subject_name: string;
  section_name: string;
  start_time: string | null;
  end_time: string | null;
  duration: number;
  question_count: number;
  status: 'past' | 'ongoing' | 'upcoming';
  is_done: boolean;
}

interface StudentStats {
  progress: {
    total: number;
    completed: number;
    percent: number;
  };
  answer_stats: Array<{
    subject_name: string;
    correct: number;
    incorrect: number;
    unanswered: number;
  }>;
  overview: {
    avg_score: number;
    total_questions: number;
  };
}

type TabKey = 'past' | 'ongoing' | 'upcoming';

const TAB_LABELS: Record<TabKey, string> = {
  past: 'Đã kết thúc',
  ongoing: 'Đang diễn ra',
  upcoming: 'Sắp tới',
};

const TAB_ICONS: Record<TabKey, string> = {
  past: '⌛',
  ongoing: '⚡',
  upcoming: '🗓️',
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

export default function StudentDashboard() {
  const [user] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  });

  const [semester, setSemester] = useState<any>(null);
  const [exams, setExams] = useState<StudentExamItem[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('ongoing');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [examRes, statsRes]: any = await Promise.all([
          dashboardService.getStudentExams(),
          dashboardService.getStudentStats(),
        ]);
        setSemester(examRes.data?.semester || null);
        setExams(examRes.data?.exams || []);
        setStats(statsRes.data || null);
        
        const ansStats = statsRes.data?.answer_stats || [];
        if (ansStats.length > 0) setSelectedSubject(ansStats[0].subject_name);
      } catch (err) {
        console.error('Student dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-select tab
  useEffect(() => {
    if (exams.length === 0) return;
    const ongoing = exams.filter(e => e.status === 'ongoing');
    if (ongoing.length > 0) setActiveTab('ongoing');
    else if (exams.filter(e => e.status === 'upcoming').length > 0) setActiveTab('upcoming');
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

  // ── Chart 1: Đúng/Sai/Trống ──
  const currentAnswerStat = useMemo(() => {
    return stats?.answer_stats.find(s => s.subject_name === selectedSubject);
  }, [stats, selectedSubject]);

  const answerChartData = useMemo(() => ({
    labels: ['Đúng', 'Sai', 'Bỏ trống'],
    datasets: [{
      label: 'Số câu',
      data: currentAnswerStat ? [currentAnswerStat.correct, currentAnswerStat.incorrect, currentAnswerStat.unanswered] : [0,0,0],
      backgroundColor: ['#22c55e', '#ef4444', '#94a3b8'],
      borderRadius: 8,
    }]
  }), [currentAnswerStat]);

  const answerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 600 as const },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  // ── Chart 2: Tiến độ hoàn thành ──
  const progressChartData = useMemo(() => ({
    labels: ['Đã hoàn thành', 'Chưa hoàn thành'],
    datasets: [{
      label: 'Bài thi',
      data: stats ? [stats.progress.completed, stats.progress.total - stats.progress.completed] : [0, 1],
      backgroundColor: ['#6366f1', '#e2e8f0'],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  }), [stats]);

  return (
    <div className="stu-dash">
      <div className="dash-header">
        <div className="dash-greeting">
          <h2>Bảng điều khiển sinh viên</h2>
          <p className="dash-welcome">
            Chúc bạn một ngày học tập hiệu quả, <strong>{user.FullName || user.username || 'Sinh viên'}</strong>! ✨
          </p>
        </div>
        {semester && (
          <div className="dash-semester-badge">
            <span className="dash-semester-icon">🏛️</span>
            <div>
              <div className="dash-semester-name">{semester.semester_name}</div>
              <div className="dash-semester-year">{semester.academic_year}</div>
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div className="dash-overview">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>✍️</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{stats.progress.completed}/{stats.progress.total}</div>
              <div className="dash-stat-label">Bài thi đã làm</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>🎯</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{stats.progress.percent}%</div>
              <div className="dash-stat-label">Tiến độ kỳ này</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>⭐</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{stats.overview.avg_score}</div>
              <div className="dash-stat-label">Điểm trung bình</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>📖</div>
            <div className="dash-stat-info">
              <div className="dash-stat-value">{stats.overview.total_questions}</div>
              <div className="dash-stat-label">Tổng câu đã làm</div>
            </div>
          </div>
        </div>
      )}

      <div className="dash-main-grid">
        {/* Panel Trái: Danh sách bài thi */}
        <div className="dash-panel dash-exam-panel">
          <div className="dash-panel-header">
            <h3>📖 Bài thi của tôi</h3>
            <span className="dash-exam-count">{exams.length} bài thi</span>
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
                <p>Không có bài thi nào trong mục này</p>
              </div>
            ) : (
              filteredExams.map(exam => (
                <div key={exam.exam_id} className={`dash-exam-card ${exam.is_done ? 'done' : ''}`}>
                  <div className="dash-exam-card-top">
                    <span className={`status-badge ${exam.status}`}>
                      {exam.is_done ? '✓ Đã nộp bài' : (exam.status === 'ongoing' ? 'Đang diễn ra' : (exam.status === 'past' ? 'Đã hết hạn' : 'Chưa mở'))}
                    </span>
                    <span className="exam-duration">{exam.duration} phút</span>
                  </div>
                  <h4 className="exam-title">{exam.title}</h4>
                  <div className="exam-info">
                    <p><span>📚</span> {exam.subject_name}</p>
                    <p><span>🏫</span> {exam.section_name}</p>
                  </div>
                  <div className="exam-time-info">
                    <small>Bắt đầu: {formatDateTime(exam.start_time)}</small>
                    <small>Kết thúc: {formatDateTime(exam.end_time)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel Phải: Biểu đồ */}
        <div className="dash-charts-col">
          <div className="dash-panel chart-panel">
            <div className="dash-panel-header">
              <h3>📊 Tỷ lệ Đúng / Sai / Bỏ trống</h3>
              {stats && stats.answer_stats.length > 0 && (
                <select 
                  className="subject-select"
                  value={selectedSubject} 
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  {stats.answer_stats.map(s => (
                    <option key={s.subject_name} value={s.subject_name}>{s.subject_name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="chart-container">
              {currentAnswerStat ? (
                <Bar data={answerChartData} options={answerChartOptions} />
              ) : (
                <div className="chart-empty">Chưa có dữ liệu bài làm</div>
              )}
            </div>
          </div>

          <div className="dash-panel chart-panel">
            <div className="dash-panel-header">
              <h3>📈 Tiến độ hoàn thành kỳ học</h3>
            </div>
            <div className="chart-container">
               <div className="progress-flex">
                  <div className="progress-info">
                    <div className="progress-big-val">{stats?.progress.percent}%</div>
                    <p>Bạn đã hoàn thành {stats?.progress.completed} trên tổng số {stats?.progress.total} bài thi của học kỳ này.</p>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${stats?.progress.percent}%` }}></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
