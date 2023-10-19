import request from 'sync-request-curl';
import { port, url } from './config.json';
import { requestAdminUserDetails, requestAdminAuthLogin, requestAdminAuthRegister } from './auth.test';
const SERVER_URL = `${url}:${port}`;

function requestAdminAuthLogout (token: number) {
    const res = request(
        'POST',
        SERVER_URL + '/v1/admin/auth/logout',
        {
            json: { token }
        }
    );
    return {
        body: JSON.parse(res.body.toString()),
        statusCode: res.statusCode
    }
}

enum validDetails {
    EMAIL = 'helloworld@gmail.com',
    PASSWORD = '1234UNSW',
    NAMEFIRST = 'Jack',
    NAMELAST = 'Rizzella',
    EMAIL2 = 'helloworld@gmail.com',
    PASSWORD2 = '4321UNSW',
    NAMEFIRST2 = 'Jamie',
    NAMELAST2 = 'Oliver',
  }

describe('Tests for adminAuthLogout', () => {
    test('Successful logout', () => {
        const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
        const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD); 
        // check if user is logged in
        expect(userLogin.body).toStrictEqual({ token: expect.any(String) });
        
        // Logout user
        expect(requestAdminAuthLogout(user.body.token)).toStrictEqual({});

        // check if user can use functions
        expect(requestAdminUserDetails(user.body.token)).toStrictEqual({ error: "User has been logged out."});

        expect(user.statusCode).toStrictEqual(200);
    });

    test('Token is empty or invalid', () => {
        const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
        expect(requestAdminAuthLogout("")).toStrictEqual({ error: "Token is empty"});
        expect(requestAdminAuthLogout("123")).toStrictEqual({ error: "Token is invalid"});
        expect(user.statusCode).toStrictEqual(401);
    });
    
});