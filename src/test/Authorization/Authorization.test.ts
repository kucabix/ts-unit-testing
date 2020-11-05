import { Authorizer } from 'app/Authorization/Authorizer'
import { SessionTokenDBAccess } from 'app/Authorization/SessionTokenDBAccess';
import { UserCredentialsDbAccess } from 'app/Authorization/UserCredentialsDbAccess';
import { Account, SessionToken, TokenState } from 'app/Models/ServerModels';

jest.mock('app/Authorization/SessionTokenDBAccess');
jest.mock('app/Authorization/UserCredentialsDbAccess');

const someAccount: Account = {
  username: 'someUser',
  password: 'password'
}

describe('Authorizer test suite', () => {
  let authorizer: Authorizer;

  const sessionTokenDBAccessMock = {
    storeSessionToken: jest.fn(),
    getToken: jest.fn()
  };
  const userCredentialsDbAccessMock = {
    getUserCredential: jest.fn()
  };

  beforeEach(() => {
    authorizer = new Authorizer(
      sessionTokenDBAccessMock as any,
      userCredentialsDbAccessMock as any
    )
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test('constructor arguments', () => {
    new Authorizer();
    expect(SessionTokenDBAccess).toBeCalledTimes(1);
    expect(UserCredentialsDbAccess).toBeCalledTimes(1);
  });
  
  describe('login user test suite', () => {
    test('should return null for invalid credentials', async () => {
      userCredentialsDbAccessMock.getUserCredential.mockReturnValueOnce(null);
      const loginResult = await authorizer.generateToken(someAccount);
      expect(loginResult).toBeNull;
      expect(userCredentialsDbAccessMock.getUserCredential).toBeCalledWith(
        someAccount.username, someAccount.password
      );
    })
    
    test('should return sessionToken for valid credentials', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);
      jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);
      userCredentialsDbAccessMock.getUserCredential.mockResolvedValueOnce({
        username: 'someUser',
        accessRights: [1,2,3]
      });
      const expectedSessionToken: SessionToken = {
        userName: 'someUser',
        accessRights: [1,2,3],
        valid: true,
        tokenId: '',
        expirationTime: new Date(60 * 60 * 1000)
      }
      const sessionToken = await authorizer.generateToken(someAccount);
      expect(expectedSessionToken).toEqual(sessionToken);
      expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(sessionToken);
    });
  });

  describe('validateToken tests', () => {
    test('should return valid access rights and state for valid token', async () => {
      const dateInFuture = new Date(Date.now() + 100000);
      sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
        valid: true,
        expirationTime: dateInFuture,
        accessRights: [1,2,3]
      });
      const sessionToken = await authorizer.validateToken('');
      expect(sessionToken).toStrictEqual({
        accessRights: [1,2,3],
        state: TokenState.VALID
      });
    });

    test('should return invalid state and empty access rights for invalid token', async () => {
      sessionTokenDBAccessMock.getToken.mockReturnValueOnce(null);
      const sessionToken = await authorizer.validateToken('');
      expect(sessionToken).toStrictEqual({
        accessRights: [],
        state: TokenState.INVALID
      });
    });
    
    test('should return expired state for the expired token', async () => {
      const dateInPast = new Date(Date.now() - 1);
      sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
        valid: true,
        expirationTime: dateInPast
      });
      const sessionToken = await authorizer.validateToken('');
      expect(sessionToken).toStrictEqual({
        accessRights: [],
        state: TokenState.EXPIRED
      });
    });
    
  });
    
});
