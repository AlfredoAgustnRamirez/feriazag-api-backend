// Mock de Request de Express
class MockRequest {
  constructor() {
    this.params = {};
    this.body = {};
    this.query = {};
    this.headers = {};
    this.file = null;
    this.files = [];
    this.usuario = null;
    this.ip = '127.0.0.1';
    this.method = 'GET';
    this.url = '/';
  }

  static create(overrides = {}) {
    const req = new MockRequest();
    Object.assign(req, overrides);
    return req;
  }
}

// Mock de Response de Express
class MockResponse {
  constructor() {
    this.statusCode = 200;
    this._status = null;
    this._json = null;
    this._send = null;
    this.headers = {};
  }

  status(code) {
    this.statusCode = code;
    this._status = code;
    return this;
  }

  json(data) {
    this._json = data;
    return this;
  }

  send(data) {
    this._send = data;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  static create() {
    const res = new MockResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  }
}

// Mock de NextFunction
const mockNext = jest.fn();

// Fábrica para crear mocks de servicios
const createMockService = (methods = []) => {
  const mock = {};
  methods.forEach(method => {
    mock[method] = jest.fn();
  });
  return mock;
};

// Fábrica para crear mocks de modelos
const createMockModel = (methods = ['find', 'findById', 'create', 'update', 'delete']) => {
  const mock = {};
  methods.forEach(method => {
    mock[method] = jest.fn();
  });
  return mock;
};

module.exports = {
  MockRequest,
  MockResponse,
  mockNext,
  createMockService,
  createMockModel
};