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
  await fetch(
    "https://ua0x84w8fc.microcms.io/api/v1/contact",
    {
      method: "POST",
      headers: {
        "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    }
  );
}

async function sendMail({ email, name }) {
  const message = buildMessage({ email, name });

  const resp = await fetch("https://api.sendgrid.com/v3/mail/send",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify(message),
  });
  console.log("SendGrid status:", resp.status);
  console.log("SendGrid response:", await resp.text());
}

app.post("/api/contact", async (req, res) => {
  const contact = req.body

  await sendContact(contact)
  await sendMail({ email: contact.email, name: contact.name })
  res.json({})
});

// app.post("/api/contact", async(req, res) => {
//   const response = await fetch(
//     "https://ua0x84w8fc.microcms.io/api/v1/contact",
//     {
//       method: "POST",
//       headers: {
//         "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(req.body),
//     }
//   );

//   const data = await response.json();
//   res.json(data);
// });

app.listen(3000, () => console.log("listening on port 3000"));
