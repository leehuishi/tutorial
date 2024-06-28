import Cookies from 'js-cookie';

export const setAuthTokenCookie = (token) => {
  // Calculate expiry time for 1 hour from now
  const oneHour = 1/24; // 1 hour expressed in days (since js-cookie uses days for expires)
  const expiryDate = new Date(new Date().getTime() + oneHour * 60 * 60 * 1000);

  Cookies.set('jwtToken', token, { expires: expiryDate });
};
