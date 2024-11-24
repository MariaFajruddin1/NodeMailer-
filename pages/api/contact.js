import { mailOptions, transporter } from "../../config/nodemailer";

const CONTACT_MESSAGE_FIELDS = {
  name: "Name",
  email: "Email",
  message: "Message"
};

const generateEmailContent = (data) => {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) => (str += `${CONTACT_MESSAGE_FIELDS[key]}: ${val}\n`),
    ""
  );
  const htmlData = Object.entries(data).reduce((str, [key, val]) => {
    return (str += `<p class="form-heading" align="left">${CONTACT_MESSAGE_FIELDS[key]}: <span style="font-weight: bold;">${val}</span></p>`);
  }, "");

  return {
    text: stringData,
    html: `<!DOCTYPE html>
<html>
<head>
  <title>New Message from ${data.email}</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <style type="text/css">
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse !important;
    }
    body {
      height: 100% !important;
      width: 100% !important;
      font-family: Arial, sans-serif;
    }
    .email-container {
      width: 100%;
    }
    .message-content {
      font-size: 16px;
      line-height: 1.6;
    }
    .form-container {
      margin-top: 20px;
    }
    .form-heading {
      font-weight: 500;
      // font-size: 16px;
    }
    .footer {
      font-size: 14px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container">
          <tr>
            <td class="message-content">
              <h1>Hello, Devolic</h1>
              <p>You have received a new message. Here are the details:</p>
              <div class="form-container">
                ${htmlData}
              </div>
              <h3>Best regards,<br />${data.name}</h3>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

const handler = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;

    // Validate required fields
    if (!data || !data.name || !data.email || !data.message) {
      return res.status(400).send({ message: "Bad request" });
    }

    try {
      // Set up mail options with attachment
      const mailOptionsWithAttachment = {
        ...mailOptions,
        ...generateEmailContent(data),
        subject: `New Message from ${data.email}`,
        attachments: data.file
          ? [
              {
                filename: data.file.name,
                content: data.file.data,
                contentType: data.file.type,
              },
            ]
          : [],
      };

      await transporter.sendMail(mailOptionsWithAttachment);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: err.message });
    }
  }
  return res.status(400).json({ message: "Bad request" });
};

export default handler;
