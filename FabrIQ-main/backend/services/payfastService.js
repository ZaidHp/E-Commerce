const crypto = require('crypto');
const querystring = require('querystring');

class PayFastService {
  constructor() {
    this.merchant_id = process.env.PAYFAST_MERCHANT_ID;
    this.merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    this.passphrase = process.env.PAYFAST_PASSPHRASE;
    this.sandbox = true;
  }

  generateSignature(data) {
    // Sort the data alphabetically by key
    const orderedData = {};
    Object.keys(data).sort().forEach(key => {
      orderedData[key] = data[key];
    });

    // Create parameter string
    let parameterString = querystring.stringify(orderedData);
    
    // Add passphrase if it exists
    if (this.passphrase) {
      parameterString += `&passphrase=${this.passphrase}`;
    }

    // Create MD5 hash
    return crypto.createHash('md5').update(parameterString).digest('hex');
  }

  generatePaymentData(order) {
    const baseUrl = this.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process' 
      : 'https://www.payfast.co.za/eng/process';

    const data = {
      merchant_id: this.merchant_id,
      merchant_key: this.merchant_key,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL}/api/payments/notify`,
      name_first: order.user.firstName,
      name_last: order.user.lastName,
      email_address: order.user.email,
      m_payment_id: order.orderId,
      amount: order.amount.toFixed(2),
      item_name: `Order #${order.orderId}`,
      item_description: `Purchase from ${order.businessName}`,
    };

    // Generate signature
    data.signature = this.generateSignature(data);

    return {
      url: baseUrl,
      data: data
    };
  }
}

module.exports = new PayFastService();