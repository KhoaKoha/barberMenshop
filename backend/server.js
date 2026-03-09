require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const connectDB = require("./database");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

// ===== CẤU HÌNH EMAIL (SMTP) =====
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASS || "your-app-password",
  },
});

transporter.verify(function (error) {
  if (error) {
    console.log("⚠️ SMTP Configuration Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

// Store verification tokens (temporary - for email verification flow)
const verificationTokens = new Map();

// ===== CẤU HÌNH SQL SERVER =====
// ===== HÀM KIỂM TRA EMAIL =====
const validateEmail = (email) => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!email || typeof email !== "string") return false;
  if (email.length > 254) return false;
  if (!emailRegex.test(email)) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;

  if (localPart.length === 0 || localPart.length > 64) return false;
  if (domain.length === 0 || domain.length > 253) return false;

  const domainRegex =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!domainRegex.test(domain)) return false;

  return true;
};

// ===== API TEST =====
app.get("/", (req, res) => {
  res.send("✅ Backend MenZone đang chạy");
});

// ===== API ĐĂNG KÝ =====
app.post("/register", async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password || !phone) {
    return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
  }

  try {
    const pool = await connectDB();

    const checkEmail = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT Id FROM Users WHERE Email = @email");

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({
        message: "Email đã tồn tại, vui lòng đăng nhập",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.VarChar, email)
      .input("passwordHash", sql.VarChar, passwordHash)
      .input("phone", sql.VarChar, phone)
      .query(`
        INSERT INTO Users (FullName, Email, PasswordHash, Phone, Role)
        VALUES (@fullName, @email, @passwordHash, @phone, 'customer')
      `);

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ===== API ĐĂNG NHẬP =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await connectDB();

    const result = await pool.request().input("email", sql.VarChar, email).query(`
        SELECT Id, FullName, Email, PasswordHash, Role
        FROM Users
        WHERE Email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    res.json({
      id: user.Id,
      fullName: user.FullName,
      email: user.Email,
      role: user.Role,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ===== API GỬI EMAIL XÁC NHẬN EMAIL (nếu frontend đang dùng) =====
app.post("/api/booking/send-verification", async (req, res) => {
  const { email, fullName, phone, bookingData } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
    });
  }

  if (!fullName || !phone) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    verificationTokens.set(token, {
      email,
      fullName,
      phone,
      bookingData,
      expiresAt,
      verified: false,
    });

    const verificationLink = `http://localhost:5173/verify-email?token=${token}&email=${encodeURIComponent(
      email
    )}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Xác nhận email đặt lịch - MenZone Barbershop",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4a441;">Xác nhận email đặt lịch</h2>
          <p>Xin chào <strong>${fullName}</strong>,</p>
          <p>Cảm ơn bạn đã đặt lịch tại MenZone Barbershop.</p>
          <p>Vui lòng nhấp vào liên kết bên dưới để xác nhận địa chỉ email của bạn:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #d4a441; color: black; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Xác nhận email
            </a>
          </div>
          <p>Hoặc sao chép và dán liên kết sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Liên kết này sẽ hết hạn sau 24 giờ.<br>
            Nếu bạn không yêu cầu đặt lịch này, vui lòng bỏ qua email này.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Verification email sent to:", email);

    res.json({
      message: "Email xác nhận đã được gửi",
      token,
      verificationLink,
    });
  } catch (err) {
    console.error("❌ Error sending verification email:", err);

    if (err.code === "EAUTH" || err.code === "ECONNECTION") {
      return res.status(500).json({
        message: "Lỗi cấu hình email server. Vui lòng liên hệ quản trị viên.",
      });
    }

    if (err.responseCode === 550 || err.responseCode === 551) {
      return res.status(400).json({
        message: "Email không tồn tại hoặc không thể nhận email. Vui lòng kiểm tra lại địa chỉ email.",
      });
    }

    res.status(500).json({
      message: "Lỗi khi gửi email. Vui lòng thử lại sau.",
    });
  }
});

// ===== API XÁC NHẬN EMAIL =====
app.post("/api/booking/verify-email", async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ message: "Thiếu thông tin xác nhận" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      message: "Email không hợp lệ",
    });
  }

  try {
    const tokenData = verificationTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
        verified: false,
      });
    }

    if (Date.now() > tokenData.expiresAt) {
      verificationTokens.delete(token);
      return res.status(400).json({
        message: "Token đã hết hạn. Vui lòng yêu cầu gửi lại email.",
        verified: false,
      });
    }

    if (tokenData.email !== email) {
      return res.status(400).json({
        message: "Email không khớp với token",
        verified: false,
      });
    }

    tokenData.verified = true;
    verificationTokens.set(token, tokenData);

    res.json({
      message: "Email đã được xác nhận thành công",
      verified: true,
    });
  } catch (err) {
    console.error("❌ Error verifying email:", err);
    res.status(500).json({
      message: "Lỗi khi xác nhận email",
      verified: false,
    });
  }
});

// ===== API KIỂM TRA TRẠNG THÁI XÁC NHẬN EMAIL =====
app.post("/api/booking/check-verification", async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      message: "Email không hợp lệ",
      verified: false,
    });
  }

  try {
    let isVerified = false;

    for (const [, data] of verificationTokens.entries()) {
      if (data.email === email && data.verified && Date.now() <= data.expiresAt) {
        isVerified = true;
        break;
      }
    }

    res.json({
      verified: isVerified,
    });
  } catch (err) {
    console.error("❌ Error checking verification:", err);
    res.status(500).json({
      message: "Lỗi khi kiểm tra trạng thái",
      verified: false,
    });
  }
});

// ===== API TẠO ĐẶT LỊCH + GỬI MAIL XÁC NHẬN THẬT =====
app.post("/booking", async (req, res) => {
  console.log("📥 POST /booking:", req.body);

  const {
    customerName,
    customerEmail,
    customerPhone,
    services,
    date,
    time,
    totalPrice,
    totalDuration,
  } = req.body;

  if (
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !services ||
    !date ||
    !time
  ) {
    return res.status(400).json({ message: "Thiếu dữ liệu đặt lịch" });
  }

  if (!validateEmail(customerEmail)) {
    return res.status(400).json({ message: "Email khách hàng không hợp lệ" });
  }

  try {
    const pool = await connectDB();

    const confirmationToken = crypto.randomBytes(32).toString("hex");

    const servicesJson = Array.isArray(services)
      ? JSON.stringify(services)
      : JSON.stringify([services]);

    const finalTotalPrice = totalPrice ? parseFloat(totalPrice) : 0;
    const finalTotalDuration = totalDuration ? parseInt(totalDuration, 10) : 0;

    const appointmentDateTime = new Date(`${date}T${time}`);

    const result = await pool
      .request()
      .input("customerName", sql.NVarChar(100), customerName)
      .input("customerEmail", sql.VarChar(100), customerEmail)
      .input("customerPhone", sql.VarChar(20), customerPhone)
      .input("services", sql.NVarChar(sql.MAX), servicesJson)
      .input("appointmentTime", sql.DateTime, appointmentDateTime)
      .input("totalPrice", sql.Decimal(10, 2), finalTotalPrice)
      .input("totalDuration", sql.Int, finalTotalDuration)
      .input("status", sql.VarChar(20), "pending")
      .input("confirmationToken", sql.VarChar(64), confirmationToken)
      .query(`
        INSERT INTO Appointments
        (CustomerName, CustomerEmail, CustomerPhone, Services, AppointmentTime, TotalPrice, TotalDuration, Status, ConfirmationToken)
        OUTPUT INSERTED.Id
        VALUES
        (@customerName, @customerEmail, @customerPhone, @services, @appointmentTime, @totalPrice, @totalDuration, @status, @confirmationToken)
      `);

    const appointmentId = result.recordset[0].Id;
    console.log("✅ Booking created:", appointmentId);

    // Link người dùng bấm trong email -> backend xác nhận -> backend redirect về frontend
    const confirmLink = `http://localhost:3001/booking/confirm?token=${confirmationToken}`;

    let parsedServices = [];
    try {
      parsedServices = Array.isArray(services) ? services : JSON.parse(servicesJson);
    } catch (e) {
      parsedServices = Array.isArray(services) ? services : [services];
    }

    const servicesText = Array.isArray(parsedServices)
      ? parsedServices
        .map((item) => {
          if (typeof item === "string") return item;
          if (item?.name) return item.name;
          if (item?.title) return item.title;
          return JSON.stringify(item);
        })
        .join(", ")
      : String(parsedServices);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: "Xác nhận đặt lịch - MenZone Barbershop",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; line-height: 1.6;">
          <h2 style="color: #d4a441; text-align: center;">Xác nhận đặt lịch cắt tóc</h2>

          <p>Xin chào <strong>${customerName}</strong>,</p>
          <p>MenZone đã nhận được yêu cầu đặt lịch của bạn.</p>

          <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Họ tên:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Số điện thoại:</strong> ${customerPhone}</p>
            <p><strong>Dịch vụ:</strong> ${servicesText}</p>
            <p><strong>Ngày:</strong> ${date}</p>
            <p><strong>Giờ:</strong> ${time}</p>
            <p><strong>Tổng thời gian:</strong> ${finalTotalDuration} phút</p>
            <p><strong>Tổng tiền:</strong> ${finalTotalPrice.toLocaleString("vi-VN")} VNĐ</p>
          </div>

          <p>Vui lòng nhấn nút bên dưới để xác nhận lịch hẹn:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}"
               style="background-color: #d4a441; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Xác nhận đặt lịch
            </a>
          </div>

          <p>Nếu nút không hoạt động, hãy copy link sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #666;">${confirmLink}</p>

          <p style="color: #999; font-size: 13px; margin-top: 30px;">
            Sau khi bấm xác nhận, hệ thống sẽ chuyển bạn về website MenZone và hiển thị đặt lịch thành công.
          </p>
        </div>
      `,
    });

    console.log("✅ Booking confirmation email sent to:", customerEmail);

    res.status(201).json({
      message: "Đặt lịch thành công, vui lòng kiểm tra email để xác nhận",
      appointmentId,
    });
  } catch (err) {
    console.error("❌ Booking error:", err);

    res.status(500).json({
      message: "Lỗi server khi tạo đặt lịch",
      details: err.message,
    });
  }
});

// ===== API XÁC NHẬN ĐẶT LỊCH TỪ EMAIL =====
app.get("/booking/confirm", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Lỗi xác nhận</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #000;
            color: #fff;
          }
          .error { color: #ff4444; }
          a { color: #d4a441; }
        </style>
      </head>
      <body>
        <h1 class="error">Lỗi xác nhận</h1>
        <p>Thiếu token xác nhận. Vui lòng kiểm tra lại liên kết.</p>
        <p><a href="http://localhost:5173">Quay về website</a></p>
      </body>
      </html>
    `);
  }

  try {
    const pool = await connectDB();

    const result = await pool
      .request()
      .input("token", sql.VarChar(64), token)
      .query(`
        SELECT Id, CustomerName, Status, ConfirmationToken
        FROM Appointments
        WHERE ConfirmationToken = @token
      `);

    if (result.recordset.length === 0) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>Token không hợp lệ</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: #000;
              color: #fff;
            }
            .error { color: #ff4444; }
            a { color: #d4a441; }
          </style>
        </head>
        <body>
          <h1 class="error">Token không hợp lệ</h1>
          <p>Token xác nhận không tồn tại hoặc đã được sử dụng.</p>
          <p><a href="http://localhost:5173">Quay về website</a></p>
        </body>
        </html>
      `);
    }

    const appointment = result.recordset[0];

    if (appointment.Status === "confirmed") {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>Đã xác nhận</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: #000;
              color: #fff;
            }
            .success { color: #4CAF50; }
            .info { color: #d4a441; margin-top: 20px; }
            a { color: #d4a441; }
          </style>
        </head>
        <body>
          <h1 class="success">Đặt lịch đã được xác nhận</h1>
          <p>Xin chào <strong>${appointment.CustomerName}</strong>,</p>
          <p class="info">Lịch hẹn của bạn đã được xác nhận trước đó.</p>
          <p><a href="http://localhost:5173/booking?confirmed=true">Quay về trang đặt lịch</a></p>
        </body>
        </html>
      `);
    }

    await pool
      .request()
      .input("id", sql.Int, appointment.Id)
      .query(`
        UPDATE Appointments
        SET Status = 'confirmed',
            ConfirmationToken = NULL
        WHERE Id = @id
      `);

    console.log("✅ Booking confirmed, appointment id:", appointment.Id);

    // Redirect về frontend
    return res.redirect("http://localhost:5173/booking?confirmed=true");
  } catch (err) {
    console.error("❌ Error confirming booking:", err);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Lỗi server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #000;
            color: #fff;
          }
          .error { color: #ff4444; }
          a { color: #d4a441; }
        </style>
      </head>
      <body>
        <h1 class="error">Lỗi server</h1>
        <p>Đã xảy ra lỗi khi xác nhận đặt lịch. Vui lòng thử lại sau.</p>
        <p><a href="http://localhost:5173">Quay về website</a></p>
      </body>
      </html>
    `);
  }
});

// Helper function to sort object keys for VNPAY checksum
// (ported from official vnpay_nodejs demo)
function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    var k = str[key];
    // values encoded once here, spaces replaced with '+'
    sorted[k] = encodeURIComponent(obj[k]).replace(/%20/g, "+");
  }
  return sorted;
}

// Helper: format date for VNPAY (yyyyMMddHHmmss) in GMT+7
function formatDateForVnpay(date, format) {
  // VNPay requires timezone GMT+7 regardless of server timezone
  const gmt7Ms = date.getTime() + 7 * 60 * 60 * 1000;
  const d7 = new Date(gmt7Ms);

  const pad = (n) => (n < 10 ? "0" + n : String(n));
  const y = d7.getUTCFullYear();
  const m = pad(d7.getUTCMonth() + 1);
  const d = pad(d7.getUTCDate());
  const H = pad(d7.getUTCHours());
  const M = pad(d7.getUTCMinutes());
  const s = pad(d7.getUTCSeconds());

  if (format === "yyyymmddHHmmss") return `${y}${m}${d}${H}${M}${s}`;
  if (format === "HHmmss") return `${H}${M}${s}`;
  return `${y}${m}${d}${H}${M}${s}`;
}

// Helper to remove diacritics and special characters from Vietnamese strings for VNPAY
function sanitizeVnpayOrderInfo(str) {
  if (!str) return "";
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D"); // Handle 'đ' character
  str = str.replace(/[^a-zA-Z0-9 ]/g, ""); // Remove special characters, keep spaces
  str = str.replace(/\s+/g, " ").trim(); // Replace multiple spaces with single space and trim
  return str;
}

// ===== API VNPAY CREATE PAYMENT URL =====
app.post('/api/vnpay/create_payment_url', function (req, res, next) {
  var ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection && req.connection.socket && req.connection.socket.remoteAddress);

  var crypto = require("crypto");

  var tmnCode = process.env.VNP_TMNCODE;
  var secretKey = process.env.VNP_HASHSECRET;
  var vnpUrl = process.env.VNP_URL;
  var returnUrl = process.env.VNP_RETURNURL;

  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
    return res.status(500).json({
      message: "VNPay configuration is missing. Please check VNP_TMNCODE, VNP_HASHSECRET, VNP_URL, VNP_RETURNURL in .env",
    });
  }

  var date = new Date();

  var createDate = formatDateForVnpay(date, 'yyyymmddHHmmss');

  // Calculate expire date (e.g., 15 minutes from now)
  const expireDate = new Date(date.getTime() + 15 * 60 * 1000); // 15 minutes in milliseconds
  var vnp_ExpireDate = formatDateForVnpay(expireDate, 'yyyymmddHHmmss');

  var orderId = formatDateForVnpay(date, 'HHmmss'); // Using HHmmss for orderId, might want something more unique in a real scenario
  var amount = parseInt(req.body.amount, 10); // Should be in VND and an integer
  var bankCode = req.body.bankCode;

  // Sanitize orderInfo as per VNPAY requirements (no diacritics, no special chars)
  var orderInfo = sanitizeVnpayOrderInfo(req.body.orderDescription || "Thanh toan don hang");
  var orderType = req.body.orderType || "billpayment"; // Example: "topup", "billpayment", "fashion", "other"
  var locale = req.body.language || 'vn'; // 'vn' or 'en'
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  var currCode = 'VND';
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100; // VNPAY requires amount in cents/hundreds
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_ExpireDate'] = vnp_ExpireDate; // Add the required ExpireDate
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode && bankCode !== "undefined" && bankCode !== "null") {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  // Build hash data & query string exactly like vnpay_nodejs demo
  var signData = "";
  var query = "";
  var first = true;
  for (var key in vnp_Params) {
    if (Object.prototype.hasOwnProperty.call(vnp_Params, key)) {
      var value = vnp_Params[key];
      if (value !== null && value !== undefined && value !== "") {
        if (first) {
          signData += key + "=" + value;
          first = false;
        } else {
          signData += "&" + key + "=" + value;
        }
        query += key + "=" + value + "&";
      }
    }
  }

  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnpUrl += "?" + query + "vnp_SecureHash=" + signed;

  res.json({ vnpUrl }); // Send the VNPAY URL back to the frontend to redirect
});

// ===== API KIỂM TRA TRẠNG THÁI THANH TOÁN VNPAY (IPN/RETURN URL) =====
app.get('/api/vnpay/vnpay_return', async function (req, res, next) {
  var vnp_Params = req.query;
  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  var secretKey = process.env.VNP_HASHSECRET;
  var crypto = require("crypto");

  // Rebuild hash string in the same way as when creating the payment URL (vnpay_nodejs demo)
  var signData = "";
  var first = true;
  for (var key in vnp_Params) {
    if (Object.prototype.hasOwnProperty.call(vnp_Params, key)) {
      var value = vnp_Params[key];
      if (value !== null && value !== undefined && value !== "") {
        if (first) {
          signData += key + "=" + value;
          first = false;
        } else {
          signData += "&" + key + "=" + value;
        }
      }
    }
  }

  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (secureHash === signed) {
    const rspCode = vnp_Params["vnp_ResponseCode"];

    // MOCK: treat 00 and 01 as success and always redirect user to frontend
    if (rspCode === "00" || rspCode === "01") {
      return res.redirect(frontendUrl + "/?payment=success");
    } else {
      return res.redirect(frontendUrl + "/?payment=failed");
    }
  } else {
    // Checksum failed -> treat as failed and redirect
    return res.redirect(frontendUrl + "/?payment=failed");
  }
});

// ===== API LẤY DANH SÁCH LỊCH HẸN =====
app.get("/appointments", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM Appointments
      ORDER BY CreatedAt DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ===== API CẬP NHẬT TRẠNG THÁI LỊCH HẸN =====
app.patch("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Parse id to integer to ensure type match with database
  const appointmentId = parseInt(id, 10);
  if (isNaN(appointmentId)) {
    return res.status(400).json({ message: "ID lịch hẹn không hợp lệ" });
  }

  if (!status) {
    return res.status(400).json({ message: "Thiếu trạng thái cần cập nhật" });
  }

  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    const pool = await connectDB();

    // Check if appointment exists
    const checkResult = await pool
      .request()
      .input("id", sql.Int, appointmentId)
      .query("SELECT Id FROM Appointments WHERE Id = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    }

    // Update status
    await pool
      .request()
      .input("id", sql.Int, appointmentId)
      .input("status", sql.VarChar(20), status)
      .query(`
        UPDATE Appointments
        SET Status = @status
        WHERE Id = @id
      `);

    console.log(`✅ Appointment ${appointmentId} status updated to ${status}`);

    res.json({
      message: "Cập nhật trạng thái thành công",
      appointmentId: appointmentId,
      status: status,
    });
  } catch (err) {
    console.error("❌ Error updating appointment status:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
});

// ===== CHẠY SERVER =====
app.listen(3001, () => {
  console.log("🚀 Server chạy tại http://localhost:3001");
});