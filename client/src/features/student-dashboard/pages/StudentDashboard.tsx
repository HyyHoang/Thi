import { useState, useEffect } from 'react';
import { MdQuiz, MdCheckCircle, MdAccessTime, MdSchool } from 'react-icons/md';
import studentExamService from '../../../services/studentExamService';
import { StudentExam } from '../../../types';
import Calendar from '../components/Calendar';
import WeatherWidget from '../components/WeatherWidget';
import './StudentDashboard.css';

/* ── StudentDashboard ── */
export default function StudentDashboard() {
  const today = new Date();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    studentExamService.getMyExams()
      .then((res: any) => {
        setExams(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingExams(false));
  }, []);

  const activeCount = exams.filter(e => e.status === 'active').length;
  const upcomingCount = exams.filter(e => e.status === 'upcoming').length;
  const completedCount = exams.filter(e => e.status === 'completed').length;
  const totalCount = exams.length;

  return (
    <div className="stu-dash">
      <div className="stu-dash-top">
        <div className="stu-dash-greeting">
          <h2>Trang chủ sinh viên</h2>
          <p className="stu-dash-welcome">
            Xin chào, <strong>{user.FullName || user.username || user.email || 'Sinh viên'}</strong>! 👋
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stu-dash-stats">
        <div className="stu-stat-card">
          <div className="stu-stat-icon emerald">
            <MdQuiz />
          </div>
          <div className="stu-stat-info">
            <span className="stu-stat-value">{loadingExams ? '...' : activeCount}</span>
            <span className="stu-stat-label">Bài thi đang diễn ra</span>
          </div>
        </div>

        <div className="stu-stat-card">
          <div className="stu-stat-icon sky">
            <MdAccessTime />
          </div>
          <div className="stu-stat-info">
            <span className="stu-stat-value">{loadingExams ? '...' : upcomingCount}</span>
            <span className="stu-stat-label">Bài thi sắp tới</span>
          </div>
        </div>

        <div className="stu-stat-card">
          <div className="stu-stat-icon amber">
            <MdCheckCircle />
          </div>
          <div className="stu-stat-info">
            <span className="stu-stat-value">{loadingExams ? '...' : completedCount}</span>
            <span className="stu-stat-label">Đã hoàn thành</span>
          </div>
        </div>

        <div className="stu-stat-card">
          <div className="stu-stat-icon violet">
            <MdSchool />
          </div>
          <div className="stu-stat-info">
            <span className="stu-stat-value">{loadingExams ? '...' : totalCount}</span>
            <span className="stu-stat-label">Tổng bài thi</span>
          </div>
        </div>
      </div>

      {/* Calendar + Weather */}
      <div className="stu-dash-widgets">
        <div className="stu-dash-widget">
          <Calendar today={today} />
        </div>
        <div className="stu-dash-widget">
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
}
