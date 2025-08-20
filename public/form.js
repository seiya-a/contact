const formEl = document.getElementById("contact-form");
console.log("formEl:", formEl);
const buttonEl = document.getElementById("submit-button");
const errorEl = document.getElementById("error");
const checkboxEl = document.getElementById("agree");

async function sendContact(contact) {
  const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
  });

  if (response.ok) {
      window.location.assign(response.url);
  }
}

checkboxEl.addEventListener("change", (evt) => {
  checkboxEl.checked
  ? buttonEl.removeAttribute("disabled")
  : buttonEl.setAttribute("disabled", true);
});

formEl.addEventListener("submit", (evt) => {
  evt.preventDefault();
  console.log("フォーム送信イベント発火");

  if (!buttonEl) {
    console.error("buttonEl が取得できていません！");
    return;
  }

  buttonEl.setAttribute("disabled", true);
  buttonEl.textContent = "送信中...";
  console.log("ボタンを無効化しました:", buttonEl);

  const formData = new FormData(formEl);
  const {
    subject,
    name,
    company,
    email,
    content
  } = Object.fromEntries(formData.entries());

  sendContact({
    subject: [subject],
    name,
    company,
    email,
    content
  });
});





// formEl.addEventListener("change", (evt) => {
//   const formData = new FormData(formEl);
//   const entries = Object.fromEntries(formData.entries());

//   console.log(entries);
// });

// formEl.addEventListener("submit", (evt) => {
//   evt.preventDefault();//(1)

//   const formData = new FormData(formEl);//(2)
//   const entries = Object.fromEntries(formData.entries());//(3)

//   console.log(entries);
// });

