import { Utils } from 'app/Utils/Utils';
import { IncomingMessage } from 'http';

describe('Utils test suite', () => {

  test('getReqestPath valid request', () => {
    const request = {
      url: 'http://localhost:8080/login'
    } as IncomingMessage
    
    const resultPath = Utils.getRequestBasePath(request);
    expect(resultPath).toBe('login');
  });

  test('getReqestPath with no path name', () => {
    const request = {
      url: 'http://localhost:8080/'
    } as IncomingMessage
    
    const resultPath = Utils.getRequestBasePath(request);
    expect(resultPath).toBeFalsy();
  });

  test('getReqestPath with the empty path', () => {
    const request = {
      url: ''
    } as IncomingMessage
    
    const resultPath = Utils.getRequestBasePath(request);
    expect(resultPath).toBeFalsy();
  });
})