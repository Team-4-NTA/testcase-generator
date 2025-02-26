function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function handleFileChange(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileName = file.name; // Lấy tên file
        const allowedExtensions = ['xlsx', 'xls'];
        const fileExtension = fileName.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            alert('Vui lòng chọn file Excel (xlsx, xls)!');
            return;
        }

        const msgHTML = `
            <div class="msg-container">
                <div class="msg right-msg">
                    <div class="file-box">
                        <img src="static/image/sheets.png" alt="file">
                        <div>
                            <div class="file-name">${fileName}</div>
                            <div class="file-type">Bảng tính</div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);

        // Gọi hàm upload file nếu file hợp lệ
        uploadExcel(file);
    }
}

async function uploadExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('history_id', window.historyId);
    console.log(window.historyId);

    try {
        const response = await fetch("/upload-template", {
            method: "POST",
            headers: {
                "X-CSRFToken": window.csrfToken
            },
            body: formData
        });
        const result = await response.json();
        text = result.test_cases;
        
        if (!response.ok) {
            let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
            try {
                if (result.message) {
                    errorMessage = result.message; // Lấy lỗi cụ thể từ server
                }
            } catch (jsonError) {
                console.error("Không thể đọc lỗi JSON:", jsonError);
            }
            alert(errorMessage);
            return;
        }
        
        msgHTML = `
            <div class="msg-container">
                <div class="msg left-msg">
                    <div class="file-box">
                        <img src="static/image/sheets.png" alt="file">
                        <div>
                            <div class="file-name">${result.file_name}</div>
                            <div class="file-type">Bảng tính</div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);
    } catch (error) {
        console.error('Error:', error);
        alert(error);
    }
}