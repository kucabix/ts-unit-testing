import { SessionTokenDBAccess } from 'app/Authorization/SessionTokenDBAccess'
import { SessionToken } from 'app/Models/ServerModels';

describe('SessionToken DB Access test suite', () => {
  let sessionTokenDBAccess: SessionTokenDBAccess;
  const someToken: SessionToken = {
    accessRights: [],
    expirationTime: new Date(),
    tokenId: '123',
    userName: 'John',
    valid: true
  };
  const someTokenId = '123';
  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn()
  };

  beforeEach(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('store sessionToken without error', async () => {
    nedbMock.insert.mockImplementationOnce(
      (someToken: any, callback: any) => { callback() }
    )
    await sessionTokenDBAccess.storeSessionToken(someToken);
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function));
  })

  test('store sessionToken with error', async () => {
    nedbMock.insert.mockImplementationOnce(
      (someToken: any, callback: any) => { callback(new Error('Something went wrong!')) }
    )
    await expect(sessionTokenDBAccess.storeSessionToken(someToken)).rejects.toThrowError('Something went wrong!');
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function));
  })

  test('get token without error and with the result', async () => {
    nedbMock.find.mockImplementationOnce(
      (someTokenId: string, callback: any) => {
        callback(null, [someToken])
      }
    )
    const getTokenResult = await sessionTokenDBAccess.getToken(someTokenId);
    expect(getTokenResult).toBe(someToken);
    expect(nedbMock.find).toBeCalledWith({tokenId: someTokenId }, expect.any(Function));
  })

  test('get token without error and without the result', async () => {
    nedbMock.find.mockImplementationOnce(
      (someTokenId: string, callback: any) => {
        callback(null, [])
      }
    )
    const getTokenResult = await sessionTokenDBAccess.getToken('1234');
    expect(getTokenResult).toBeUndefined();
    expect(nedbMock.find).toBeCalledWith({tokenId: '1234' }, expect.any(Function));
  })
  
  test('get token throws an error and gives no result', async () => {
    nedbMock.find.mockImplementationOnce(
      (someTokenId: string, callback: any) => {
        callback(new Error('something went wrong'), [])
      }
    );
    await expect(sessionTokenDBAccess.getToken(someTokenId)).rejects.toThrowError('something went wrong');
    expect(nedbMock.find).toBeCalledWith({tokenId: someTokenId }, expect.any(Function));
  })
  
  
})
