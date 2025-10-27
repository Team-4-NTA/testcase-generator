window.addEventListener('DOMContentLoaded', () => {
  const message = localStorage.getItem('success');
  if (message) {
    showAlert('success', message);
    localStorage.removeItem('success');
  }
});

function showAlert(type, message) {
  const success = document.getElementById("alert-success");
  const error = document.getElementById("alert-error");

  // Ẩn hết trước
  [success, error].forEach(el => {
    el.classList.add("hidden", "translate-x-full", "opacity-0");
  });

  let target, span;
  if (type === "success") {
    target = success;
    span = document.getElementById("success-message");
  } else if (type === "error") {
    target = error;
    span = document.getElementById("error-message");
  } else return;

  span.textContent = message;
  target.classList.remove("hidden");

  // Hiệu ứng slide-in
  setTimeout(() => {
    target.classList.remove("translate-x-full", "opacity-0");
  }, 50);

  // 3 giây sau ẩn lại
  setTimeout(() => {
    target.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => target.classList.add("hidden"), 500);
  }, 3000);
}
