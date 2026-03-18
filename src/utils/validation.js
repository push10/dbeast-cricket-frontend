export const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
export const OTP_REGEX = /^[0-9]{6}$/;
export const URL_REGEX = /^https?:\/\/.+$/;

export function isValidMobile(mobile) {
  return MOBILE_REGEX.test(String(mobile || "").trim());
}

export function isValidOtp(otp) {
  return OTP_REGEX.test(String(otp || "").trim());
}

export function isValidEmail(email) {
  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function isValidHttpUrl(url) {
  if (!url) {
    return true;
  }

  return URL_REGEX.test(String(url).trim());
}
