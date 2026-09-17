export class HttpRequest {
  toaster;

  constructor(toaster) {
    this.toaster = toaster;
  }

  async get(url) {
    const response = await fetch(url);
    if (!response.ok) {
      const message = await response.json();
      console.error(message);
      this.toaster.error(message.message, 'Fout', { timeOut: 30000 });
      throw Error(message.message);
    } else {
      return this.getResponseBody(response);
    }
  }

  async put(url, body = {}, headers = {}) {
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        ...headers,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    if (!response.ok) {
      const message = await response.json();
      console.error(message);
      this.toaster.error(message.message, 'Fout', { timeOut: 30000 });
      throw Error(message.message);
    } else {
      return this.getResponseBody(response);
    }
  }

  async post(url, body, headers = {}) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        ...headers,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    if (!response.ok) {
      const message = await response.json();
      console.error(message);
      this.toaster.error(message.message, 'Fout', { timeOut: 30000 });
      throw Error(message.message);
    } else {
      return this.getResponseBody(response);
    }
  }

  async delete(url) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
    if (!response.ok) {
      const message = await response.json();
      console.error(message);
      this.toaster.error(message.message, 'Fout', { timeOut: 30000 });
      throw Error(message.message);
    }
  }

  async getResponseBody(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }
}
