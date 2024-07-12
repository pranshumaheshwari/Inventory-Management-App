import { createTransport } from 'nodemailer'

const transporter = createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
        user: "sandeep@vistaarauto.com",
        pass: process.env.VISTAARAUTO_MAIL_PASSWORD
    }
})

export default transporter
