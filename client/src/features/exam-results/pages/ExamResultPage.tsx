import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MdCheckCircle, MdArrowBack, MdScore } from 'react-icons/md';
import studentExamService from '../../../services/studentExamService';
import './ExamResultPage.css';

export default function ExamResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Để cho nhanh, chúng ta lấy thông tin bài thi đã hoàn thành từ list exams
    studentExamService.getMyExams().then((res: any) => {
      const exams = res.data || [];
      const foundExam = exams.find((e: any) => e.attempt?.attempt_id?.toString() === attemptId);
      if (foundExam && foundExam.attempt?.score !== undefined) {
        setResult({
          score: foundExam.attempt.score,
          correct_answers: foundExam.attempt.correct_answers,
          total_questions: foundExam.question_count,
          working_time: foundExam.attempt.working_time,
          exam_title: foundExam.title
        });
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [attemptId]);

  if (loading) {
    return <div className="result-loading">Đang tải kết quả...</div>;
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0 phút';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  return (
    <div className="exam-result-container">
      <div className="exam-result-card">
        <MdCheckCircle className="result-icon-success" />
        <h2>Nộp bài thành công!</h2>
        
        {result ? (
          <div className="result-details">
            <h3 className="result-exam-title">{result.exam_title}</h3>
            
            <div className="result-score-box">
              <span className="score-value">{result.score.toFixed(1)}</span>
              <span className="score-unit">Điểm / 10</span>
            </div>

            <div className="result-stats">
              <div className="result-stat-item">
                <span className="stat-label">Số câu đúng</span>
                <span className="stat-value">{result.correct_answers} / {result.total_questions}</span>
              </div>
              <div className="result-stat-item">
                <span className="stat-label">Thời gian làm bài</span>
                <span className="stat-value">{formatTime(result.working_time)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="result-not-found">Chưa có kết quả hoặc đang chờ chấm điểm.</p>
        )}

        <button className="back-btn" onClick={() => navigate('/student/exams')}>
          <MdArrowBack /> Quay lại danh sách bài thi
        </button>
      </div>
    </div>
  );
}
