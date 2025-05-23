const xml2js = require('xml2js');

// Sanitize keys in an object to ensure they are safe for use.
function sanitizeForXml(obj) {
  // If object has only numeric keys in order, convert to array.
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const keys = Object.keys(obj);
    // Check if all keys are numeric.
    if (keys.every(k => /^\d+$/.test(k))) {
      const arr = [];
      keys.sort((a, b) => a - b).forEach(k => {
        // Sanitize each value in the object.
        arr.push(sanitizeForXml(obj[k]));
      });
      return arr;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForXml);
  }

  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      let safeKey = key
        .replace(/[^a-zA-Z0-9_:-]/g, '_')
        .replace(/^[^a-zA-Z_]/, '_');

      if (safeKey.toLowerCase().startsWith('xml')) {
        safeKey = `_${safeKey}`;
      }

      result[safeKey] = sanitizeForXml(obj[key]);
    }
    return result;
  }

  return obj;
}

class Response {
  constructor(code, toCache = false, msg = null, data = null){
    // Set the default values for the response.
    this.code = code;
    this.toCache = toCache;
    this.message = msg;
    this.data = data;
    this.response = {};
  
    // Switch the status code.
    if(!msg){
      switch(code){
        case 200:
          this.message = '✅ OK';
          break;
        case 201:
          this.message = '✅ OK, Resource Created!';
          break;
        case 400:
          this.message = '⛔ Error, Bad Request!';
          break;
        case 401:
          this.message = '⛔ Error, Authenticaion Required!';
          break;
        case 403:
          this.message = '⛔ Error, Forbidden Resource!';
          break;
        case 404:
          this.message = '⛔ Error, Resource Not Found!';
          break;
        case 405:
          this.message = '⛔ Error, Request Not Supported!';
          break;
        case 409:
          this.message = '⛔ Error, Resource Conflict!';
          break;
        case 500:
          this.message = '⛔ Internal Server Error!';
          break;
        default:
          this.message = '⚠️ Unknown Status Code!';
          break;
      }
    }
  }

  // Send the response.
  send(res) {
    if(this.toCache)
      res.setHeader('Cache-Control', 'max-age=60');
    else
      res.setHeader('Cache-Control', 'no-store');
    
    this.response = {
      status: this.code,
      message: this.message
    };

    if(this.data){
      this.response.data = this.data;
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(this.code).json(this.response);
  }
}

// Extension of the Response class to send XML responses.
class XMLResponse extends Response {
  send(res) {
    if (this.toCache) {
      res.setHeader('Cache-Control', 'max-age=60');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }

    const rawResponse = {
      status: this.code,
      message: this.message,
      ...(this.data ? { data: this.data } : {})
    };

    const safeResponse = sanitizeForXml(rawResponse);

    const builder = new xml2js.Builder({
      rootName: 'response',
      headless: false,
      renderOpts: { pretty: true }
    });

    let responseAsXML;
    try {
      responseAsXML = builder.buildObject(safeResponse);
    } catch (err) {
      console.error('❌ Failed to build XML:', err);
      res.status(500).send('<response><error>Internal Server Error</error></response>');
      return;
    }

    res.setHeader('Content-Type', 'application/xml;charset=utf-8');
    res.status(this.code).send(responseAsXML);
  }
}

module.exports = {Response, XMLResponse};