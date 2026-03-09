II. User Flow Chi Tiết Từng Bước
1. Truy cập trang quản trị
Quản trị viên truy cập hệ thống và đăng nhập bằng tài khoản quản trị.
Hệ thống kiểm tra thông tin đăng nhập.
Trường hợp 1: Sai thông tin
Hệ thống hiển thị thông báo lỗi và yêu cầu đăng nhập lại.

Trường hợp 2: Đúng thông tin
Hệ thống kiểm tra quyền truy cập.
Nếu người dùng có role quản trị:
→ Chuyển đến Dashboard quản trị.
Nếu không có quyền quản trị:
→ Hệ thống từ chối truy cập trang quản trị.

2. Truy cập danh mục quản lý loại đề thi
Tại Dashboard quản trị, hệ thống hiển thị các danh mục quản lý.
Quản trị viên chọn:
Quản lý loại đề thi (Test Categories)
Hệ thống chuyển đến trang danh sách loại đề thi.

3. Hiển thị danh sách loại đề thi
Hệ thống truy vấn dữ liệu từ bảng test_categories.
Sau đó hiển thị danh sách loại đề thi.
Thông tin hiển thị gồm:
•	Tên loại đề thi
•	Mô tả
•	Thao tác
Các thao tác có thể thực hiện:
•	Xem
•	Chỉnh sửa
•	Xóa
Ngoài ra trang có nút:
Thêm loại đề thi

4. Thêm loại đề thi
Quản trị viên nhấn:
Thêm loại đề thi
Hệ thống hiển thị form nhập thông tin.
Các trường cần nhập:
•	Tên loại đề thi
•	Mô tả
Quản trị viên nhập thông tin và nhấn Lưu.
Hệ thống thực hiện:
•	Kiểm tra dữ liệu hợp lệ
•	Lưu dữ liệu vào bảng test_categories
Sau khi lưu thành công:
→ Hệ thống hiển thị thông báo thêm thành công
→ Cập nhật lại danh sách loại đề thi.

5. Chỉnh sửa loại đề thi
Quản trị viên chọn Chỉnh sửa tại một loại đề thi.
Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại.
Quản trị viên có thể thay đổi:
•	Tên loại đề thi
•	Mô tả
Sau khi chỉnh sửa, quản trị viên nhấn Lưu.
Hệ thống thực hiện:
•	Kiểm tra dữ liệu hợp lệ
•	Cập nhật dữ liệu trong bảng test_categories
Sau khi cập nhật thành công:
→ Hệ thống hiển thị thông báo cập nhật thành công
→ Cập nhật lại danh sách loại đề thi.

6. Xóa loại đề thi
Quản trị viên chọn Xóa tại một loại đề thi.
Hệ thống hiển thị hộp thoại xác nhận.
Quản trị viên xác nhận xóa.
Hệ thống thực hiện:
•	Kiểm tra xem loại đề thi có đang được sử dụng trong bảng tests hay không.
Trường hợp 1: Loại đề đang được sử dụng
Hệ thống không cho phép xóa.
Hiển thị thông báo rằng loại đề đang được sử dụng.

Trường hợp 2: Không được sử dụng
Hệ thống xóa dữ liệu trong bảng test_categories.
Sau khi xóa thành công:
→ Hệ thống cập nhật lại danh sách loại đề thi.
