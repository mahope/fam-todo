// Jest setup for Node.js environment (API tests)

// Mock Request and Response if not available
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.body = init?.body;
    }

    json() {
      return JSON.parse(this.body || '{}');
    }

    formData() {
      return this.body;
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Map(Object.entries(init?.headers || {}));
    }

    json() {
      return JSON.parse(this.body || '{}');
    }
  };
}

// Mock FormData
if (typeof FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }

    append(name, value) {
      this.data.set(name, value);
    }

    get(name) {
      return this.data.get(name);
    }
  };
}

// Mock File
if (typeof File === 'undefined') {
  global.File = class File {
    constructor(content, name, options = {}) {
      this.content = content;
      this.name = name;
      this.type = options.type || 'application/octet-stream';
      this.size = Array.isArray(content) ? content.reduce((size, chunk) => {
        if (chunk instanceof ArrayBuffer) return size + chunk.byteLength;
        if (typeof chunk === 'string') return size + chunk.length;
        return size;
      }, 0) : 0;
    }

    arrayBuffer() {
      return Promise.resolve(this.content[0] || new ArrayBuffer(0));
    }
  };
}

// Mock crypto for tests
if (typeof crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
  };
}