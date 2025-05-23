const {randomUUID} = require('crypto');
const {Response, XMLResponse} = require('../models/Response');

// Generate a random UUID (Universally Unique Identifier).
function generateUUID(){
  return randomUUID();
}

// Send a response based off of the 'content-type' request header.
async function sendResponse(req, res, status, cache = false, message = null, data = null){
  if(req.headers['content-type'] === 'application/xml'){
    const response = new XMLResponse(status, cache, message, data);
    return response.send(res);
  }else{
    const response = new Response(status, cache, message, data);
    return response.send(res);
  }
}

module.exports = {
  generateUUID,
  sendResponse
}