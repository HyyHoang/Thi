Admin truy cập Trang quản trị hệ thống → Admin đăng nhập bằng tài khoản quản trị → Hệ thống kiểm tra thông tin đăng nhập.
Trường hợp sai thông tin đăng nhập 
→ Hệ thống hiển thị thông báo lỗi đăng nhập và yêu cầu Admin nhập lại thông tin tài khoản.
Trường hợp đúng thông tin đăng nhập 
→ Hệ thống xác thực quyền truy cập của người dùng → Nếu người dùng có quyền quản trị → Hệ thống chuyển đến Dashboard quản trị 
→ Nếu người dùng không có quyền quản trị → Hệ thống từ chối truy cập trang quản trị.
Tại Dashboard quản trị, hệ thống hiển thị các danh mục quản lý → Admin chọn Quản lý bộ đề thi 
→ Hệ thống truy vấn dữ liệu từ bảng tests và bảng test_categories để lấy thông tin bộ đề → Sau đó hiển thị danh sách bộ đề thi trong hệ thống.

Danh sách bộ đề hiển thị các thông tin gồm:
• ID bộ đề
• Tên bộ đề
• Loại đề thi
• Thời gian làm bài
• Tổng số câu hỏi
• Trạng thái bộ đề
• Người tạo bộ đề
• Thời gian tạo
Tại trang này Admin có thể thực hiện các thao tác xem chi tiết bộ đề, thêm bộ đề mới, chỉnh sửa bộ đề hoặc xóa bộ đề.

Trường hợp 1: Thêm bộ đề thi
Admin chọn Thêm bộ đề → Hệ thống hiển thị form nhập thông tin bộ đề.
Các trường thông tin cần nhập gồm:
• Tên bộ đề (title)
• Loại đề thi (category_id)
• Mô tả bộ đề (description)
• Thời gian làm bài (duration)
• Tổng số câu hỏi (total_questions)
• Trạng thái bộ đề (status)
Sau khi nhập đầy đủ thông tin → Admin nhấn Lưu bộ đề → Hệ thống kiểm tra tính hợp lệ của dữ liệu.
Trường hợp dữ liệu không hợp lệ → Hệ thống hiển thị thông báo lỗi nhập liệu và yêu cầu Admin nhập lại thông tin.
Trường hợp dữ liệu hợp lệ → Hệ thống lưu dữ liệu vào bảng tests → Đồng thời lưu created_by là ID của Admin tạo bộ đề và created_at là thời gian tạo.
Sau khi lưu thành công → Hệ thống hiển thị thông báo thêm bộ đề thành công → Sau đó cập nhật lại danh sách bộ đề.

Trường hợp 2: Chỉnh sửa bộ đề thi
Admin chọn Chỉnh sửa tại một bộ đề trong danh sách → Hệ thống truy vấn dữ liệu của bộ đề từ bảng tests → Sau đó hiển thị form chỉnh sửa thông tin bộ đề.
Admin có thể chỉnh sửa các thông tin:
• Tên bộ đề
• Loại đề thi
• Mô tả
• Thời gian làm bài
• Tổng số câu hỏi
• Trạng thái bộ đề
Sau khi chỉnh sửa → Admin nhấn Cập nhật bộ đề → Hệ thống kiểm tra tính hợp lệ của dữ liệu.
Trường hợp dữ liệu không hợp lệ → Hệ thống hiển thị thông báo lỗi nhập liệu.
Trường hợp dữ liệu hợp lệ → Hệ thống cập nhật dữ liệu trong bảng tests.
Sau khi cập nhật thành công → Hệ thống hiển thị thông báo cập nhật bộ đề thành công → Sau đó cập nhật lại danh sách bộ đề.

Trường hợp 3: Xóa bộ đề thi
Admin chọn Xóa bộ đề tại một bộ đề trong danh sách → Hệ thống hiển thị hộp thoại xác nhận xóa bộ đề với thông báo “Bạn có chắc muốn xóa bộ đề này không?”.
Trường hợp Admin chọn Không → Hệ thống hủy thao tác xóa và giữ nguyên dữ liệu.
Trường hợp Admin chọn Có → Hệ thống kiểm tra xem bộ đề có đang được sử dụng trong bảng attempts hay không.
Nếu bộ đề đang được người dùng làm bài → Hệ thống không cho phép xóa và hiển thị thông báo bộ đề đang được sử dụng.
Nếu bộ đề chưa được sử dụng → Hệ thống xóa dữ liệu khỏi bảng tests.
Sau khi xóa thành công → Hệ thống hiển thị thông báo xóa bộ đề thành công → Sau đó cập nhật lại danh sách bộ đề trên hệ thống.
