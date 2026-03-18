1. react

Component là khối giao diện nhỏ có thể tái sử dụng.
Trong React, mọi thứ đều là component: NavbarSidebar, Button, Form, Card

➡️ Sau đó các component được ghép lại để tạo thành trang web.



State = dữ liệu của ứng dụng tại một thời điểm
Quản lý state = quản lý dữ liệu của app (lưu, sửa, lấy)

store = trung tâm dữ liệu

reducer = cách dữ liệu thay đổi

dispatch = gửi yêu cầu thay đổi

RootState = kiểu toàn bộ state

AppDispatch = kiểu dispatch

Hook	Dùng để làm gì
useState	Lưu state
useEffect	Chạy sau render
useCallback	Ghi nhớ function
useMemo	Ghi nhớ giá trị
useRef	Lưu giá trị không render
useAppSelector → 📥 LẤY dữ liệu

useAppDispatch → 📤 SỬA dữ liệu


Slice = nơi quản lý state + xử lý logic + kết nối API của 1 module
Slice = nơi lưu dữ liệu

Selector = nơi lấy dữ liệu

Component = nơi hiển thị dữ liệu