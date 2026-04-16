import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getPracticeExam } from '../../../services/practiceExamService';
import { MdQuiz, MdAccessTime, MdSend, MdChevronLeft, MdChevronRight, MdCheckCircle, MdError, MdTrendingUp } from 'react-icons/md';
import '../../exam-room/pages/TakeExamPage.css'; // Reuse existing styles

export default function TakePracticeExamPage() {
  const { practiceExamId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [resultSummary, setResultSummary] = useState<any>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [practiceExamId]);

  useEffect(() => {
    if (!loading && timeLeft > 0 && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            calculateResult();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [loading, timeLeft, showResult]);

  function shuffleArray(array: any[]) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async function loadExam() {
    setLoading(true);
    try {
      const res = await getPracticeExam(practiceExamId as string);
      if (res.success) {
        setExam(res.data);
        const rawQuestions = res.data.questions || [];
        const shuffledQuestions = shuffleArray(rawQuestions).map((q: any) => ({
          ...q,
          options: shuffleArray(q.options || [])
        }));
        setQuestions(shuffledQuestions);
        setTimeLeft((res.data.Duration || 60) * 60);
      } else {
        setError('Không thể tải bài thi.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải bài thi.');
    } finally {
      setLoading(false);
    }
  }

  function calculateResult() {
    let correctCount = 0;
    questions.forEach(q => {
      const studentAnswer = answers[q.QuestionID];
      const correctOption = q.options?.find((opt: any) => opt.IsCorrect);
      if (studentAnswer && correctOption && studentAnswer === correctOption.OptionID.toString()) {
        correctCount++;
      }
    });

    const total = questions.length;
    const score = (correctCount / total) * 10;
    
    setResultSummary({
      total,
      correctCount,
      incorrectCount: total - correctCount,
      score: score.toFixed(1)
    });
    setShowResult(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const handleFinish = () => {
    Swal.fire({
      title: 'Xác nhận nộp bài?',
      text: "Bạn có chắc chắn muốn kết thúc bài ôn tập này?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Nộp bài',
      cancelButtonText: 'Làm tiếp',
      confirmButtonColor: '#10b981',
    }).then((result) => {
      if (result.isConfirmed) {
        calculateResult();
      }
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return (
    <div className="stu-exams-loading">
        <div className="stu-spin" />
        Đang tải câu hỏi ôn tập...
    </div>
  );
  
  if (error) return <div className="alert error">{error}</div>;

  if (questions.length === 0) return (
    <div className="alert warning">Bài thi này chưa có câu hỏi nào.</div>
  );

  const currentQ = questions[currentIdx];

  // Result View
  if (showResult) {
    return (
      <div className="practice-result-container" style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', minHeight: '80vh' }}>
        <div className="practice-result-card" style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '24px' }}>
            <MdCheckCircle size={80} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#1e293b' }}>Hoàn thành bài ôn tập!</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Dưới đây là kết quả luyện tập của bạn</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '16px' }}>
               <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>Số câu đúng</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{resultSummary.correctCount} / {resultSummary.total}</div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '16px' }}>
               <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>Điểm số</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{resultSummary.score}</div>
            </div>
          </div>

          <div style={{ textAlign: 'left', background: '#eff6ff', padding: '16px', borderRadius: '12px', marginBottom: '32px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#1e40af', fontWeight: 'bold' }}>
              <MdTrendingUp style={{ marginRight: '8px' }} />
              <span>Đánh giá</span>
            </div>
            <p style={{ color: '#1e40af', marginTop: '4px', fontSize: '0.95rem' }}>
              {parseFloat(resultSummary.score) >= 8 ? 'Tuyệt vời! Bạn đã nắm vững kiến thức môn này.' : 
               parseFloat(resultSummary.score) >= 5 ? 'Khá tốt. Hãy tiếp tục ôn luyện để đạt điểm cao hơn.' : 
               'Cố gắng lên! Bạn cần dành nhiều thời gian hơn để ôn tập kiến thức này.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button 
              className="stu-exam-start-btn" 
              style={{ width: '100%', height: '50px', fontSize: '1.1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
              onClick={() => {
                setShowResult(false);
                setIsReviewMode(true);
                setCurrentIdx(0);
              }}
            >
              Xem lại bài làm
            </button>
            <button 
              className="stu-exam-start-btn active" 
              style={{ width: '100%', height: '50px', fontSize: '1.1rem' }}
              onClick={() => navigate('/student/practice-exams')}
            >
              Quay lại thư viện
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-room-container" style={{ position: 'relative', width: '100%', height: 'auto', background: '#f1f5f9', padding: '0', minHeight: '100vh' }}>
      {/* Body */}
      <div className="exam-body" style={{ 
        display: 'grid', 
        gridTemplateColumns: '320px 1fr', 
        gap: '24px', 
        padding: '24px', 
        width: '100%', 
        boxSizing: 'border-box' 
      }}>
        {/* Left Sidebar: Info & Palette */}
        <div className="exam-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Exam Status Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
            padding: '24px', 
            borderRadius: '24px', 
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', opacity: 0.9 }}>
              <MdQuiz style={{ marginRight: '10px' }} />
              {exam?.Title}
            </h2>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              backdropFilter: 'blur(10px)',
              padding: '16px', 
              borderRadius: '16px', 
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Thời gian còn lại</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '2px' }}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {isReviewMode ? (
              <button 
                onClick={() => navigate('/student/practice-exams')} 
                style={{ 
                  width: '100%',
                  background: 'white', 
                  color: '#64748b', 
                  border: '1px solid #e2e8f0', 
                  padding: '14px', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  fontWeight: '800', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Thoát xem lại
              </button>
            ) : (
              <button 
                onClick={handleFinish} 
                style={{ 
                  width: '100%',
                  background: 'white', 
                  color: '#2563eb', 
                  border: 'none', 
                  padding: '14px', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  fontWeight: '800', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <MdSend style={{ marginRight: '8px' }} />
                Nộp bài ngay
              </button>
            )}
          </div>

          {/* Navigation Palette */}
          <div className="exam-palette" style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: '#64748b', fontWeight: '600' }}>
              Danh sách câu hỏi
            </h3>
            <div className="palette-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {questions.map((q, idx) => (
                <div 
                  key={q.QuestionID}
                  onClick={() => setCurrentIdx(idx)}
                  className={`palette-item ${idx === currentIdx ? 'active' : ''} ${answers[q.QuestionID] ? 'answered' : ''}`}
                  style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      border: '2px solid',
                      borderColor: 
                        idx === currentIdx ? '#3b82f6' : 
                        isReviewMode ? (
                          (() => {
                            const correctOption = q.options?.find((o: any) => o.IsCorrect);
                            const studentAns = answers[q.QuestionID];
                            return studentAns === correctOption?.OptionID?.toString() ? '#10b981' : '#ef4444';
                          })()
                        ) :
                        (answers[q.QuestionID] ? '#dcfce7' : '#f1f5f9'),
                      background: 
                        idx === currentIdx ? '#3b82f6' : 
                        isReviewMode ? (
                          (() => {
                            const correctOption = q.options?.find((o: any) => o.IsCorrect);
                            const studentAns = answers[q.QuestionID];
                            return studentAns === correctOption?.OptionID?.toString() ? '#f0fdf4' : '#fef2f2';
                          })()
                        ) :
                        (answers[q.QuestionID] ? '#f0fdf4' : 'white'),
                      color: 
                        idx === currentIdx ? 'white' : 
                        isReviewMode ? (
                          (() => {
                            const correctOption = q.options?.find((o: any) => o.IsCorrect);
                            const studentAns = answers[q.QuestionID];
                            return studentAns === correctOption?.OptionID?.toString() ? '#10b981' : '#ef4444';
                          })()
                        ) :
                        (answers[q.QuestionID] ? '#10b981' : '#64748b')
                  }}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Viewer */}
        <div className="exam-question-view" style={{ 
          background: 'white', 
          padding: '48px', 
          borderRadius: '32px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {currentQ && (
            <>
              <div className="question-header" style={{ marginBottom: '24px' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Câu {currentIdx + 1} / {questions.length}
                </span>
              </div>
              <div 
                className="question-content" 
                style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '32px', fontWeight: '500', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: currentQ.Content }}
              />
              <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {currentQ.options?.map((opt: any) => {
                  const isCorrect = opt.IsCorrect;
                  const isSelected = answers[currentQ.QuestionID] === opt.OptionID?.toString();
                  
                  let borderColor = '#f1f5f9';
                  let bgColor = 'white';
                  
                  if (isReviewMode) {
                    if (isCorrect) {
                      borderColor = '#10b981';
                      bgColor = '#f0fdf4';
                    } else if (isSelected && !isCorrect) {
                      borderColor = '#ef4444';
                      bgColor = '#fef2f2';
                    }
                  } else if (isSelected) {
                    borderColor = '#3b82f6';
                    bgColor = '#eff6ff';
                  }

                  return (
                    <div 
                      key={opt.OptionID}
                      className={`option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isReviewMode) return;
                        setAnswers(prev => ({ ...prev, [currentQ.QuestionID]: opt.OptionID?.toString() }));
                      }}
                      style={{
                          padding: '16px 24px',
                          borderRadius: '16px',
                          border: '2px solid',
                          borderColor: borderColor,
                          background: bgColor,
                          cursor: isReviewMode ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative'
                      }}
                    >
                      <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSelected ? (isReviewMode ? (isCorrect ? '#10b981' : '#ef4444') : '#3b82f6') : '#cbd5e1',
                          marginRight: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                      }}>
                          {isSelected && (
                              <div style={{ 
                                width: '10px', 
                                height: '10px', 
                                borderRadius: '50%', 
                                background: isReviewMode ? (isCorrect ? '#10b981' : '#ef4444') : '#3b82f6' 
                              }} />
                          )}
                      </div>
                      <div className="option-content" style={{ fontSize: '1.1rem', color: '#334155' }} dangerouslySetInnerHTML={{ __html: opt.Content }} />
                      
                      {isReviewMode && isCorrect && (
                        <div style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MdCheckCircle />
                          <span>Đáp án đúng</span>
                        </div>
                      )}
                      {isReviewMode && isSelected && !isCorrect && (
                        <div style={{ marginLeft: 'auto', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MdError />
                          <span>Bạn đã chọn</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="exam-nav-buttons" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                <button 
                  className="nav-btn" 
                  disabled={currentIdx === 0} 
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: currentIdx === 0 ? '#cbd5e1' : '#64748b', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <MdChevronLeft size={24} />
                  Câu trước
                </button>
                <button 
                  className="nav-btn" 
                  disabled={currentIdx === questions.length - 1} 
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: currentIdx === questions.length - 1 ? '#cbd5e1' : '#64748b', cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer' }}
                >
                  Câu sau
                  <MdChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
