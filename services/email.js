'use strict';
const nodemailer = require('nodemailer');

module.exports = {
  sendResetPassMail
};

function sendResetPassMail(to, content) {
  return new Promise(function (resolve, reject) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        reject(err);
      } else {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host  : 'smtp.ethereal.email',
          port  : 587,
          secure: false, // true for 465, false for other ports
          auth  : {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
          from   : '"about oa " <duoyi@henhaoji.com>', // sender address
          to     : to, // list of receivers
          subject: 'reset password ✔', // Subject line
          // text   : content, // plain text body
          html   : content // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            // console.log('Message sent: %s', info.messageId);
            // // Preview only available when sending through an Ethereal account
            // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            resolve(nodemailer.getTestMessageUrl(info));
          }
        });
      }
    });
  });
}

