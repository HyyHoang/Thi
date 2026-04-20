import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdConstruction } from 'react-icons/md';

export default function ExamResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        border: '1px solid rgba(255,255,255,0.8)',
      }}>
        <MdConstruction size={56} style={{ color: '#8b5cf6', marginBottom: '16px' }} />
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '8px',
        }}>
          Chức năng đang phát triển
        </h2>
        <p style={{
          color: '#64748b',
          fontSize: '0.92rem',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          Trang xem kết quả bài thi (Mã: <strong>{attemptId}</strong>) đang trong quá trình phát triển.
          Tính năng sẽ sớm được hoàn thiện.
        </p>
        <button
          onClick={() => navigate('/student/exams')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(5,150,105,0.25)',
            transition: 'all 0.2s',
          }}
        >
          <MdArrowBack size={16} />
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
}
