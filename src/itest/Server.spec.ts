import { UserCredentialsDbAccess } from 'app/Authorization/UserCredentialsDbAccess';
import { HTTP_CODES, SessionToken, UserCredentials } from 'app/Models/ServerModels';
import * as axios from 'axios';

axios.default.defaults.validateStatus = () => true;
const serverUrl = 'http://localhost:8080';
const itestUserCredentials: UserCredentials = {
  accessRights: [1,2,3],
  password: 'iTestPass',
  username: 'iTestUser'
}

describe('Server itest suite', () => {
  let userCredentialsDBAccess: UserCredentialsDbAccess;
  let sessionToken: SessionToken;

  beforeAll(() => {
    userCredentialsDBAccess = new UserCredentialsDbAccess();
  })

  test('should reach the server', async () => {
    const response = await axios.default.options(serverUrl);
    expect(response.status).toBe(HTTP_CODES.OK);
  });

  test('should reject invalid credentials', async () => {
    const response = await axios.default.post(
      serverUrl + '/login',
      { 'username': 'someWrongUsername', 'password': 'any'}  
    );
    expect(response.status).toBe(HTTP_CODES.NOT_fOUND);
  });

  test('should login successfully with the correct credentials', async () => {
    const response = await axios.default.post(
      serverUrl + '/login',
      { 'username': itestUserCredentials.username, 'password': itestUserCredentials.password}  
    );
    expect(response.status).toBe(HTTP_CODES.CREATED);
    sessionToken = response.data;
  });

  test('should query data', async () => {
    const response = await axios.default.get(
      serverUrl + '/users?name=some',
      { headers: { Authorization: sessionToken.tokenId }}
    ); 
    expect(response.status).toBe(HTTP_CODES.OK);
  });

  test('query data with invalid token', async () => {
    const response = await axios.default.get(
      serverUrl + '/users?name=some',
      { headers: { Authorization: sessionToken.tokenId + 'someTrash' }}
    ); 
    expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED);
  });
  
});
