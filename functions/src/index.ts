import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

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
