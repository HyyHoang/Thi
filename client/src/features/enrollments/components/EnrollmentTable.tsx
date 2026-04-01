import React from 'react';
import { Enrollment } from '../types';

interface TableProps {
  data: Enrollment[];
  loading: boolean;
  onEdit?: (record: Enrollment) => void;
  onDelete?: (id: string) => void;
  isAdmin: boolean;
}

const EnrollmentTable: React.FC<TableProps> = ({ data, loading, onEdit, onDelete, isAdmin }) => {
  if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 text-left">Mã Đăng Ký</th>
            <th className="border p-2 bg-gray-100 text-left">Lớp Học Phần</th>
            <th className="border p-2 bg-gray-100 text-left">Môn Học</th>
            <th className="border p-2 bg-gray-100 text-left">Sinh Viên</th>
            <th className="border p-2 bg-gray-100 text-left">Ngày Đăng Ký</th>
            <th className="border p-2 bg-gray-100 text-left">Trạng Thái</th>
            {isAdmin && <th className="border p-2 bg-gray-100 text-center">Thao Tác</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="border p-4 text-center text-gray-500">
                Chưa có dữ liệu đăng ký.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.EnrollmentID} className="hover:bg-gray-50 transition-colors">
                <td className="border p-2">{item.EnrollmentID}</td>
                <td className="border p-2">
                  {item.course_section?.SectionName || item.SectionID}
                </td>
                <td className="border p-2">
                  {item.course_section?.Subject?.SubjectName || '-'}
                </td>
                <td className="border p-2">
                  {item.student_profile?.FullName || item.StudentID}
                </td>
                <td className="border p-2">
                  {new Date(item.EnrollDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.Status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.Status === 1 ? 'Đã đăng ký' : 'Đã hủy'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => onEdit?.(item)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete?.(item.EnrollmentID)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EnrollmentTable;
