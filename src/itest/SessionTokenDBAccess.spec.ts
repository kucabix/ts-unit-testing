import { SessionTokenDBAccess } from 'app/Authorization/SessionTokenDBAccess';
import { SessionToken } from 'app/Models/ServerModels';

describe('SessionTokenDBAccess itest suite', () => {
  let sessionTokenDBAccess: SessionTokenDBAccess;
  let someSessionToken: SessionToken;

  const randomString = Math.random().toString(36).substring(7);

  beforeAll(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess();
    someSessionToken = {
      accessRights: [1,2,3],
      expirationTime: new Date(),
      tokenId: 'someTokenId' + randomString,
      userName: 'user',
      valid: true
    }
  });

  test('should store and retrieve SessionToken', async () => {
    await sessionTokenDBAccess.storeSessionToken(someSessionToken);
    const resultToken = await sessionTokenDBAccess.getToken(someSessionToken.tokenId);
    expect(resultToken).toMatchObject(someSessionToken);
  });
  
  test('should delete SessionToken', async () => {
    await sessionTokenDBAccess.deleteToken(someSessionToken.tokenId);
    const resultToken = await sessionTokenDBAccess.getToken(someSessionToken.tokenId);
    expect(resultToken).toBeUndefined();
  });
  
  test('should throw an error when passing the wrong token while deleting SessionToken', async () => {
    try {
      await sessionTokenDBAccess.deleteToken('123');      
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'No such tokenId in the DB!');
    }
  });
  
  
})
