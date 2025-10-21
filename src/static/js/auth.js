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
