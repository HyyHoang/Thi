import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdSearch, 
  MdHistory, 
  MdEmojiEvents, 
  MdAccessTime, 
  MdEventNote,
  MdMenuBook,
  MdBarChart,
  MdVisibility,
  MdChevronRight
} from 'react-icons/md';
import studentExamService from '../../../services/studentExamService';
import './ExamHistory.css';

interface ExamAttempt {
  attempt_id: string;
  exam_id: string;
  exam_title: string;
  subject_name: string;
  semester: string;
  start_time: string;
  submit_time: string | null;
  status: 'submitted' | 'in_progress' | 'expired';
  score: number | null;
  correct: number | null;
  total: number | null;
  duration: number;
  working_time: number | null;
  is_graded: boolean | null;
  essay_weight: number;
}

export default function ExamHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    completed: 0,
    bestScore: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await studentExamService.getExamHistory() as any;
      if (res.success) {
        const data = res.data || [];
        setHistory(data);
        
        // Calculate stats
        const completedAttempts = data.filter((a: any) => a.status === 'submitted' && a.score !== null);
        const totalCompleted = completedAttempts.length;
        const avg = totalCompleted > 0 
          ? completedAttempts.reduce((acc: number, curr: any) => acc + curr.score, 0) / totalCompleted 
          : 0;
        const best = totalCompleted > 0 
          ? Math.max(...completedAttempts.map((a: any) => a.score)) 
          : 0;

        setStats({
          total: data.length,
          avgScore: Number(avg.toFixed(2)),
          completed: totalCompleted,
          bestScore: Number(best.toFixed ? best.toFixed(2) : best)
        });
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter(item => 
    item.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Hoàn thành';
      case 'in_progress': return 'Đang làm';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  return (
    <div className="history-container">
      <header className="history-header">
        <h2><MdHistory style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Lịch sử làm bài</h2>
        <p>Xem lại kết quả và quá trình làm bài thi của bạn</p>
      </header>

      {/* Stats Section */}
      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-icon blue"><MdEventNote /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng lượt thi</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><MdEmojiEvents /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.bestScore}</span>
            <span className="stat-label">Điểm cao nhất</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><MdBarChart /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.avgScore}</span>
            <span className="stat-label">Điểm trung bình</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><MdAccessTime /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Bài đã nộp</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="history-controls">
        <div className="search-wrapper">
          <MdSearch className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo tên bài thi hoặc môn học..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="history-list">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton-card" />)
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div key={item.attempt_id} className="history-card">
              <div className="history-card-main">
                <div className="subject-icon-box">
                  <MdMenuBook size={24} />
                </div>
                <div className="exam-info">
                  <h3>{item.exam_title}</h3>
                  <div className="exam-meta">
                    <div className="meta-item">
                      <MdMenuBook size={14} /> {item.subject_name}
                    </div>
                    <div className="meta-item">
                      <MdEventNote size={14} /> {item.semester}
                    </div>
                    <div className="meta-item">
                      <MdAccessTime size={14} /> {formatDate(item.start_time)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="history-card-right">
                <div className="score-display">
                  {item.essay_weight > 0 && !item.is_graded ? (
                    <span className="status-badge pending" style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#d97706',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      ⏳ Chờ chấm
                    </span>
                  ) : item.score !== null ? (
                    <>
                      <span className="score-value">{item.score.toFixed(2)}</span>
                      <span className="score-label">Điểm</span>
                    </>
                  ) : (
                    <span className={`status-badge ${item.status}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  )}
                </div>

                {item.status === 'submitted' ? (
                  <button 
                    className="view-btn"
                    onClick={() => navigate(`/student/exams/${item.attempt_id}/result`)}
                  >
                    <MdVisibility /> Xem chi tiết
                  </button>
                ) : (
                  <MdChevronRight size={24} color="#cbd5e1" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="history-empty">
            <span className="empty-icon">📭</span>
            <div className="empty-text">
              <h3>Không tìm thấy lịch sử nào</h3>
              <p>{searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Bạn chưa tham gia bài thi nào.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
