export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// For local phone number part only
// Example: 702265155, 771234567, 1234567890
export const isValidInternationalPhone = (phone) => {
  return /^[0-9]{7,15}$/.test(phone);
};

export const isValidName = (name) => {
  return /^[A-Za-z\s]{3,}$/.test(name.trim());
};

export const isStrongPassword = (password) => {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
};

export const isValidOtp = (otp) => {
  return /^[0-9]{6}$/.test(otp);
};

// Register validation
export const validateRegister = (formData) => {
  if (!formData.name.trim()) {
    return "Please enter your full name.";
  }

  if (!isValidName(formData.name)) {
    return "Name must be at least 3 characters and contain only letters.";
  }

  if (!formData.email.trim()) {
    return "Please enter your email address.";
  }

  if (!isValidEmail(formData.email)) {
    return "Please enter a valid email address.";
  }

  if (!formData.countryCode) {
    return "Please select your country code.";
  }

  if (!formData.phone.trim()) {
    return "Please enter your phone number.";
  }

  if (!isValidInternationalPhone(formData.phone)) {
    return "Phone number must contain only numbers and be 7 to 15 digits.";
  }

  if (!formData.password) {
    return "Please enter a password.";
  }

  if (!isStrongPassword(formData.password)) {
    return "Password must be at least 8 characters and include letters and numbers.";
  }

  if (!formData.confirmPassword) {
    return "Please confirm your password.";
  }

  if (formData.password !== formData.confirmPassword) {
    return "Passwords do not match.";
  }

  if (!formData.agreeTerms) {
    return "Please agree to the Terms and Privacy Policy.";
  }

  return "";
};

// Login validation
export const validateLogin = (formData) => {
  if (!formData.email.trim()) {
    return "Please enter your email address.";
  }

  if (!isValidEmail(formData.email)) {
    return "Please enter a valid email address.";
  }

  if (!formData.password) {
    return "Please enter your password.";
  }

  return "";
};

// Profile validation
export const validateProfile = (formData) => {
  if (!formData.name.trim()) {
    return "Please enter your full name.";
  }

  if (!isValidName(formData.name)) {
    return "Name must be at least 3 characters and contain only letters.";
  }

  if (!formData.phone.trim()) {
    return "Please enter your phone number.";
  }

  // Profile phone may already be saved as +94702265155
  const cleanedPhone = formData.phone.replace("+", "");

  if (!/^[0-9]{7,15}$/.test(cleanedPhone)) {
    return "Phone number must be valid. Example: +94702265155";
  }

  if (formData.password) {
    if (!isStrongPassword(formData.password)) {
      return "New password must be at least 8 characters and include letters and numbers.";
    }

    if (!formData.confirmPassword) {
      return "Please confirm your new password.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
  }

  return "";
};

// Forgot password validation
export const validateForgotPassword = (email) => {
  if (!email.trim()) {
    return "Please enter your email address.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  return "";
};

// Reset password OTP validation
export const validateResetPasswordOtp = (formData) => {
  if (!formData.email.trim()) {
    return "Please enter your email address.";
  }

  if (!isValidEmail(formData.email)) {
    return "Please enter a valid email address.";
  }

  if (!formData.otp.trim()) {
    return "Please enter the OTP code.";
  }

  if (!isValidOtp(formData.otp)) {
    return "OTP must be exactly 6 digits.";
  }

  if (!formData.password) {
    return "Please enter a new password.";
  }

  if (!isStrongPassword(formData.password)) {
    return "Password must be at least 8 characters and include letters and numbers.";
  }

  if (!formData.confirmPassword) {
    return "Please confirm your new password.";
  }

  if (formData.password !== formData.confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
};

// Change password validation
export const validateChangePassword = (formData) => {
  if (!formData.currentPassword) {
    return "Please enter your current password.";
  }

  if (!formData.newPassword) {
    return "Please enter a new password.";
  }

  if (!isStrongPassword(formData.newPassword)) {
    return "New password must be at least 8 characters and include letters and numbers.";
  }

  if (!formData.confirmNewPassword) {
    return "Please confirm your new password.";
  }

  if (formData.newPassword !== formData.confirmNewPassword) {
    return "New passwords do not match.";
  }

  if (formData.currentPassword === formData.newPassword) {
    return "New password must be different from current password.";
  }

  return "";
};