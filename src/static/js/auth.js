window.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
let emailReset = "";

async function login(event) {
    event.preventDefault();

    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value.trim();
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const emailError = document.getElementById("error-email");
    const passwordError = document.getElementById("error-password");

    // Reset lỗi
    emailError.textContent = "";
    emailError.classList.add("hidden");
    passwordError.textContent = "";
    passwordError.classList.add("hidden");

    let hasError = false;

    if (email === "") {
        emailError.textContent = "Vui lòng nhập email của bạn.";
        emailError.classList.remove("hidden");
        hasError = true;
    }

    if (password === "") {
        passwordError.textContent = "Vui lòng nhập mật khẩu.";
        passwordError.classList.remove("hidden");
        hasError = true;
    }

    if (hasError) return;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRFToken": csrftoken,
        },
        body: new URLSearchParams({
            email: email,
            password: password,
        }),
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('loginSuccess', 'Đăng nhập thành công!');
        window.location.href = "/";
    } else {
        showAlert('error', data.message);
    }
}

async function resetPassword(event) {
    event.preventDefault();

    const password = document.getElementById("password");
    const passwordComfirm = document.getElementById("password-comfirm");
    const errPw = document.getElementById("error-password");
    const errPwComfirm = document.getElementById("error-password-comfirm");
    const url = document.getElementById("resetUrl").value;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const rules = {
        required: true,
        minLength: 8,
        minLengthMsg: "Mật khẩu phải từ 8 ký tự trở lên",
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/,
        patternMsg:
            "Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng",
    };

    // Reset lỗi
    [errPw, errPwComfirm].forEach(el => el.classList.add("hidden"));

    const validate = (value) => {
        if (rules.required && !value) return "Vui lòng nhập mật khẩu";
        if (value.length < rules.minLength) return rules.minLengthMsg;
        if (!rules.pattern.test(value)) return rules.patternMsg;
        return "";
    };

    let pwError = validate(password.value.trim());
    let confirmError =
        password.value.trim() !== passwordComfirm.value.trim()
            ? "Mật khẩu nhập lại không khớp."
            : "";

    if (pwError || confirmError) {
        if (pwError) {
            errPw.textContent = pwError;
            errPw.classList.remove("hidden");
        }
        if (confirmError) {
            errPwComfirm.textContent = confirmError;
            errPwComfirm.classList.remove("hidden");
        }
        return;
    }

    // Gửi request
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify({
                password: password.value.trim(),
                passwordComfirm: passwordComfirm.value.trim(),
            }),
        });

        const data = await response.json();
        showAlert(response.ok ? "success" : "error", data.message);
        if (response.ok) setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err) {
        console.error(err);
        showAlert("error", "Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const messagesDiv = document.getElementById("django-messages");
    if (!messagesDiv) return;

    const messages = messagesDiv.querySelectorAll(".django-msg");
    messages.forEach(msg => {
        const text = msg.textContent.trim();
        const type = msg.dataset.tag || "info";

        // Chỉ xử lý message có tag "activation"
        if (type.includes("activation")) {
            if (type.includes("success")) {
                showAlert("success", text);
            } else if (type.includes("error")) {
                showAlert("error", text);
            }
        }

        msg.remove();
    });
});

async function register(event) {
    event.preventDefault();
    const firstname = document.getElementById("register-firstname").value.trim();
    const lastname = document.getElementById("register-lastname").value.trim();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    // Danh sách trường và thông báo lỗi cơ bản
    const fields = [
        {
            id: "firstname",
            name: "Họ",
            required: true,
            pattern: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
            patternMsg: "Họ chỉ chứa chữ và khoảng trắng, từ 2-50 ký tự"
        },
        {
            id: "lastname",
            name: "Tên",
            required: true,
            pattern: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
            patternMsg: "Tên chỉ chứa chữ và khoảng trắng, từ 2-50 ký tự"
        },
        {
            id: "username",
            name: "Tên đăng nhập",
            required: true,
            pattern: /^[a-zA-Z0-9_]{3,20}$/,
            patternMsg: "Chỉ chứa chữ, số, _ và từ 3-20 ký tự"
        },
        {
            id: "email",
            name: "Email",
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            patternMsg: "Email không hợp lệ"
        },
        {
            id: "password",
            name: "Mật khẩu",
            required: true,
            minLength: 8,
            minLengthMsg: "Mật khẩu phải từ 8 ký tự trở lên",
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/,
            patternMsg: "Phải có chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng"
        }
    ];

    // Reset lỗi
    fields.forEach(f => {
        const el = document.getElementById(`error-register-${f.id}`);
        el.innerText = "";
        el.classList.add("hidden");
    });

    let hasError = false;

    // Validate
    fields.forEach(f => {
        const value = document.getElementById(`register-${f.id}`).value.trim();

        if (f.required && !value) {
            const el = document.getElementById(`error-register-${f.id}`);
            el.innerText = `Vui lòng nhập ${f.name.toLowerCase()}`;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }

        if (f.pattern && !f.pattern.test(value)) {
            const el = document.getElementById(`error-register-${f.id}`);
            el.innerText = f.patternMsg;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }

        if (f.minLength && value.length < f.minLength) {
            const el = document.getElementById(`error-register-${f.id}`);
            el.innerText = f.minLengthMsg;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }
    });

    if (hasError) return;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": window.csrfToken
            },
            body: JSON.stringify({ firstname, lastname, username, email, password })
        });

        if (!response.ok) {
            const errData = await response.json();
            showAlert("error", (errData.message || "Có lỗi xảy ra"));
            return;
        }

        const data = await response.json();
        showVerifyModal(email);

        if (data.token) {
            localStorage.setItem("token", data.token);
        }
    } catch (error) {
        console.error(error);
    }
}

function resendVerifyEmail() {
    const resendBtn = document.getElementById("resend-email");

    if (!emailReset) {
        showAlert("error", "Email không hợp lệ.");
        return;
    }

    // Disable button để tránh click nhiều lần
    resendBtn.disabled = true;
    resendBtn.textContent = "Đang gửi...";

    fetch("/resend-confirm-email/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrfToken
        },
        body: JSON.stringify({ emailReset })
    })
        .then(res => res.json())
        .then(data => {
            showAlert(data.success ? 'success' : 'error', data.message);
        })
        .catch(err => {
            console.error(err);
            showAlert("error", "Đã xảy ra lỗi, vui lòng thử lại sau.");
        })
        .finally(() => {
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend Verification Email";
        });
}

function showVerifyModal(email) {
    const modal = document.getElementById("verify-modal");
    const emailEl = document.getElementById("modal-email");
    const closeBtn = document.getElementById("modal-close");

    emailEl.textContent = email;
    emailReset = email;

    modal.classList.remove("hidden");

    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
}

// Close modal
document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("verify-modal").classList.add("hidden");
});

// Optional: click outside modal to close
document.getElementById("verify-modal").addEventListener("click", (e) => {
    if (e.target.id === "verify-modal") {
        e.currentTarget.classList.add("hidden");
    }
});

// Nút Resend Email
document.getElementById("resend-email").addEventListener("click", () => {
    // Gọi API resend email
    resendVerifyEmail()
});
