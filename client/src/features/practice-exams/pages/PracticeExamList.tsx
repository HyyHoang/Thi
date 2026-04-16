import { useState, useEffect } from 'react';
import { MdQuiz, MdMenuBook, MdAccessTime, MdCalendarToday, MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getPracticeExams, PracticeExam } from '../../../services/practiceExamService';
import './PracticeExamList.css';

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PracticeExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPracticeExams();
      setExams(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách bài thi ôn tập.');
    } finally {
      setLoading(false);
    }
  }

  function handleStartExam(exam: PracticeExam) {
    navigate(`/student/practice-exams/${exam.PracticeExamID}/take`);
  }

  return (
    <div className="stu-exams">
      {/* Header */}
      <div className="stu-exams-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>📝 Thư viện đề thi chung (Ôn tập)</h2>
          <p className="stu-exams-subtitle">
            Danh sách các bài thi tự do do sinh viên đóng góp để luyện tập
          </p>
        </div>
        <button 
          className="stu-exam-start-btn active" 
          style={{ width: 'auto', padding: '0 20px', height: '40px' }}
          onClick={() => navigate('/student/practice-exams/create')}
        >
          <MdAdd size={20} style={{ marginRight: '8px' }} />
          Tạo mới đề thi
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="stu-exams-loading">
          <div className="stu-spin" />
          Đang tải danh sách đề thi ôn tập...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert error">
          ⚠️ {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && exams.length === 0 && (
        <div className="stu-exams-empty">
          <div className="stu-exams-empty-icon">📋</div>
          <h3>Chưa có bài thi ôn tập nào</h3>
          <p>Hãy là người đầu tiên tạo bài thi ôn tập!</p>
        </div>
      )}

      {/* Exam Cards */}
      {!loading && exams.length > 0 && (
        <div className="stu-exam-grid">
          {exams.map((exam) => (
            <div key={exam.PracticeExamID} className="stu-exam-card">
              <div className={`stu-exam-card-bar active`} />
              <div className="stu-exam-card-body">
                {/* Title */}
                <h3 className="stu-exam-title">
                  <MdQuiz className="stu-exam-title-icon" />
                  <span>{exam.Title}</span>
                </h3>

                {/* Meta */}
                <div className="stu-exam-meta">
                  <div className="stu-exam-meta-row">
                    <MdMenuBook className="stu-exam-meta-icon" />
                    <span className="stu-exam-meta-label">Môn học</span>
                    <span className="stu-exam-meta-value">{exam.subject?.SubjectName || '—'}</span>
                  </div>
                  <div className="stu-exam-meta-row">
                    <MdAccessTime className="stu-exam-meta-icon" />
                    <span className="stu-exam-meta-label">Thời lượng</span>
                    <span className="stu-exam-meta-value">{exam.Duration} phút</span>
                  </div>
                  <div className="stu-exam-meta-row">
                    <MdCalendarToday className="stu-exam-meta-icon" />
                    <span className="stu-exam-meta-label">Ngày tạo</span>
                    <span className="stu-exam-meta-value">{formatDateTime(exam.created_at)}</span>
                  </div>
                  <div className="stu-exam-meta-row">
                    <span className="stu-exam-meta-label">Người tạo</span>
                    <span className="stu-exam-meta-value">{exam.student_profile?.FullName || exam.user?.Username || '—'}</span>
                  </div>
                </div>

                <div className="stu-exam-card-footer">
                  <button
                    className="stu-exam-start-btn active"
                    onClick={() => handleStartExam(exam)}
                  >
                    Bắt đầu luyện tập
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
