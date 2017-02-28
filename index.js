const HttpStatus = require('http-status-codes');
const mailgun = require('mailgun.js');
const { send, json } = require('micro');
const isEmpty = require('lodash/isEmpty');
const nl2br  = require('nl2br');
const microCors = require('micro-cors');
const cors = microCors({ allowMethods: ['POST'] });
const config = require('./config');

const mg = mailgun.client({
  username: 'api',
  key: config.MAILGUN_KEY,
  public_key: config.MAILGUN_PUBLICKEY,
});

const isValid = data => (
  !isEmpty(data) && !isEmpty(data.email) && !isEmpty(data.name) && !isEmpty(data.message)
);

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return send(res, HttpStatus.METHOD_NOT_ALLOWED);
  }
  const data = await json(req);
  if (!isValid(data)) {
    return send(res, HttpStatus.BAD_REQUEST, { message: 'Invalid Data' });
  }

  try {
    const html = nl2br(data.message);
    mg.messages.create('podzim.co', {
      from: `${data.name} <${data.email}>`,
      to: ['long@podzim.co'],
      subject: `[podzim.co] New message from ${data.name}`,
      text: data.message,
      html: `<p>${html}</p>`
    })
  } catch (e) {
    /* handle error */
    return send(res, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return send(res, HttpStatus.OK);
}

module.exports = cors(handler);

