import { useState, useEffect } from 'react';
import {
  MdQuiz,
  MdMenuBook,
  MdAccessTime,
  MdHelpOutline,
  MdPlayArrow,
  MdLock,
  MdFullscreen,
  MdContentCopy,
  MdCalendarToday,
} from 'react-icons/md';
import studentExamService from '../../../services/studentExamService';
import { StudentExam } from '../../../types';
import './StudentExamList.css';

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return { text: 'Đang diễn ra', icon: <span className="stu-pulse" /> };
    case 'upcoming':
      return { text: 'Chưa mở', icon: null };
    case 'expired':
      return { text: 'Đã kết thúc', icon: null };
    case 'completed':
      return { text: 'Đã hoàn thành', icon: null };
    default:
      return { text: status, icon: null };
  }
}

export default function StudentExamList() {
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [semesterInfo, setSemesterInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Password modal state
  const [pwModal, setPwModal] = useState<{ open: boolean; examId: string; title: string }>({
    open: false,
    examId: '',
    title: '',
  });
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoading(true);
    setError(null);
    try {
      const res = await studentExamService.getMyExams() as any;
      setExams(res.data || []);
      setSemesterInfo(res.semester || null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách bài thi.');
    } finally {
      setLoading(false);
    }
  }

  function handleStartExam(exam: StudentExam) {
    if (exam.password_enabled) {
      setPwModal({ open: true, examId: exam.exam_id, title: exam.title });
      setPwInput('');
      setPwError('');
    } else {
      // Navigate to take exam (placeholder for now)
      alert(`Chức năng làm bài thi "${exam.title}" đang được phát triển.`);
    }
  }

  function handlePwConfirm() {
    if (!pwInput.trim()) {
      setPwError('Vui lòng nhập mật khẩu.');
      return;
    }
    // Placeholder - in future will call API to verify password & start exam
    alert(`Chức năng làm bài thi "${pwModal.title}" đang được phát triển.`);
    setPwModal({ open: false, examId: '', title: '' });
  }

  return (
    <div className="stu-exams">
      {/* Header */}
      <div className="stu-exams-header">
        <h2>📝 Làm bài thi</h2>
        <p className="stu-exams-subtitle">
          Danh sách các bài thi thuộc lớp học phần bạn đã đăng ký trong kỳ hiện tại
        </p>
        {semesterInfo && (
          <div className="stu-semester-badge">
            <MdCalendarToday size={14} />
            {semesterInfo.semester_name} — {semesterInfo.academic_year}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="stu-exams-loading">
          <div className="stu-spin" />
          Đang tải danh sách bài thi...
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
          <h3>Chưa có bài thi nào</h3>
          <p>Hiện tại không có bài thi nào trong các lớp học phần bạn đã đăng ký ở kỳ học hiện tại.</p>
        </div>
      )}

      {/* Exam Cards */}
      {!loading && exams.length > 0 && (
        <div className="stu-exam-grid">
          {exams.map((exam) => {
            const statusInfo = getStatusLabel(exam.status);
            return (
              <div key={exam.exam_id} className="stu-exam-card">
                {/* Top accent bar */}
                <div className={`stu-exam-card-bar ${exam.status}`} />

                <div className="stu-exam-card-body">
                  {/* Title */}
                  <h3 className="stu-exam-title">
                    <MdQuiz className="stu-exam-title-icon" />
                    <span>{exam.title}</span>
                  </h3>

                  {/* Meta */}
                  <div className="stu-exam-meta">
                    <div className="stu-exam-meta-row">
                      <MdMenuBook className="stu-exam-meta-icon" />
                      <span className="stu-exam-meta-label">Môn học</span>
                      <span className="stu-exam-meta-value">{exam.subject_name || '—'}</span>
                    </div>
                    <div className="stu-exam-meta-row">
                      <MdAccessTime className="stu-exam-meta-icon" />
                      <span className="stu-exam-meta-label">Thời lượng</span>
                      <span className="stu-exam-meta-value">{exam.duration} phút</span>
                    </div>
                    <div className="stu-exam-meta-row">
                      <MdHelpOutline className="stu-exam-meta-icon" />
                      <span className="stu-exam-meta-label">Số câu</span>
                      <span className="stu-exam-meta-value">{exam.question_count} câu</span>
                    </div>
                    <div className="stu-exam-meta-row">
                      <MdCalendarToday className="stu-exam-meta-icon" />
                      <span className="stu-exam-meta-label">Bắt đầu</span>
                      <span className="stu-exam-meta-value">{formatDateTime(exam.start_time)}</span>
                    </div>
                    <div className="stu-exam-meta-row">
                      <MdCalendarToday className="stu-exam-meta-icon" />
                      <span className="stu-exam-meta-label">Kết thúc</span>
                      <span className="stu-exam-meta-value">{formatDateTime(exam.end_time)}</span>
                    </div>
                  </div>

                  {/* Security badges */}
                  <div className="stu-exam-badges">
                    {exam.is_fullscreen && (
                      <span className="stu-exam-badge fullscreen">
                        <MdFullscreen size={13} /> Toàn màn hình
                      </span>
                    )}
                    {exam.is_prevent_copy && (
                      <span className="stu-exam-badge no-copy">
                        <MdContentCopy size={12} /> Chống copy
                      </span>
                    )}
                    {exam.password_enabled && (
                      <span className="stu-exam-badge has-password">
                        <MdLock size={12} /> Có mật khẩu
                      </span>
                    )}
                  </div>

                  {/* Footer: Status + Action */}
                  <div className="stu-exam-card-footer">
                    <span className={`stu-exam-status ${exam.status}`}>
                      {statusInfo.icon}
                      {statusInfo.text}
                    </span>

                    {exam.status === 'active' && (
                      <button
                        className="stu-exam-start-btn active"
                        onClick={() => handleStartExam(exam)}
                      >
                        <MdPlayArrow size={18} />
                        Bắt đầu làm bài
                      </button>
                    )}

                    {exam.status === 'upcoming' && (
                      <button className="stu-exam-start-btn" disabled>
                        <MdAccessTime size={16} />
                        Chưa đến thời gian
                      </button>
                    )}

                    {exam.status === 'expired' && (
                      <button className="stu-exam-start-btn" disabled>
                        Đã hết hạn
                      </button>
                    )}

                    {exam.status === 'completed' && exam.attempt?.score !== undefined && (
                      <div className="stu-exam-score">
                        <span className="stu-exam-score-value">
                          {exam.attempt.score.toFixed(1)}
                        </span>
                        <span className="stu-exam-score-label">điểm</span>
                      </div>
                    )}

                    {exam.status === 'completed' && exam.attempt?.score === undefined && (
                      <button className="stu-exam-start-btn" disabled>
                        Đã nộp bài
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Password Modal */}
      {pwModal.open && (
        <div className="stu-pw-overlay" onClick={() => setPwModal({ open: false, examId: '', title: '' })}>
          <div className="stu-pw-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Nhập mật khẩu bài thi</h3>
            <p>Bài thi <strong>"{pwModal.title}"</strong> yêu cầu mật khẩu để bắt đầu.</p>
            <input
              type="password"
              className="stu-pw-input"
              placeholder="Nhập mật khẩu..."
              value={pwInput}
              onChange={(e) => {
                setPwInput(e.target.value);
                setPwError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePwConfirm()}
              autoFocus
            />
            <div className="stu-pw-error">{pwError}</div>
            <div className="stu-pw-actions">
              <button
                className="stu-pw-cancel"
                onClick={() => setPwModal({ open: false, examId: '', title: '' })}
              >
                Hủy
              </button>
              <button className="stu-pw-confirm" onClick={handlePwConfirm}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
