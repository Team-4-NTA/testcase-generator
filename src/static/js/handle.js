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
            <div class="ml-auto max-w-md p-2.5 rounded-lg bg-stone-100 relative">
                <!-- Thời gian góc phải trên -->
                <div class="absolute top-1 right-2 text-[11px] text-gray-400">
                    ${formatDate(new Date())}
                </div>
                <div class="flex items-center gap-2">
                    <img src="static/image/sheets.png" alt="file" class="w-5 h-5">
                    <div class="flex flex-col w-full">
                        <div class="font-medium text-sm truncate">${fileName}</div>
                        <div class="flex justify-between text-xs text-gray-500 mt-0.5">
                            <span>Bảng tính</span>
                            <a href="" 
                            download 
                            class="flex items-center gap-1 text-blue-600 hover:underline">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor"
                                    class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
                                </svg>
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;


        document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);
        document.getElementById("responses").insertAdjacentHTML("beforeend", loadingInnerHTML());
        setLoadingState(true);
        // Gọi hàm upload file nếu file hợp lệ
        uploadExcel(file);
    }
}

async function uploadExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('history_id', window.historyId);

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
        const loadingEl = document.getElementById("loading-spinner");
        if (loadingEl) {
            loadingEl.remove();
            setLoadingState(false);
        }
        msgHTML = `
            <div class="w-full">
                <div><span class="font-medium text-sm text-black">Dưới đây là file testcase đã tạo</span></div>
                <div class="w-75 p-2.5 border border-gray-200 rounded-md">
                    <div class="flex items-center gap-2">
                        <img src="static/image/sheets.png" alt="file" class="w-5 h-5">
                        <div class="flex flex-col w-full">
                        <!-- Tên file có thể click để tải -->
                        <a href="${result.file_path_testcase}" 
                            download 
                            class="font-medium text-sm truncate text-blue-600 hover:underline">
                            ${result.file_name}
                        </a>
                        <span class="text-xs text-gray-500 mt-0.5">Bảng tính</span>
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