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

exports.rateLimitedFormSubmission = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown IP';
    const subscriber = req.body;  // Assuming the subscriber data is in the request body
    const ref = admin.firestore().collection('rateLimits').doc(ip.toString());
    const subscriberRef = admin.firestore().collection('subscribers');
    const now = new Date().getTime();
    const limit = 5; // Max 5 requests
    const timeWindow = 900000; // 15 minutes in milliseconds

    try {
      await admin.firestore().runTransaction(async (transaction) => {
        const doc = await transaction.get(ref);

        if (doc.exists) {
          const data = doc.data() || {};
          const timePassed = now - data.timestamp;

          if (timePassed < timeWindow && data.count >= limit) {
            res.status(429).send('Rate limit exceeded');
            return;
          }

          // Update the rate limit count
          if (timePassed < timeWindow) {
            transaction.update(ref, { count: data.count + 1 });
          } else {
            transaction.set(ref, { count: 1, timestamp: now });
          }

          // Add subscriber to the database
          await transaction.set(subscriberRef.doc(), subscriber);
        } else {
          transaction.set(ref, { count: 1, timestamp: now });
          await transaction.set(subscriberRef.doc(), subscriber);
        }
      });

      res.json({ message: 'Form submitted successfully' });
    } catch (error) {
      console.error('Error processing request', error);
      res.status(500).send('Internal Server Error');
    }
  });
});

export const handleIncomingMessages = functions.https.onRequest(async (req, res) => {
  console.log('Received request:', req.body);  // Log the incoming request body
  const phoneNumber = req.body.originator;
  const messageContent = req.body.payload;

  if (!phoneNumber || !messageContent) {
    console.error('Missing phone number or message content.');
    res.status(400).send('Bad Request: Missing phone number or message content.');
    return;
  }

  if (messageContent.trim().toUpperCase() === 'UNSUBSCRIBE') {  // Change keyword to "UNSUBSCRIBE"
    try {
      console.log(`Searching for subscriber with phone number: ${phoneNumber}`);
      // Find the subscriber by phone number
      const subscribersSnapshot = await admin.firestore().collection('subscribers').where('phone', '==', phoneNumber).get();

      if (subscribersSnapshot.empty) {
        console.log(`No subscriber found with phone number: ${phoneNumber}`);
        res.status(404).send('Subscriber not found.');
        return;
      }

      const batch = admin.firestore().batch();
      subscribersSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Deleted subscriber with phone number: ${phoneNumber}`);
      res.status(200).send('Subscriber deleted.');
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      res.status(500).send('Error deleting subscriber.');
    }
  } else {
    res.status(200).send('No action required.');
  }
});
