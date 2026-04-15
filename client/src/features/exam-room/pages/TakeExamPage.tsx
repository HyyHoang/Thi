import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import studentExamService from '../../../services/studentExamService';
import { useAntiCheat } from '../hooks/useAntiCheat';
import './TakeExamPage.css';

export default function TakeExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Anti-cheat state
  const [violationCount, setViolationCount] = useState(0);
  const [needsFullscreen, setNeedsFullscreen] = useState(false);

  // Refs for tracking timer
  const timerRef = useRef<any>(null);

  useEffect(() => {
    studentExamService.takeExam(examId as string)
      .then((res: any) => {
        setExamData(res.data.exam);
        setQuestions(res.data.questions);
        
        // Setup timer
        const maxTimeSeconds = res.data.exam.duration * 60;
        // Check actual attempt start time if it was saved
        const start = new Date(res.data.attempt.StartTime || res.data.attempt.start_time || new Date()).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        const remaining = Math.max(0, maxTimeSeconds - elapsed);
        
        setTimeLeft(remaining);

        if (res.data.exam.is_fullscreen) {
          setNeedsFullscreen(true);
        }
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Không thể tải đề thi.');
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId]);

  useEffect(() => {
    if (!loading && timeLeft > 0 && !needsFullscreen) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            autoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [loading, timeLeft, needsFullscreen]);

  const handleViolation = (type: 'fullscreen_exit' | 'tab_switch') => {
    const newCount = violationCount + 1;
    setViolationCount(newCount);
    
    if (newCount === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo vi phạm',
        text: 'Bạn đã thoát màn hình làm bài hoặc chuyển sang tab khác. Nếu tiếp tục vi phạm hệ thống sẽ tự động nộp bài!',
        confirmButtonText: 'Tôi đã hiểu',
        allowOutsideClick: false,
        target: document.fullscreenElement || 'body',
      }).then(() => {
        if (examData?.is_fullscreen) requestFullscreen();
      });
    } else if (newCount >= 2) {
      Swal.fire({
        icon: 'error',
        title: 'Đình chỉ thi',
        text: 'Bạn đã vi phạm quy chế thi. Hệ thống sẽ tự động nộp bài ngay lập tức.',
        confirmButtonText: 'Đóng',
        allowOutsideClick: false,
        target: document.fullscreenElement || 'body',
      }).then(() => {
        autoSubmit();
      });
    }
  };

  const { containerRef, requestFullscreen } = useAntiCheat({
    isFullscreen: examData?.is_fullscreen || false,
    isPreventCopy: examData?.is_prevent_copy || false,
    onViolation: handleViolation
  });

  const enterExam = () => {
    requestFullscreen();
    setNeedsFullscreen(false);
  };

  const submitToApi = async (isAuto = false) => {
    try {
      Swal.fire({
        title: 'Đang nộp bài...',
        allowOutsideClick: false,
        target: document.fullscreenElement || 'body',
        didOpen: () => Swal.showLoading()
      });
      const res: any = await studentExamService.submitExam(examId as string, { answers });
      Swal.close();
      if (res.success) {
        Swal.fire({ title: 'Thành công', text: 'Đã nộp bài thành công', icon: 'success', target: document.fullscreenElement || 'body' }).then(() => {
          navigate(`/student`);
        });
      }
    } catch (err) {
      Swal.fire({ title: 'Lỗi', text: 'Có lỗi khi nộp bài. Vui lòng báo cho giáo viên.', icon: 'error', target: document.fullscreenElement || 'body' });
    }
  };

  const handleSubmitScore = () => {
    Swal.fire({
      title: 'Xác nhận nộp bài?',
      text: "Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Có, nộp bài',
      cancelButtonText: 'Chưa',
      target: document.fullscreenElement || 'body',
    }).then((result) => {
      if (result.isConfirmed) {
        submitToApi(false);
      }
    });
  };

  const autoSubmit = () => {
    submitToApi(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div>Đang tải phòng thi...</div>;
  if (error) return <div className="alert error">{error}</div>;

  const currentQ = questions[currentIdx];

  return (
    <div 
      className={`exam-room-container ${examData?.is_prevent_copy ? 'prevent-copy' : ''}`} 
      ref={containerRef}
    >
      {needsFullscreen && (
        <div className="fullscreen-overlay">
          <h2>Bài thi yêu cầu chế độ toàn màn hình</h2>
          <button onClick={enterExam}>Bắt đầu làm bài</button>
        </div>
      )}

      {/* Header */}
      <div className="exam-header">
        <div className="exam-header-left">
          <h2>{examData?.title}</h2>
        </div>
        <div className="exam-header-center">
          ⏱ {formatTime(timeLeft)}
        </div>
        <div className="exam-header-right">
          <button onClick={handleSubmitScore}>Nộp bài</button>
        </div>
      </div>

      {/* Body */}
      <div className="exam-body">
        {/* Navigation Palette */}
        <div className="exam-palette">
          <h3>Danh sách câu hỏi</h3>
          <div className="palette-grid">
            {questions.map((q, idx) => (
              <div 
                key={q.QuestionID}
                onClick={() => setCurrentIdx(idx)}
                className={`palette-item 
                  ${idx === currentIdx ? 'active' : ''} 
                  ${answers[q.QuestionID] ? 'answered' : ''}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Question Viewer */}
        <div className="exam-question-view">
          {currentQ && (
            <>
              <div className="question-number">
                Câu {currentIdx + 1}
                <span className="question-score">{currentQ.Score} điểm</span>
              </div>
              <div 
                className="question-content" 
                dangerouslySetInnerHTML={{ __html: currentQ.Content }}
              />
              <div className="options-list">
                {currentQ.Type === 'essay' ? (
                  <textarea 
                    className="essay-textarea"
                    placeholder="Nhập câu trả lời của bạn ở đây..."
                    value={answers[currentQ.QuestionID] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.QuestionID]: e.target.value }))}
                    style={{ width: '100%', minHeight: '150px', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1.05rem', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                ) : (
                  currentQ.options?.map((opt: any) => (
                    <div 
                      key={opt.OptionID}
                      className={`option-item ${answers[currentQ.QuestionID] === opt.OptionID?.toString() ? 'selected' : ''}`}
                      onClick={() => {
                        setAnswers(prev => ({ ...prev, [currentQ.QuestionID]: opt.OptionID?.toString() }));
                      }}
                    >
                      <div className="option-radio" />
                      <div className="option-content" dangerouslySetInnerHTML={{ __html: opt.Content }} />
                    </div>
                  ))
                )}
              </div>
              <div className="exam-nav-buttons">
                <button 
                  className="nav-btn" 
                  disabled={currentIdx === 0} 
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                >
                  ← Câu trước
                </button>
                <button 
                  className="nav-btn" 
                  disabled={currentIdx === questions.length - 1} 
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                >
                  Câu sau →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
