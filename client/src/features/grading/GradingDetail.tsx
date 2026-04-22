import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gradingService from '../../services/gradingService';
import { Button } from '../../components/ui/Button';
import { MdChevronLeft, MdSave, MdInfoOutline } from 'react-icons/md';
import MathContent from '../../components/ui/MathContent';

interface EssayAnswer {
  student_answer_id: number;
  question_id: string;
  content: string;
  student_answer: string;
  raw_score: number | null;
  weight: number;
  ai_score?: number | null;
  ai_feedback?: string | null;
}

interface GradingData {
  result_id: number;
  exam_title: string;
  essay_weight: number;
  is_graded: boolean;
  answers: EssayAnswer[];
}

const GradingDetail: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<GradingData | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gradingAI, setGradingAI] = useState<Record<number, boolean>>({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 0;

  const canEdit = useMemo(() => {
    if (!data) return false;
    if (isAdmin) return true;
    return !data.is_graded;
  }, [data, isAdmin]);

  useEffect(() => {
    if (resultId) {
      fetchDetail(resultId);
    }
  }, [resultId]);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await gradingService.getDetail(id);
      if (res.success && res.data) {
        setData(res.data);

        const initialScores: Record<number, number> = {};
        res.data.answers.forEach((a: EssayAnswer) => {
          initialScores[a.student_answer_id] = a.raw_score || 0;
        });
        setScores(initialScores);
      } else {
        setError(res.message || 'Không tìm thấy dữ liệu bài thi.');
      }
    } catch (err: any) {
      console.error('Fetch detail error:', err);
      setError('Không thể tải chi tiết bài thi.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (id: number, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setScores(prev => ({ ...prev, [id]: Math.min(10, Math.max(0, num)) }));
    } else if (val === '') {
      setScores(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const handleTriggerAI = async (answerId: number) => {
    setGradingAI(prev => ({ ...prev, [answerId]: true }));
    try {
      const res = await gradingService.triggerAIGrading(answerId);
      if (res.success && res.data) {
        // Update local data with AI result
        setData(prev => {
          if (!prev) return prev;
          const updatedAnswers = prev.answers.map(ans =>
            ans.student_answer_id === answerId
              ? { ...ans, ai_score: res.data.ai_score, ai_feedback: res.data.ai_feedback }
              : ans
          );
          return { ...prev, answers: updatedAnswers };
        });

        // Suggest score directly if empty
        if (scores[answerId] === 0 || !scores[answerId]) {
          setScores(prev => ({ ...prev, [answerId]: res.data.ai_score }));
        }
      } else {
        alert(res.message || 'Lỗi khi gọi AI.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi gọi AI.');
    } finally {
      setGradingAI(prev => ({ ...prev, [answerId]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!resultId) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = Object.entries(scores).map(([id, score]) => ({
        id: parseInt(id),
        score: score
      }));

      const res = await gradingService.submitGrade(resultId, payload);
      if (res.success) {
        alert('Chấm bài thành công!');
        navigate('/admin/grading');
      } else {
        throw new Error(res.message || 'Lỗi khi lưu điểm.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi lưu điểm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu chấm bài...</div>;
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy bài thi.</div>;

  return (
    <div className="grading-detail">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/grading')}>
          <MdChevronLeft size={24} /> Quay lại
        </Button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Chấm điểm: {data.exam_title}</h2>
      </div>

      {error && <div className="alert error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {data.answers.map((ans, idx) => (
            <div key={ans.student_answer_id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>Nội dung câu hỏi:</h4>
                  <div style={{ padding: '1rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                    <MathContent content={ans.content} />
                  </div>

                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Bài làm của sinh viên:
                  </h4>
                  <div style={{
                    padding: '1.25rem',
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    minHeight: '120px',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {ans.student_answer ? <MathContent content={ans.student_answer} /> : <i>(Không có câu trả lời)</i>}
                  </div>

                  {ans.ai_feedback && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MdInfoOutline size={18} /> Phản hồi từ AI:
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                        {ans.ai_feedback.split('\n').filter(line => line.trim()).map((line, i) => (
                          <div key={i} style={{ marginBottom: i !== ans.ai_feedback.split('\n').length - 1 ? '4px' : 0 }}>
                            {line.trim().startsWith('-') ? line : `- ${line}`}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>Điểm AI đề xuất: {ans.ai_score} / 10</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px dotted var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '15px'
              }}>
                <div style={{ flex: 1 }}>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTriggerAI(ans.student_answer_id)}
                      isLoading={gradingAI[ans.student_answer_id]}
                      disabled={gradingAI[ans.student_answer_id]}
                    >
                      ✨ Gọi AI Chấm Điểm
                    </Button>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Tỷ lệ trong tự luận</span>
                  <strong style={{ color: 'var(--color-primary)' }}>{ans.weight}%</strong>
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ margin: 0 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Điểm (0-10)</span>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={10}
                      value={scores[ans.student_answer_id] ?? ''}
                      onChange={e => handleScoreChange(ans.student_answer_id, e.target.value)}
                      disabled={!canEdit}
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        padding: '0.5rem',
                        width: '100px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: !canEdit ? 'var(--bg-card-hover)' : 'white'
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Thông tin tổng kết</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Số câu tự luận:</span>
              <strong>{data.answers.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trọng số tự luận:</span>
              <strong>{data.essay_weight} điểm</strong>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(79,70,229,0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(79,70,229,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                <MdInfoOutline size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Công thức tính điểm</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                Điểm tự luận = Σ ((Điểm câu / 10) * (%) * Trọng số).
              </p>
            </div>

            {!canEdit && (
              <div className="alert info" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdInfoOutline size={20} />
                <span style={{ fontSize: '0.85rem' }}>Bạn đang xem bài thi đã chấm. Chỉ Admin mới có quyền sửa đổi điểm sau khi đã hoàn tất.</span>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              size="lg"
              style={{ marginTop: '1rem' }}
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={!canEdit}
            >
              <MdSave size={20} style={{ marginRight: '8px' }} /> {data.is_graded ? 'Cập nhật điểm' : 'Hoàn tất chấm bài'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingDetail;
