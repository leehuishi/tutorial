import Cookies from 'js-cookie';

export const setAuthTokenCookie = (token) => {
  Cookies.set('jwtToken', token, { expires: 7 }); // You can set an expiry date as per your requirement
};