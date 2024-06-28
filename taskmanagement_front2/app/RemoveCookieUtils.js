import Cookies from 'js-cookie';

// Remove the 'jwtToken' cookie
export const removeAuthTokenCookie = () => {
    Cookies.remove('jwtToken');
};