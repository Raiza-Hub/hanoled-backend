export const generateOtp = () => {
  const otp = Math.floor(Math.random() * 900000) + 1000000;
  return otp.toString();
};
