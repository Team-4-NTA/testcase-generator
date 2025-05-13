window.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
window.historyId = null;
let chatIDs = [];

document.getElementById('toggleSidebar').addEventListener('click', function() {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    var mainContent = document.querySelector('main');
    if (sidebar.classList.contains('collapsed')) {
        mainContent.style.width = '100%';
    } else {
        if (window.innerWidth > 1200) { 
            mainContent.style.width = '80%';
        } else {
            mainContent.style.width = '70%';
        } 
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const textarea = document.getElementById("requirement");

    textarea.addEventListener("input", function() {
        this.style.height = "auto"; // Reset height trước khi đo
        this.style.height = this.scrollHeight + "px"; // Cập nhật chiều cao theo nội dung
    });
});

function toggleCheckbox(selected) {
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        if (checkbox !== selected) {
            checkbox.checked = false;
        }
    });
}

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
        loading.classList.add("d-none");
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

async function submitForm() {
    const screen_name = document.getElementById("screen_name").value;
    const requirement = document.getElementById("requirement").value;
    const loading = document.getElementById("loading");

    if (!screen_name || !requirement) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    loading.classList.remove("d-none");

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
        loading.classList.add("d-none");
        if (response.ok) {
            const result = await response.json();
            appendMessage("left", result.test_cases, result.screen_name, randomId);
            saveResponse(screen_name, requirement, result.test_cases, );
        } else {
            if (response.status === 500) {
                console.error("❌ Lỗi 500: Internal Server Error");
                appendMessage("left", "Hệ thống gặp lỗi nội bộ. Vui lòng thử lại sau.", "System", randomId);
            } else {
                console.error(`❌ Lỗi ${response.status}: ${response.statusText}`);
                appendMessage("left", `Lỗi ${response.status}: ${response.statusText}`, "System", randomId);
            }
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra trong quá trình gửi dữ liệu.");
    } finally {
        loading.classList.add("d-none");
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
            listItem.className = "nav-item histories";
            listItem.innerHTML = `
                <div id="history-${history.id}" 
                    class="history-item d-flex justify-content-between align-items-center px-3" 
                    onclick="loadChats(${history.id})", style="padding: 8px;">
                    <p class="mb-0 text-left flex-grow-1">${history.title}</p>
                    <button class="btn btn-danger btn-sm ms-2" onclick="deleteHistory(${history.id}, event)">Xóa</button>
                </div>
            `;
            sidebarList.appendChild(listItem);
            if (historyId === history.id) {
                listItem.style.background = "gray";
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
            const msgHTML = `
                <div class="msg-container">
                    ${rigthInnerHTML(chat)}
                </div>
                <div class="msg-container">
                    <div class="msg left-msg">
                        <div class="file-box">
                            <img src="static/image/sheets.png" alt="file">
                            <div>
                                <div class="file-name">${url_result}</div>
                                <div class="d-flex justify-content-between">
                                    <div class="file-type">Bảng tính</div>
                                    <div class="download-link">
                                       <a href="${chat.url_result}" download>
                                            <i class="fas fa-download"></i> Download
                                        </a>
                                    </div>
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
                <div class="msg-container">
                    <div class="msg right-msg">
                        <div class="file-box">
                            <img src="static/image/sheets.png" alt="file">
                            <div>
                                <div class="file-name">${url_requirement}</div>
                                    <div class="d-flex justify-content-between">
                                        <div class="file-type">Bảng tính</div>
                                        <div class="download-link">
                                        <a href="${chat.url_requirement}" download>
                                            <i class="fas fa-download"></i> Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="msg-container">
                    <div class="msg left-msg">
                        <div class="file-box">
                            <img src="static/image/sheets.png" alt="file">
                            <div>
                                <div class="file-name">${url_result}</div>
                                <div class="d-flex justify-content-between">
                                    <div class="file-type">Bảng tính</div>
                                    <div class="download-link">
                                       <a href="${chat.url_result}" download>
                                            <i class="fas fa-download"></i> Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);
        } else {
            let msgHTML = `
                <div id="msg-container-${chat.id}" class="msg-container">
                    ${rigthInnerHTML(chat.created_at, chat.id, chat.requirement, chat.screen_name)}
                    <div class="msg left-msg">
                        <div class="msg-bubble">
                            <div class="msg-info">
                                <div class="msg-info-name">bot</div>
                                <div class="msg-info-time">${formatDate(chat.created_at)}</div>
                            </div>
                            ${tableInnerHTML(chat.id)}
                            <div class="d-flex justify-content-end mt-2">
                                <button class="btn btn-success" onclick="exportExcel('${chat.id}','${chat.screen_name}')">Export Excel</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            responsesContainer.insertAdjacentHTML("beforeend", msgHTML);
            const tableBody = document.getElementById(`testcase-body-${chat.id}`);

            let testCases;

            if (typeof chat.result === "string") {``
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
                        <td>${row.id}</td>
                        <td>${row.priority}</td>
                        <td>${row.type}</td>
                        <td>${row.goal}</td>
                        <td>${row.test_data}</td>
                        <td>${row.condition}</td>
                        <td>${row.steps}</td>
                        <td>${row.expected_result}</td>
                        <td>${row.note}</td>
                    `;
                    tableBody.appendChild(tr);
                });
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
        msgHTML = `
            <div id="${lastRightId}" class="msg-container">
                ${rigthInnerHTML(new Date(), id, text, screen_name)}
            </div> 
        `;
        responsesContainer.insertAdjacentHTML("beforeend", msgHTML);
    } else if (isValidJSON(text)) {
        const container = document.getElementById(lastRightId);
        if (typeof text === "string") {
            try {
                text = JSON.parse(text);
                console.log("✅ JSON đã được parse:", text);
            } catch (error) {
                console.error("❌ Lỗi parse JSON:", error);
            }
        }      
        if (container) {
            msgHTML = `
                <div class="msg left-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${screen_name}</div>
                            <div class="msg-info-time">${new Date().toLocaleTimeString()}</div>
                        </div>
                        ${tableInnerHTML(id)}
                        <div class="d-flex justify-content-end mt-2">
                            <button class="btn btn-success" onclick="exportExcel('${id}','${screen_name}')">Export Excel</button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", msgHTML);
            const tableBody = document.getElementById(`testcase-body-${id}`);

            let index = 0;

            function addRow() {
                if (index < text.length) {
                    const row = text[index];

                    let tr = document.createElement("tr");
                    tr.innerHTML = `<td></td><td></td><td></td><td></td><td></td><td></td><td></td></td><td></td><td></td>`;

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
            console.error(`Container với id "${lastRightId}" không tìm tiIhấy.`);
        }
    } else {
        const container = document.getElementById(lastRightId);
        if (container) {
            msgHTML = `
                <div class="msg left-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">bot</div>
                            <div class="msg-info-time">${formatDate(new Date())}</div>
                        </div>
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
    return `<div class="msg-text">
        <table class="table table-bordered" style="width: 1600px;">
            <thead>
                <tr>
                    <th>Số thứ tự</th>
                    <th>Độ ưu tiên</th>
                    <th>Loại</th>
                    <th>Mục tiêu</th>
                    <th>Dữ liệu kiểm tra</th>
                    <th>Điều kiện</th>
                    <th>Các bước kiểm tra</th>
                    <th>Kết quả mong đợi</th>
                    <th>Ghi chú</th>
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
        return `<div class="msg right-msg">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">user</div>
                    <div class="msg-info-time">${formatDate(chat.created_at)}</div>
                </div>
                <div class="msg-text" id="${chat.id}">
                    <strong>Màn hình chức năng:</strong> ${chat.screen_name}<br>
                    <strong>Yêu cầu:</strong> ${chat.requirement}<br>
                    <strong>Loại:</strong> ${type}
                </div>
            </div>
        </div>`;
    }
    return `<div class="msg right-msg">
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">user</div>
                <div class="msg-info-time">${formatDate(chat.created_at)}</div>
            </div>
            <div class="msg-text" id="${chat.id}">
                <strong>Màn hình chức năng:</strong> ${chat.screen_name}<br>
                <strong>Yêu cầu:</strong> ${chat.requirement}
            </div>
        </div>
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

async function exportExcel(id, screen_name) {
    const testCase = document.getElementById(`${id}-bot`).innerText;

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