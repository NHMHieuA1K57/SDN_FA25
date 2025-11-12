// Email templates for LMS LEARN

const getBaseTemplate = (title, subtitle, content) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${content}
    </div>
  `;
};

const getHeader = (
    icon,
    title,
    subtitle,
    headerColor = "linear-gradient(135deg, #1890ff, #40a9ff)"
) => {
    return `
    <div style="background: ${headerColor}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">${icon} ${title}</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">${subtitle}</p>
    </div>
  `;
};

const getBody = (content) => {
    return `
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
      ${content}
    </div>
  `;
};

const getOTPBox = (otpCode, color = "#1890ff") => {
    return `
    <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid ${color};">
      <h2 style="color: ${color}; margin: 0; font-size: 36px; letter-spacing: 5px;">${otpCode}</h2>
    </div>
  `;
};

const getFooter = () => {
    return `
    <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
      Thank you for trusting and using our service!<br>
      <em>LMS LEARN System</em>
    </p>
  `;
};

// Reset Password OTP Email
const getResetPasswordOTPTemplate = (user, otpCode) => {
    const header = getHeader(
        "🔑",
        "Password Reset",
        "LMS LEARN",
        "linear-gradient(135deg, #ff6b6b, #ee5a6f)"
    );

    const body = `
    <p style="font-size: 16px; color: #333;">Hello <strong>${
        user.userName || user.userEmail
    }</strong>,</p>
    
    <p style="font-size: 15px; color: #666; line-height: 1.6;">
      You have requested to reset your password for your LMS LEARN account. 
      Your verification code is:
    </p>
    
    ${getOTPBox(otpCode, "#ff6b6b")}
    
    <p style="font-size: 14px; color: #888; line-height: 1.6;">
      <strong>Note:</strong> This verification code is only valid for 15 minutes. 
      Please do not share this code with anyone.
    </p>
    
    <p style="font-size: 14px; color: #888; line-height: 1.6;">
      If you did not request a password reset, please ignore this email. 
      Your password will not be changed.
    </p>
    
    ${getFooter()}
  `;

    return getBaseTemplate("Reset Password OTP", "OTP", header + getBody(body));
};

module.exports = {
    getResetPasswordOTPTemplate,
};
