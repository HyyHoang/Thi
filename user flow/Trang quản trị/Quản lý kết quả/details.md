II. User Flow Chi Tiết Từng Bước
Admin truy cập Trang quản trị hệ thống 
→ Admin đăng nhập bằng tài khoản quản trị → Hệ thống kiểm tra thông tin đăng nhập.
Trường hợp sai thông tin đăng nhập 
→ Hệ thống hiển thị thông báo lỗi đăng nhập và yêu cầu Admin nhập lại thông tin tài khoản.
Trường hợp đúng thông tin đăng nhập → Hệ thống xác thực quyền truy cập của người dùng → Nếu người dùng có quyền quản trị (Admin)
→ Hệ thống chuyển đến Dashboard quản trị → Nếu người dùng không có quyền quản trị → Hệ thống từ chối truy cập trang quản trị.
Tại Dashboard quản trị, hệ thống hiển thị các danh mục quản lý của hệ thống 
→ Admin chọn Quản lý kết quả làm bài → Hệ thống truy vấn dữ liệu từ bảng results kết hợp với bảng attempts để lấy thông tin kết quả bài thi của người dùng 
→ Sau đó hệ thống hiển thị danh sách kết quả bài thi.
Thông tin kết quả hiển thị trên danh sách gồm: ID kết quả, ID lần làm bài, Total Score, Listening Score, Reading Score, Writing Score, Speaking Score, Band Score, số câu trả lời đúng và thời gian tạo kết quả 
→ Tại trang này Admin có thể thực hiện các thao tác xem chi tiết kết quả, tìm kiếm kết quả hoặc xóa kết quả.

Trường hợp 1: Xem chi tiết kết quả
Admin chọn Xem chi tiết tại một kết quả trong danh sách 
→ Hệ thống truy vấn dữ liệu chi tiết từ bảng results dựa theo result_id 
→ Sau đó hệ thống hiển thị trang chi tiết kết quả bài thi của người dùng 
→ Thông tin hiển thị gồm Total Score, Listening Score, Reading Score, Writing Score, Speaking Score, Band Score, số câu trả lời đúng và thời gian hoàn thành bài thi
→ Sau khi xem xong, Admin có thể quay lại danh sách kết quả để tiếp tục quản lý các kết quả khác.

Trường hợp 2: Tìm kiếm kết quả
Admin nhập ID kết quả hoặc ID lần làm bài vào ô tìm kiếm
→ Sau đó nhấn Tìm kiếm 
→ Hệ thống truy vấn dữ liệu trong bảng results theo điều kiện tìm kiếm 
→ Nếu không tìm thấy dữ liệu phù hợp → Hệ thống hiển thị thông báo không có kết quả phù hợp 
→ Nếu tìm thấy dữ liệu → Hệ thống hiển thị danh sách các kết quả thỏa điều kiện tìm kiếm để Admin có thể tiếp tục xem chi tiết hoặc quản lý kết quả.

Trường hợp 3: Xóa kết quả
Admin chọn Xóa kết quả tại một bản ghi trong danh sách
→ Hệ thống hiển thị hộp thoại xác nhận xóa kết quả với thông báo “Bạn có chắc muốn xóa kết quả này không?” 
→ Nếu Admin chọn Không → Hệ thống hủy thao tác xóa và giữ nguyên dữ liệu
→ Nếu Admin chọn Có → Hệ thống thực hiện xóa dữ liệu khỏi bảng results 
→ Sau khi xóa thành công → Hệ thống hiển thị thông báo xóa kết quả thành công và cập nhật lại danh sách kết quả trên hệ thống.
