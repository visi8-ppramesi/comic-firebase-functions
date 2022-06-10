/* eslint-disable camelcase */

module.exports = function(req, res, next) {
  const crypto = require("crypto");
  const hash = crypto.createHash("sha512");
  const {order_id, status_code, gross_amount, signature_key} = req.body;
  // eslint-disable-next-line max-len
  const textToHash = order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY;
  const hashed = hash.update(textToHash).digest("hex");
  if (hashed == signature_key) {
    next();
  } else {
    res.status(500).send("unauthenticated");
  }
};
