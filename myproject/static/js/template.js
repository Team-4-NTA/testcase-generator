async function createTemplate() {
    const screen_name = document.getElementById("screen_name").value;
    const requirement = document.getElementById("requirement").value;
    const selected = document.querySelector('input[name="fav_language"]:checked');

    if (!screen_name || !selected) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    let randomId = uuidv4();
    document.getElementById("screen_name").value = "";
    document.getElementById("requirement").value = "";

    document.querySelectorAll('.checkbox-group .form-check-input').forEach(checkbox => {
        checkbox.checked = false;
    });
    appendTemplate("right", requirement, screen_name, randomId, selected.value);
    try {
        const response = await fetch("generate-template", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ screen_name: screen_name, requirement: requirement, type: selected.value, history_id: window.historyId })
        });
        if (response.ok) {
            const result = await response.json();

            const randomId = Date.now();

            // Hiển thị bảng Spec
            appendTemplate("left", result, result.screen_name, randomId, selected.value);
        } else {
            switch (response.status) {
            case 401:
                console.error("❌ 401 Unauthorized: API key không hợp lệ hoặc chưa cấu hình.");
                appendMessage("left", "API key không hợp lệ hoặc chưa cấu hình.", "System", randomId);
                break;
            case 400:
                console.error("❌ 400 Bad Request: Yêu cầu không hợp lệ.");
                appendMessage("left", "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu gửi lên.", "System", randomId);
                break;
            case 429:
                console.error("❌ 429 Too Many Requests: Vượt quá giới hạn sử dụng API.");
                appendMessage("left", "Bạn đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau.", "System", randomId);
                break;
            case 503:
                console.error("❌ 503 Service Unavailable: OpenAI đang gặp sự cố.");
                appendMessage("left", "Dịch vụ OpenAI hiện đang gặp sự cố. Vui lòng thử lại sau.", "System", randomId);
                break;
            case 500:
                console.error("❌ 500 Internal Server Error");
                appendMessage("left", "Hệ thống gặp lỗi nội bộ. Vui lòng thử lại sau.", "System", randomId);
                break;
            default:
                console.error(`❌ Lỗi ${response.status}: ${response.statusText}`);
                appendMessage("left", `Lỗi ${response.status}: ${response.statusText}`, "System", randomId);
            }
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra trong quá trình gửi dữ liệu.");
    }
}

async function appendTemplate(side, data, screen_name, id, type = null) {
    const responsesContainer = document.getElementById("responses");
    let lastRightId = `msg-container-${id}`;

    if (side === "left" && data) {
        const container = document.createElement("div");
        container.id = lastRightId;
        container.classList.add("msg-container");
        const loadingEl = document.getElementById("loading-spinner");
        if (loadingEl) {
        loadingEl.remove();
        }

        container.innerHTML = `
        <div class="w-full">
            <div><span class="font-medium text-sm text-black">Template ${type} của màn hình chức năng "${screen_name}"</span></div>
            <div class="w-75 p-2.5 border border-gray-200 rounded-md">
                <div class="flex items-center gap-2">
                    <img src="static/image/sheets.png" alt="file" class="w-5 h-5">
                    <div class="flex flex-col w-full">
                        <!-- Tên file có thể click để tải -->
                        <a href="${data.file_url}" 
                            download 
                            class="font-medium text-sm truncate text-blue-600 hover:underline">
                            ${data.file_name}
                        </a>
                        <span class="text-xs text-gray-500 mt-0.5">Bảng tính</span>
                    </div>
                </div>
            </div>
        </div>`;
        responsesContainer.appendChild(container);
    } else {
        const container = document.createElement("div");
        container.id = lastRightId;
        container.classList.add("msg-container");
        container.classList.add("space-y-[20px]");

        container.innerHTML =`
            <div class="ml-auto max-w-md p-2.5 rounded-lg bg-stone-100 relative">
                <div class="absolute top-1 right-2 text-[11px] text-gray-400">
                    ${formatDate(new Date())}
                </div>
                <div class="text-sm text-gray-800 leading-relaxed space-y-1" id="${id}">
                    <div><span class="font-medium text-gray-700">Màn hình chức năng:</span> ${screen_name}</div>
                    <div><span class="font-medium text-gray-700">Yêu cầu:</span> ${data}</div>
                    <div><span class="font-medium text-gray-700">Loại:</span> ${type}</div>
                </div>
            </div>`;
        responsesContainer.appendChild(container);
        responsesContainer.insertAdjacentHTML("beforeend", loadingInnerHTML());
    }

    responsesContainer.scrollTop = responsesContainer.scrollHeight;
}

// Kiểm tra JSON hợp lệ
function isValidJSON(text) {
    try {
        const json = JSON.parse(text);
        return typeof json === "object" && json !== null;
    } catch (error) {
        return false;
    }
}

function renderMetaList(meta) {
    let html = `<ul class="list-group">`;
    for (const [key, value] of Object.entries(meta)) {
        html += `<li class="list-group-item"><strong>${key}:</strong> ${value}</li>`;
    }
    html += `</ul>`;
    return html;
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
}