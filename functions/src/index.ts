import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import * as Excel from 'exceljs';

// Initialize Firebase Admin SDK
admin.initializeApp();

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

// Generate User Reports
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

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    const employeesSnapshot = await admin.firestore().collection('employees')
      .where('uid', '==', userData.uid).get();
    const totalEmployees = employeesSnapshot.size;

    worksheet.addRow({
      locationName: userData.location_name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      accountType: userData.accountType,
      textsThisMonth: userData.textsThisMonth,
      emailsThisMonth: userData.emailsThisMonth,
      totalEmployees: totalEmployees,
    });
  }

  const timestamp = new Date();
  const formattedDate = `${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.getDate().toString().padStart(2, '0')}-${timestamp.getFullYear()}`;
  const formattedTime = `${timestamp.getHours().toString().padStart(2, '0')}${timestamp.getMinutes().toString().padStart(2, '0')}${timestamp.getSeconds().toString().padStart(2, '0')}`;
  const fileName = `UserReports-${formattedDate}-${formattedTime}.xlsx`;

  response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  workbook.xlsx.write(response).then(() => {
    response.status(200).end();
  }).catch(error => {
    console.error('Error streaming the Excel file:', error);
    response.status(500).send({ error: 'Error generating the report' });
  });
});

//Reset count for emails and texts
export const resetCounts = functions.https.onRequest(async (request, response) => {
  // Use Basic Authentication to secure this function
  // You may want to replace this with a more secure method in production
  const auth = { login: 'admin', password: 'YRNJR6969' };
  const b64auth = (request.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (!login || !password || login !== auth.login || password !== auth.password) {
    response.set('WWW-Authenticate', 'Basic realm="401"');
    response.status(401).send('Authentication required.');
    return;
  }

  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.get();
  const batch = admin.firestore().batch();

  snapshot.forEach(doc => {
    batch.update(doc.ref, { textsThisMonth: 0, emailsThisMonth: 0 });
  });

  await batch.commit();
  response.send("Counts reset successfully");
});