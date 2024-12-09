(function () {
    let clickCount = 0; // Biến đếm số lần click

    function createFloatingButton() {
        // Tạo nút bấm
        const btn = document.createElement("button");
        btn.id = "floating-mm-btn";
        btn.textContent = "Search Mathemafia";

        // Style cho nút bấm
        btn.style.position = "fixed";
        btn.style.bottom = "20px";
        btn.style.right = "20px";
        btn.style.padding = "10px 15px";
        btn.style.backgroundColor = "#4CAF50"; // Màu nền xanh lá
        btn.style.color = "white"; // Chữ màu trắng
        btn.style.border = "none"; // Không có viền
        btn.style.borderRadius = "5px"; // Góc bo tròn
        btn.style.cursor = "pointer"; // Con trỏ chuột dạng pointer
        btn.style.zIndex = "1000"; // Đảm bảo nút hiển thị trên các thành phần khác

        // Thêm nút vào DOM
        document.body.appendChild(btn);
    }

    function attachButtonEvent() {
        // Lấy nút vừa tạo bằng ID
        const btn = document.getElementById("floating-mm-btn");

        // Gắn sự kiện onclick
        btn.addEventListener("click", async function () {
            if (clickCount === 2) {
                // Nếu click lần thứ 3, quay lại trang trước đó
                window.history.back();
                clickCount = 0; // Đặt lại biến đếm
                return; // Kết thúc hàm
            }

            try {
                // Xác định API dựa trên số lần click
                const url = clickCount === 0 
                    ? "http://localhost:5000" 
                    : "http://localhost:5000/readall";

                // Gửi yêu cầu đến API
                const response = await fetch(url, {
                    method: "GET", // Phương thức GET
                });

                // Kiểm tra kết quả
                if (response.ok) {
                    const data = await response.json(); // Parse JSON nếu cần
                    console.log("Response from API:", data);
                    alert("API Response from " + url + ": " + JSON.stringify(data));
                } else {
                    console.error("API request failed with status:", response.status);
                    alert("API request failed. Check console for details.");
                }
            } catch (error) {
                console.error("Error while calling API:", error);
                alert("Error while calling API. Check console for details.");
            }

            // Tăng biến đếm sau mỗi lần click
            clickCount++;
            console.log(clickCount)
        });
    }

    // Gọi các hàm đã định nghĩa
    createFloatingButton();
    attachButtonEvent();
})();
