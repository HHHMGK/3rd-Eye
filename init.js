(function () {
    let clickCount = 0; // Biến đếm số lần click

    function createFloatingButton() {
        const button = document.createElement('button');
        button.className = 'floating-button';
        button.id = 'floating-mm-btn';
        document.body.appendChild(button);
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
                    ? "http://localhost:5000/process" 
                    : "http://localhost:5000/readall";

                // Dữ liệu gửi đi trong trường hợp POST
                const requestData = { message: "Hello API" };

                // Gửi yêu cầu đến API
                const response = await fetch(url, {
                    method: "POST", // Phương thức POST
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
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
