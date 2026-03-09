import { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerInfo({ bookingData, onBack, onEmailSent }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation regex patterns
  const phoneRegex = /^(0[3|5|7|8|9][0-9]{8})$|^(\+84[3|5|7|8|9][0-9]{8})$/;
  // Ultra-strict email regex: min 8 chars, max 254, no consecutive dots, single @, no 2+ consecutive special chars
  const emailRegex = /^(?=.{8,254}$)(?!.*[@]{2})(?!.*\.{2})(?!.*[-+!#$%&*?^_`{|}~]{2,})([a-zA-Z0-9][a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]{0,63})(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]{1,63})*@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
  
  // Blacklist of fake/test domains and invalid TLDs
  const fakeDomainBlacklist = [
    'example.com',
    'test.com',
    'mailinator.com',
    '10minutemail.com',
    'tempmail.com',
    'guerrillamail.com'
  ];
  
  const invalidTlds = ['mail', 'gil', 'test', 'fake', 'localhost', 'local', 'invalid', 'example'];

  // Helper function to detect repeated patterns in domain (3+ chars repeated consecutively)
  const hasRepeatedDomainPattern = (domain) => {
    const domainLower = domain.toLowerCase();
    
    // Check for repeated patterns of 3+ characters (e.g., "comcom", "gilgil", "abcabc")
    for (let len = 3; len <= Math.floor(domainLower.length / 2); len++) {
      for (let i = 0; i <= domainLower.length - len * 2; i++) {
        const pattern = domainLower.substring(i, i + len);
        const nextPattern = domainLower.substring(i + len, i + len * 2);
        if (pattern === nextPattern && pattern.length >= 3) {
          return true;
        }
      }
    }
    
    // Check for common suspicious patterns
    const suspiciousPatterns = [
      /comcom/i,
      /netnet/i,
      /orgorg/i,
      /gilgil/i,
      /abcabc/i,
      /gmaill/i,
      /gmailcom/i,
      /yahoom/i,
      /outlookk/i,
      /hotmell/i,
      /mailmail/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(domainLower));
  };

  // Helper function to count special characters in email
  const countSpecialChars = (email) => {
    return (email.match(/[!#$%&'*+/=?^_`{|}~-]/g) || []).length;
  };

  // Real-time validation functions
  const validateFullName = (value) => {
    if (!value.trim()) {
      return "Vui lòng nhập họ và tên";
    }
    if (value.trim().length < 2) {
      return "Họ và tên phải có ít nhất 2 ký tự";
    }
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) {
      return "Vui lòng nhập số điện thoại";
    }
    if (!phoneRegex.test(value.trim())) {
      return "Số điện thoại không hợp lệ";
    }
    return "";
  };

  // Ultra-strict email validation with comprehensive checks
  const validateEmail = (value) => {
    const trimmed = value.trim();
    
    // 1. Required check
    if (!trimmed) {
      return "Vui lòng nhập email";
    }

    // 2. Check for spaces or non-printable characters (not allowed anywhere)
    if (trimmed.includes(" ") || /[\x00-\x1F\x7F]/.test(trimmed)) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }

    // 3. Length check: min 8, max 254 characters
    if (trimmed.length < 8) {
      return "Email quá ngắn hoặc không hợp lệ";
    }
    if (trimmed.length > 254) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }

    // 4. Check for exactly one @ symbol
    const atCount = (trimmed.match(/@/g) || []).length;
    if (atCount !== 1) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }

    // Split into local and domain parts
    const [localPart, domainPart] = trimmed.split("@");

    // 5. Validate local part (before @)
    if (!localPart || localPart.length === 0) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Local part must be 1-64 chars, but reject if > 32 (suspicious for fake)
    if (localPart.length > 64) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    if (localPart.length > 32) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    
    // Must start with letter or digit (not special char)
    if (!/^[a-zA-Z0-9]/.test(localPart)) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Check for invalid characters in local part (only allowed: letters, digits, !#$%&'*+/=?^_`{|}~- and .)
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    
    // No consecutive dots
    if (localPart.includes("..")) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Cannot start or end with dot
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Check for 2 consecutive special characters (--, ++, **, ##, $$, etc.)
    if (/[-+!#$%&*?^_`{|}~]{2,}/.test(localPart)) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    
    // Check for 3+ consecutive or repeated special characters (***, ---, +++, ###, $$$)
    if (/[-+!#$%&*?^_`{|}~]{3,}/.test(localPart) || /([-+!#$%&*?^_`{|}~])\1{2,}/.test(localPart)) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    
    // Reject if local part has more than one '+' (common in disposable emails)
    const plusCount = (localPart.match(/\+/g) || []).length;
    if (plusCount > 1) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }

    // 6. Validate domain part (after @)
    if (!domainPart || domainPart.length === 0) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Domain must be at least 5 characters after @
    if (domainPart.length < 5) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    
    // Domain must have at least one dot
    if (!domainPart.includes(".")) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // No consecutive dots in domain
    if (domainPart.includes("..")) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Cannot start or end with dot or hyphen
    if (domainPart.startsWith(".") || domainPart.endsWith(".") || 
        domainPart.startsWith("-") || domainPart.endsWith("-")) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Check for repeated domain patterns (3+ chars repeated consecutively)
    if (hasRepeatedDomainPattern(domainPart)) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    
    // Validate each subdomain
    const domainParts = domainPart.split(".");
    if (domainParts.length < 2) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    for (let i = 0; i < domainParts.length - 1; i++) {
      const subdomain = domainParts[i];
      if (!subdomain || subdomain.length === 0 || subdomain.length > 63) {
        return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
      }
      // Subdomain: letters/digits/hyphen only, no consecutive hyphen, no start/end with hyphen
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(subdomain)) {
        return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
      }
      // Check for consecutive hyphens in subdomain
      if (subdomain.includes("--")) {
        return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
      }
    }
    
    // Domain must have valid TLD (last part: 2-63 chars, letters only)
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2 || tld.length > 63 || !/^[a-zA-Z]+$/.test(tld)) {
      return "Email không đúng định dạng. Ví dụ: tenban@gmail.com";
    }
    
    // Check against invalid TLDs (.mail, .gil, .test, .fake, .localhost, etc.)
    const tldLower = tld.toLowerCase();
    if (invalidTlds.includes(tldLower)) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }
    
    // Check against fake domain blacklist
    const domainLower = domainPart.toLowerCase();
    if (fakeDomainBlacklist.some(fake => domainLower === fake || domainLower.endsWith(`.${fake}`))) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }

    // 7. Final strict regex check
    if (!emailRegex.test(trimmed)) {
      return "Email chứa ký tự không cho phép hoặc định dạng sai";
    }

    return "";
  };

  // Pre-fill email if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLogin") === "true";
    if (isLoggedIn) {
      const userEmail = localStorage.getItem("userEmail");
      const userFullName = localStorage.getItem("userFullName") || "";
      if (userEmail) {
        const newForm = {
          email: userEmail,
          fullName: userFullName,
          phone: "",
        };
        setForm(newForm);
        // Validate pre-filled values
        const err = {};
        const fullNameError = validateFullName(userFullName);
        if (fullNameError) err.fullName = fullNameError;
        const emailError = validateEmail(userEmail);
        if (emailError) err.email = emailError;
        setErrors(err);
      }
    }
  }, []);

  // Handle input changes with real-time validation
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, fullName: value });
    const error = validateFullName(value);
    setErrors({ ...errors, fullName: error });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, phone: value });
    const error = validatePhone(value);
    setErrors({ ...errors, phone: error });
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, email: value });
    // Real-time validation on change
    const error = validateEmail(value);
    setErrors({ ...errors, email: error });
  };

  const handleEmailBlur = (e) => {
    // Validate on blur as well for better UX
    const value = e.target.value;
    const error = validateEmail(value);
    setErrors({ ...errors, email: error });
  };

  // Compute form validity - checks all fields are valid and no errors exist
  // Use validation functions to ensure consistency with error messages
  const isFormValid = 
    form.fullName.trim().length >= 2 &&
    phoneRegex.test(form.phone.trim()) &&
    emailRegex.test(form.email.trim()) &&
    !errors.fullName &&
    !errors.phone &&
    !errors.email &&
    form.email.trim() !== "" &&
    form.email.trim().length >= 8 &&
    form.phone.trim() !== "" &&
    form.fullName.trim() !== "";

  const validate = () => {
    const err = {};

    const fullNameError = validateFullName(form.fullName);
    if (fullNameError) err.fullName = fullNameError;

    const phoneError = validatePhone(form.phone);
    if (phoneError) err.phone = phoneError;

    const emailError = validateEmail(form.email);
    if (emailError) err.email = emailError;

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare booking data for API
      const bookingPayload = {
        customerName: form.fullName,
        customerEmail: form.email,
        customerPhone: form.phone,
        services: bookingData.services || [],
        date: bookingData.date,
        time: bookingData.time,
        totalPrice: bookingData.price || 0,
        totalDuration: bookingData.duration || 0,
      };

      // Create booking via POST /booking
      const response = await axios.post(
        "http://localhost:3001/booking",
        bookingPayload
      );

      // Update booking data with customer info and appointment ID
      const updatedBookingData = {
        ...bookingData,
        customer: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        appointmentId: response.data.appointmentId,
        confirmationToken: response.data.confirmationToken,
      };

      localStorage.setItem("bookingData", JSON.stringify(updatedBookingData));
      localStorage.setItem("emailToVerify", form.email);
      localStorage.setItem("emailVerified", "false");

      // Callback to parent - this will show EmailConfirmationSent screen
      if (onEmailSent) {
        onEmailSent({
          email: form.email,
          appointmentId: response.data.appointmentId,
        });
      }
    } catch (err) {
      // Hiển thị thông báo lỗi chi tiết từ backend
      const errorMessage = err.response?.data?.message || "Lỗi khi tạo đặt lịch";
      const errorDetails = err.response?.data?.details || err.message;
      const errorCode = err.response?.data?.errorCode;
      
      console.error("Error creating booking:", err);
      console.error("Error response:", err.response?.data);
      
      // Hiển thị thông báo lỗi chi tiết
      if (errorDetails && errorDetails !== errorMessage) {
        alert(`${errorMessage}\n\nChi tiết: ${errorDetails}${errorCode ? `\nMã lỗi: ${errorCode}` : ""}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-10">
        <h2 className="text-3xl font-bold mb-8">
          Thông Tin <span className="gold">Khách Hàng</span>
        </h2>

        {/* Booking Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-[#d4a441]">
            Tóm tắt đặt lịch
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-400">Dịch vụ:</span>{" "}
              <span className="text-white">
                {bookingData?.services?.join(", ") || "---"}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Ngày:</span>{" "}
              <span className="text-white">{bookingData?.date || "---"}</span>
            </p>
            <p>
              <span className="text-gray-400">Giờ:</span>{" "}
              <span className="text-white">{bookingData?.time || "---"}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Họ và tên <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleFullNameChange}
              className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:border-[#d4a441] ${
                errors.fullName ? "border-red-500" : "border-zinc-700"
              }`}
              placeholder="Nhập họ và tên"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Số điện thoại <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:border-[#d4a441] ${
                errors.phone ? "border-red-500" : "border-zinc-700"
              }`}
              placeholder="0901234567 hoặc +84901234567"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none ${
                errors.email 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-zinc-700 focus:border-[#d4a441]"
              }`}
              placeholder="example@gmail.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Chúng tôi sẽ gửi email xác nhận đến địa chỉ này
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
              className="flex-1 px-6 py-3 bg-[#d4a441] text-black rounded-lg hover:bg-[#c49431] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Tiếp tục"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
