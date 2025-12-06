
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/send-email', async (req, res) => {
    const { email, image } = req.body;

    if (!email || !image) {
        return res.status(400).send('Missing email or image data.');
    }

    try {
        // Create a test account with Ethereal.email
        let testAccount = await nodemailer.createTestAccount();

        // Create a transporter with the test account
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Family Tree App" <noreply@familytree.com>',
            to: email,
            subject: 'Your Family Tree Screenshot',
            html: '<p>Here is your family tree screenshot.</p>',
            attachments: [
                {
                    filename: 'family-tree.png',
                    content: image.split(';base64,').pop(),
                    encoding: 'base64',
                },
            ],
        });

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.send(`Email sent successfully! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email.');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
