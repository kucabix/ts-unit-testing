import { UserCredentialsDbAccess } from 'app/Authorization/UserCredentialsDbAccess'
import { UserCredentials } from 'app/Models/ServerModels';

describe('User Credentials test suite', () => {
  let userCredentialsDBAccess: UserCredentialsDbAccess;

  const username =  'user';
  const password = 'pass';

  const someCredentials: UserCredentials = {
    accessRights: [1,2,3],
    username,
    password
  }

  const nedbMock = {
    insert: jest.fn(),
    find: jest.fn(),
    loadDatabase: jest.fn()
  }

  beforeEach(() => {
    userCredentialsDBAccess = new UserCredentialsDbAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });
  afterEach(() => {
    jest.clearAllMocks()
  });

  test('putUserCredential without error', async () => {
    nedbMock.insert.mockImplementationOnce(
      (err, callback: any) => callback(null, someCredentials) 
    );
    const resultCredentials = await userCredentialsDBAccess.putUserCredential(someCredentials);
    expect(resultCredentials).toEqual(someCredentials);
    expect(nedbMock.insert).toBeCalledWith(someCredentials, expect.any(Function));
  });

  test('putUserCredentials with error message', async () => {
    nedbMock.insert.mockImplementationOnce(
      (err, callback: any) => callback(new Error('error'), null) 
    );
    await expect(userCredentialsDBAccess.putUserCredential(someCredentials)).rejects.toThrowError('error');
    expect(nedbMock.insert).toBeCalledWith(someCredentials, expect.any(Function));
  });

  test('getUserCredential without error and with the data', async () => {
    nedbMock.find.mockImplementationOnce(
      (err, callback: any) => callback(null, [someCredentials]) 
    );
    const resultCredentials = await userCredentialsDBAccess.getUserCredential(username, password);
    expect(resultCredentials).toEqual(someCredentials);
    expect(nedbMock.find).toBeCalledWith({username, password}, expect.any(Function));
  });

  test('getUserCredential without error and without any data', async () => {
    nedbMock.find.mockImplementationOnce(
      (err, callback: any) => callback(null, []) 
    );
    const resultCredentials = await userCredentialsDBAccess.getUserCredential('username', 'password');
    expect(resultCredentials).toBeNull;
    expect(nedbMock.find).toBeCalledWith({username: 'username', password: 'password'}, expect.any(Function));
  });
  
  test('getUserCredentials with error message', async () => {
    nedbMock.find.mockImplementationOnce(
      (err, callback: any) => callback(new Error('error'), null) 
    );
    await expect(userCredentialsDBAccess.getUserCredential('' , '')).rejects.toThrowError('error');
    expect(nedbMock.find).toBeCalledWith({username: '', password: ''}, expect.any(Function));
  });
})
