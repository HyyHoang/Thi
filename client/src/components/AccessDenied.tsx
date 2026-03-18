import React from 'react';

interface AccessDeniedProps {
    message?: string;
}

function AccessDenied({ message }: AccessDeniedProps) {
    return (
        <div style={{
            background: '#fff3f3',
            border: '1px solid #f5c2c2',
            color: '#a61b1b',
            padding: '16px',
            borderRadius: '10px',
            maxWidth: '720px',
        }}>
            <strong>Cảnh báo:</strong> {message || 'Bạn không có quyền truy cập trang quản trị'}
        </div>
    );
}

export default AccessDenied;
