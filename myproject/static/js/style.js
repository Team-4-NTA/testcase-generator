window.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
window.historyId = null;
let chatIDs = [];

async function saveResponse(screen_name, requirement, result) {
    const chatItem = {
        screen_name: screen_name.trim(),
        requirement: requirement.trim(),
        result: result.trim()
    };

    try {
        const saveResponse = await fetch("/save-history/", {  
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ 
                history_id: historyId,
                chat: chatItem
            })
        });

        if (saveResponse.ok) {
            const responseData = await saveResponse.json();
            historyId = responseData.history_id;
            fetchHistoryList();
        } else {
            alert("Lưu thất bại. Hãy thử lại.");
        }
    } catch (error) {
        console.error("Lỗi khi lưu:", error);
        alert("Có lỗi xảy ra trong quá trình lưu dữ liệu.");
    } finally {
        // loading.classList.add("d-none");
    }
}

function addNewItem() {
    document.getElementById("responses").replaceChildren();
    historyId = null;
    chatIDs = [];
    fetchHistoryList();
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

async function submitForm(event) {
    event.preventDefault();
    const screen_name = document.getElementById("screen_name").value;
    const requirement = document.getElementById("requirement").value;
    // const loading = document.getElementById("loading");

    if (!screen_name || !requirement) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // loading.classList.remove("d-none");

    let randomId = uuidv4();
    document.getElementById("screen_name").value = "";
    document.getElementById("requirement").value = "";

    appendMessage("right", requirement, screen_name, randomId);
    try {
        const response = await fetch("", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ screen_name: screen_name, requirement: requirement })
        });
        // loading.classList.add("d-none");
        if (response.ok) {
            const result = await response.json();
            appendMessage("left", result.test_cases, result.screen_name, randomId);
            saveResponse(screen_name, requirement, result.test_cases, );
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
    } finally {
        // loading.classList.add("d-none");
    }
}

async function fetchHistoryList() {
    const sidebarList = document.getElementById("sidebar-list");
    sidebarList.innerHTML = "";

    try {
        const response = await fetch("/get-history/");
        const histories = await response.json();
        const uniqueHistories = histories.filter(
            (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        );

        uniqueHistories.forEach(history => {
            const listItem = document.createElement("li");
            listItem.className = "mx-2 p-2 rounded-lg hover:bg-stone-200 flex items-center gap-2 group cursor-pointer";
            listItem.id = `history-${history.id}`;
            listItem.onclick = () => loadChats(history.id);

            listItem.innerHTML = `
                <span class="truncate block w-full">
                    ${history.title}
                </span>
                <button 
                    class="opacity-0 group-hover:opacity-100 transition"
                    onclick="deleteHistory(${history.id}, event)">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="#1e2939"
                            d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"
                        />
                    </svg>
                </button>
            `;

            sidebarList.appendChild(listItem);

            if (historyId === history.id) {
                listItem.classList.add("bg-gray-300");
            }
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhật ký:", error);
    }
}

async function loadChats(id) {
    chatIDs = []
    historyId = id;
    fetchHistoryList();
    try {
        const response = await fetch(`/get-chat-list/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            }
        });

        if (response.ok) {
            const chats = await response.json();
            historyId = id;
            displayChats(chats);
        } else {
            alert("Không thể tải lịch sử trò chuyện.");
        }
    } catch (error) {
        console.error("Error fetching chat history:", error);
        alert("Có lỗi xảy ra khi tải lịch sử.");
    }
}

function displayChats(chats) {
    const responsesContainer = document.getElementById("responses"); 

    responsesContainer.innerHTML = '';

    chats.forEach(chat => {
        chatIDs.push(chat.id);
        if ((chat.url_requirement == null || chat.url_requirement == '') && chat.url_result !== "") {
            const url_result = chat.url_result.split("/").pop();
            let fileTitle = "Dưới đây là file testcase đã tạo";
            if (chat.url_result.toLowerCase().includes("spec")) {
                fileTitle = `Template spec của màn hình chức năng "${chat.screen_name}"`;
            } else if (chat.url_result.toLowerCase().includes("api")) {
                 fileTitle = `Template api của màn hình chức năng "${chat.screen_name}"`;
            }
            const msgHTML = `
                <div class="msg-container space-y-[20px]">
                    ${rigthInnerHTML(chat)}
                    <div class="w-full">
                        <div><span class="font-medium text-sm text-black">${fileTitle}</span></div>
                        <div class="w-75 p-2.5 border border-gray-200 rounded-md">
                            <div class="flex items-center gap-2">
                                <img src="static/image/sheets.png" alt="file" class="w-5 h-5">
                                <div class="flex flex-col w-full">
                                <!-- Tên file có thể click để tải -->
                                <a href="${chat.url_result}" 
                                    download 
                                    class="font-medium text-sm truncate text-blue-600 hover:underline">
                                    ${url_result}
                                </a>
                                <span class="text-xs text-gray-500 mt-0.5">Bảng tính</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);
        } else if (chat.url_requirement !== null && chat.url_requirement !== "" && chat.url_result !== null && chat.url_result !== "") {      
            const url_requirement = chat.url_requirement.split("/").pop() ?? "hhhhh";
            const url_result = chat.url_result.split("/").pop();
            const msgHTML = `
                <div class="msg-container space-y-[20px]">
                    <div class="ml-auto max-w-md p-2.5 rounded-lg bg-stone-100 relative">
                        <!-- Thời gian góc phải trên -->
                        <div class="absolute top-1 right-2 text-[11px] text-gray-400">
                            ${formatDate(chat.created_at)}
                        </div>
                        <div class="flex items-center gap-2">
                            <img src="static/image/sheets.png" alt="file" class="w-5 h-5">
                            <div class="flex flex-col w-full">
                                <div class="font-medium text-sm truncate">${url_requirement}</div>
                                <div class="flex justify-between text-xs text-gray-500 mt-0.5">
                                    <span>Bảng tính</span>
                                    <a href="${chat.url_requirement}" 
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
                    <div class="w-full">
                        <div><span class="font-medium text-sm text-black">Dưới đây là file testcase đã tạo</span></div>
                        <div class="w-75 p-2.5 border border-gray-200 rounded-md">
                            <div class="flex items-center gap-2">
                                <img src="static/image/sheets.png" alt="file" class="w-5 h-5">
                                <div class="flex flex-col w-full">
                                <!-- Tên file có thể click để tải -->
                                <a href="${chat.url_result}" 
                                    download 
                                    class="font-medium text-sm truncate text-blue-600 hover:underline">
                                    ${url_result}
                                </a>
                                <span class="text-xs text-gray-500 mt-0.5">Bảng tính</span>
                                </div>
                            </div>
                        </div>
                        </div>
                </div>`;

            document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);
        } else {
            let msgHTML = `
                <div id="msg-container-${chat.id}" class="msg-container space-y-[20px]">
                    ${rigthInnerHTML(chat)}
                    <div class="msg left-msg bg-white">
                        <div>
                            <span class="font-medium text-sm text-black">
                                Testcase của màn hình chức năng "${chat.screen_name}"
                            </span>
                        </div>
                        ${tableInnerHTML(chat.id)}

                        <div class="flex justify-end mt-2">
                            <button 
                                id="export-btn-${chat.id}"
                                class="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-md shadow opacity-50 cursor-not-allowed" 
                                disabled
                            >
                                Export Excel
                            </button>
                        </div>
                    </div>
                </div>
            `;
            responsesContainer.insertAdjacentHTML("beforeend", msgHTML);

            const tableBody = document.getElementById(`testcase-body-${chat.id}`);
            const exportBtn = document.getElementById(`export-btn-${chat.id}`);

            let testCases;

            if (typeof chat.result === "string") {
                try {
                    testCases = JSON.parse(chat.result);
                    console.log("✅ Đã parse JSON thành mảng:", testCases);
                } catch (error) {
                    console.error("❌ Lỗi khi parse JSON:", error);
                    testCases = [];
                }
            } else if (Array.isArray(chat.result)) {
                testCases = chat.result;
                console.log("✅ Result đã là mảng hợp lệ:", testCases);
            } else {
                console.error("❌ Dữ liệu result không hợp lệ:", chat.result);
                testCases = [];
            }

            if (testCases.length > 0) {
                testCases.forEach(row => {
                    let tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="border border-gray-300 px-2 py-1 text-center">${row.id}</td>
                        <td class="border border-gray-300 px-2 py-1 text-center">${row.priority}</td>
                        <td class="border border-gray-300 px-2 py-1">${row.type}</td>
                        <td class="border border-gray-300 px-2 py-1">${row.goal}</td>
                        <td class="border border-gray-300 px-2 py-1">${row.test_data}</td>
                        <td class="border border-gray-300 px-2 py-1">${row.condition}</td>
                        <td class="border border-gray-300 px-2 py-1">${row.steps}</td>
                        <td class="border border-gray-300 px-2 py-1">${row.expected_result}</td>
                        <td class="border border-gray-300 px-2 py-1">${row.note}</td>
                    `;
                    tableBody.appendChild(tr);
                });

                // ✅ Sau khi thêm hết test cases -> bật nút export
                exportBtn.disabled = false;
                exportBtn.classList.remove("opacity-50", "cursor-not-allowed");
                exportBtn.classList.add("hover:bg-green-600");

                exportBtn.onclick = () => exportExcel(chat.result, chat.screen_name);

            } else {
                console.error("❌ Không có test cases để hiển thị.");
            }
        }
        responsesContainer.scrollTop = responsesContainer.scrollHeight;
    });
}

async function appendMessage(side, text, screen_name, id) {
    const responsesContainer = document.getElementById("responses");
    let lastRightId = `msg-container-${id}`;

    if (side === "right") {
        const selected = document.querySelector('input[name="fav_language"]:checked');
        const type = selected ? selected.value : 'spec';
        msgHTML = `<div id="${lastRightId}" class="msg-container space-y-[20px]">
                <div class="ml-auto max-w-md p-2.5 rounded-lg bg-stone-100 relative">
                    <div class="absolute top-1 right-2 text-[11px] text-gray-400">
                        ${formatDate(new Date())}
                    </div>
                    <div class="text-sm text-gray-800 leading-relaxed space-y-1">
                        <div><span class="font-medium text-gray-700">Màn hình chức năng:</span> ${screen_name}</div>
                        <div><span class="font-medium text-gray-700">Yêu cầu:</span> ${text}</div>
                        <div><span class="font-medium text-gray-700">Loại:</span> ${type}</div>
                    </div>
                </div>
            </div>`;
        responsesContainer.insertAdjacentHTML("beforeend", msgHTML);
    } else if (isValidJSON(text)) {
        const container = document.getElementById(lastRightId);
        let testParse = text;
        if (typeof text === "string") {
            try {
                testParse = JSON.parse(text);
                console.log("✅ JSON đã được parse:", testParse);
                console.log("✅ Text:", text);
            } catch (error) {
                console.error("❌ Lỗi parse JSON:", error);
            }
        }      
        if (container) {
            msgHTML = `
                <div class="msg left-msg bg-white">
                    <div><span class="font-medium text-sm text-black">Testcase của màn hình chức năng "${screen_name}"</span></div>
                    ${tableInnerHTML(id)}

                    <div class="flex justify-end mt-2">
                        <button 
                            id="export-btn-${id}"
                            class="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-md shadow opacity-50 cursor-not-allowed" 
                            disabled
                        >
                            Export Excel
                        </button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", msgHTML);
            const tableBody = document.getElementById(`testcase-body-${id}`);
            const exportBtn = document.getElementById(`export-btn-${id}`);

            let index = 0;

            function addRow() {
                if (index < testParse.length) {
                    const row = testParse[index];

                    let tr = document.createElement("tr");
                    tr.innerHTML = `<td class="border border-gray-300 px-2 py-1 text-center"></td>
                    <td class="border border-gray-300 px-2 py-1 text-center"></td>
                    <td class="border border-gray-300 px-2 py-1"></td>
                    <td class="border border-gray-300 px-2 py-1"></td>
                    <td class="border border-gray-300 px-2 py-1"></td>
                    <td class="border border-gray-300 px-2 py-1"></td>
                    <td class="border border-gray-300 px-2 py-1"></td>
                    <td class="border border-gray-300 px-2 py-1"></td>
                    <td class="border border-gray-300 px-2 py-1"></td>`;

                    tableBody.appendChild(tr);

                    const cells = tr.querySelectorAll("td");
                    const values = [
                        row.id, row.priority, row.type, row.goal, 
                        row.test_data, row.condition, row.steps, 
                        row.expected_result, row.note
                    ];
                    cells.forEach((cell, i) => {
                        typeText(cell, values[i]);
                    });

                    index++; 
                    setTimeout(addRow, 1000);
                } else {
                    exportBtn.disabled = false;
                    exportBtn.classList.remove("opacity-50", "cursor-not-allowed");
                    exportBtn.classList.add("hover:bg-green-600");

                    exportBtn.onclick = () => exportExcel(text, screen_name);
                }
            }

            function typeText(element, text, speed = 50) {
                let i = 0;
                function typing() {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                        setTimeout(typing, speed);
                    }
                }
                typing();
            }

            setTimeout(addRow, 1000);     
        } else {
            console.error(`Container với id "${lastRightId}" không tìm thấy.`);
        }
    } else {
        const container = document.getElementById(lastRightId);
        if (container) {
            msgHTML = `
                <div class="msg left-msg">
                    <div class="msg-bubble">
                        <div class="msg-text" id="${id}-bot"></div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", msgHTML);
            document.getElementById(`${id}-bot`).innerText = text;
        } else {
            console.error(`Container with id "${lastRightId}" not found for bot message.`);
        }
    }

    responsesContainer.scrollTop = responsesContainer.scrollHeight;
}

function isValidJSON(text) {
    try {
        const json = JSON.parse(text);
        if (typeof json === "object" && json !== null) {
            return json;
        }
    } catch (error) {
        return false;
    }
    return false;
}

function tableInnerHTML(id) {
  return `
    <div class="msg-text overflow-x-auto">
      <table class="min-w-[1600px] border border-gray-300 text-sm text-left">
        <thead class="bg-gray-100">
          <tr>
            <th class="border border-gray-300 px-2 py-1">Số thứ tự</th>
            <th class="border border-gray-300 px-2 py-1">Độ ưu tiên</th>
            <th class="border border-gray-300 px-2 py-1">Loại</th>
            <th class="border border-gray-300 px-2 py-1">Mục tiêu</th>
            <th class="border border-gray-300 px-2 py-1">Dữ liệu kiểm tra</th>
            <th class="border border-gray-300 px-2 py-1">Điều kiện</th>
            <th class="border border-gray-300 px-2 py-1">Các bước kiểm tra</th>
            <th class="border border-gray-300 px-2 py-1">Kết quả mong đợi</th>
            <th class="border border-gray-300 px-2 py-1">Ghi chú</th>
          </tr>
        </thead>
        <tbody id="testcase-body-${id}">
        </tbody>
      </table>
    </div>`;
}

function rigthInnerHTML(chat) {
    if (chat.url_result && !chat.url_requirement) {
        const type = chat.url_result.includes('_spec') ? 'spec' : 'api';
        return `<div class="ml-auto max-w-md p-2.5 rounded-lg bg-stone-100 relative">
            <div class="absolute top-1 right-2 text-[11px] text-gray-400">
                ${formatDate(chat.created_at)}
            </div>
            <div class="text-sm text-gray-800 leading-relaxed space-y-1">
                <div><span class="font-medium text-gray-700">Màn hình chức năng:</span> ${chat.screen_name}</div>
                <div><span class="font-medium text-gray-700">Yêu cầu:</span> ${chat.requirement}</div>
                <div><span class="font-medium text-gray-700">Loại:</span> ${type}</div>
            </div>
        </div>`;
    }
    return `<div class="ml-auto max-w-md p-2.5 rounded-lg bg-stone-100 relative">
        <div class="absolute top-1 right-2 text-[11px] text-gray-400">
            ${formatDate(chat.created_at)}
        </div>
        <div class="text-sm text-gray-800 leading-relaxed space-y-1"  id="${chat.id}">
            <div><span class="font-medium text-gray-700">Màn hình chức năng:</span> ${chat.screen_name}</div>
            <div><span class="font-medium text-gray-700">Yêu cầu:</span> ${chat.requirement}</div>
        </div>
    </div>`;
}

function loadingInnerHTML() {
    return `<div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 24 24"
        >
            <circle cx="4" cy="12" r="3" fill="#8f8f8f">
            <animate
                id="SVG7x14Dcom"
                fill="freeze"
                attributeName="opacity"
                begin="0;SVGqSjG0dUp.end-0.25s"
                dur="0.75s"
                values="1;.2"
            />
            </circle>
            <circle cx="12" cy="12" r="3" fill="#8f8f8f" opacity=".4">
            <animate
                fill="freeze"
                attributeName="opacity"
                begin="SVG7x14Dcom.begin+0.15s"
                dur="0.75s"
                values="1;.2"
            />
            </circle>
            <circle cx="20" cy="12" r="3" fill="#8f8f8f" opacity=".3">
            <animate
                id="SVGqSjG0dUp"
                fill="freeze"
                attributeName="opacity"
                begin="SVG7x14Dcom.begin+0.3s"
                dur="0.75s"
                values="1;.2"
            />
            </circle>
        </svg>
    </div>`;
}

async function deleteHistory(history_id, event) {
    event.stopPropagation();
    try {
        const response = await fetch(`/delete-history/${history_id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });

        if (response.ok) {
            alert("xóa lịch sử thành công");
            addNewItem();
        } else {
            alert("Lỗi khi xóa lịch sử.");
        }
    } catch (error) {
        console.error("Lỗi khi xóa lịch sử:", error);
    }
}

async function exportExcel(testCase, screen_name) {
    try {
        const response = await fetch("/export-excel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ testCase: testCase, screenName: screen_name })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${screen_name}_testcase.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            alert("Có lỗi xảy ra khi export: " + errorData.error);
        }
    } catch (error) {
        console.error("Error export:", error);
        alert("Có lỗi xảy ra khi export");
    }
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date); // Convert string or number to Date
    }

    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
}

window.onload = function () {
    fetchHistoryList();
};