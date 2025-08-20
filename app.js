const path = require('path');
const express = require("express");
const app = express();

// http://127.0.0.1/static/* へのアクセスを /public/*へのアクセスに変換する
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.json());

// http://127.0.0.1/ へのアクセスはindex.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

function buildMessage({ email, name }) {
  return {
    personalizations: [
      {
        to: [{ email, name, }],
      },
    ],
    from: {
      email: "codo_175r@yahoo.co.jp",
      name: "Seiya Abukawa",
    },
    subject: "お問い合わせありがとうございます",
    content: [
      {
        type: "text/plain",
        value: [
          `${name}様`,
          "",
          "お問い合わせいただき、誠にありがとうございます。",
          "このメールは、システムによる自動返信であり、お問い合わせを受け付けたことをお知らせするものです。",
          "お問い合わせ内容につきましては、担当者が確認の上、改めてご連絡させていただきます。",
          "",
          "通常、１営業日以内には回答を差し上げておりますが、内容によっては少々お時間をいただく場合がございます。",
        ].join("\n"),
      },
    ],
  }
};

async function sendContact(contact) {
  try {
    const resp = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contact),
    });

    if (resp.ok) {
      window.location.assign(resp.url);
    } else {
      const error = await resp.json();
      console.error("Failed to send contact:", error.message);

      errorEl.textContent = error.message;
      errorEl.classList.add("block");
      errorEl.classList.remove("hidden");

      buttonEl.removeAttribute("disabled");
      buttonEl.textContent = "送信する";
    }
  } catch (err) {
    console.error("Error sending contact:", err);
    errorEl.textContent = error.message;
    errorEl.classList.add("block");
    errorEl.classList.remove("hidden");

    buttonEl.removeAttribute("disabled");
    buttonEl.textContent = "送信する";
  }
}

async function sendMail({ email, name }) {
  const message = buildMessage({ email, name });

  try {
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(message),
    });

    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(`メールの送信に失敗しました:${data.errors[0].message}`);
    }

    return { ok: true };
  } catch (err) {
    throw err;
  }
}

app.post("/api/contact", async (req, res) => {
  const contact = req.body;

  try {
    await Promise.all([
      sendContact(contact),
      sendMail({ email: contact.email, name: contact.name })
    ])

    res.redirect("/complete");
  } catch(err) {
    console.error("error: ", err)
    res.status(500).json({ message: err.message })
  }
});

app.get("/complete", (req, res) => {
  res.sendFile(`${__dirname}/public/complete.html`);
});

app.listen(3000, () => console.log("listening on port 3000"));
