const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

const generateChallanPDF = async (challan) => {
  // fallback helpers
  const safe = (value) => (value !== undefined && value !== null ? value : 'N/A');

  const qrData = `Challan ID: ${safe(challan._id)}\nAmount: ₹${safe(challan.fineAmount)}\nStatus: ${safe(challan.paymentStatus)}`;
  const qrCodeImage = await QRCode.toDataURL(qrData);

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; }
          .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .field { margin-bottom: 10px; }
          .qr { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">Railway Fine Challan</div>
        <div class="field">Passenger Name: ${safe(challan.passengerName)}</div>
        <div class="field">Challan Id: ${safe(challan._id)}</div>
        <div class="field">Train Number: ${safe(challan.trainNumber)}</div>
        <div class="field">Reason: ${safe(challan.reason)}</div>
        <div class="field">Fine Amount: ₹${safe(challan.fineAmount)}</div>
        <div class="field">Issued By: ${safe(challan.issuedBy?.name)}</div>
        <div class="field">Issued At: ${safe(new Date(challan.issuedAt).toLocaleString())}</div>
        <div class="field">
          Payment Status: <strong style="color:${challan.paid ? 'green' : 'red'}">
          ${challan.paid ? 'Paid' : 'Unpaid'}
          </strong>
        </div>
        <div class="qr"><img src="${qrCodeImage}" alt="QR Code" /></div>
        <div>
          <h4>TTE Signature:</h4>
            <img src="${challan.signature}" alt="Signature" style="width:150px; height:auto; border:1px solid #ccc;" />
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();
  return pdfBuffer;
};

module.exports = generateChallanPDF;
