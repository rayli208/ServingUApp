import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import * as Excel from 'exceljs';
import * as cors from 'cors';

// Initialize Firebase Admin SDK
admin.initializeApp();

const corsHandler = cors({
  origin: 'https://servingu.agency'
});

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'servinguagency@gmail.com',
    pass: 'rilfzrbstnvlmbir'
  },
});

export const sendEmail = functions.https.onCall(async (data, context) => {
  const mailOptions = {
    from: 'ServingU <servinguagency@gmail.com>',
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  };

  try {
    await mailTransport.sendMail(mailOptions);
    console.log('Mail sent to: ' + data.to);
    return { success: true };
  } catch (error) {
    let errorMessage = 'An error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('There was an error while sending the email:', errorMessage);
    return { error: errorMessage };
  }
});

export const generateUserReports = functions.https.onRequest(async (request, response) => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('User Reports');

  worksheet.columns = [
    { header: 'Location Name', key: 'locationName', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Phone Number', key: 'phone', width: 15 },
    { header: 'Address', key: 'address', width: 25 },
    { header: 'Account Type', key: 'accountType', width: 15 },
    { header: 'Texts This Month', key: 'textsThisMonth', width: 18 },
    { header: 'Emails This Month', key: 'emailsThisMonth', width: 18 },
    { header: 'Total Employees', key: 'totalEmployees', width: 15 },
  ];

  const usersSnapshot = await admin.firestore().collection('users').get();

  usersSnapshot.docs.forEach(doc => {
    const userData = doc.data();
    worksheet.addRow({
      locationName: userData.location_name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      accountType: userData.accountType,
      textsThisMonth: userData.textsThisMonth,
      emailsThisMonth: userData.emailsThisMonth,
      totalEmployees: userData.totalEmployees, // assuming this data is directly available
    });
  });

  const timestamp = new Date();
  const formattedDate = `${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.getDate().toString().padStart(2, '0')}-${timestamp.getFullYear()}`;
  const fileName = `UserReports-${formattedDate}.xlsx`;

  response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  workbook.xlsx.write(response).then(() => {
    response.status(200).end();
  }).catch(error => {
    console.error('Error streaming the Excel file:', error);
    response.status(500).send('Error generating the report');
  });
});

export const resetCounts = functions.https.onRequest(async (request, response) => {
  const auth = { login: 'admin', password: 'YRNJR6969' };  // Be cautious about exposing sensitive information
  const b64auth = (request.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login !== auth.login || password !== auth.password) {
    response.set('WWW-Authenticate', 'Basic realm="401"');  // Challenge and response for basic auth
    response.status(401).send('Authentication required.');
    return;
  }

  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.get();
  const batch = admin.firestore().batch();

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { textsThisMonth: 0, emailsThisMonth: 0 });
  });

  await batch.commit();
  response.send("Counts reset successfully");
});

// New function to add IP-based rate limiting
exports.rateLimitedFormSubmission = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
      if (req.method === 'OPTIONS') {
          res.status(200).send(); // Responding to preflight request
          return;
      }

      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log('IP:', ip); // Log IP for rate limiting
      const ref = admin.firestore().collection('rateLimits').doc(ip.toString());
      const now = new Date().getTime();
      const limit = 5; // Max 5 requests
      const timeWindow = 900000; // 15 minutes in milliseconds

      admin.firestore().runTransaction(async (transaction) => {
          const doc = await transaction.get(ref);
          if (doc.exists) {
              const data = doc.data()!;
              const timePassed = now - data.timestamp;

              if (timePassed < timeWindow) {
                  if (data.count >= limit) {
                      res.status(429).send('Rate limit exceeded');
                      return;
                  } else {
                      transaction.update(ref, { count: data.count + 1, timestamp: now });
                  }
              } else {
                  transaction.set(ref, { count: 1, timestamp: now });
              }
          } else {
              transaction.set(ref, { count: 1, timestamp: now });
          }
          // Logic to handle the form submission
          res.send('Form submitted successfully');
      }).catch(error => {
          console.error('Error processing request', error);
          res.status(500).send('Error processing request');
      });
  });
});