import Mailgen from "mailgen";
import nodeMailer from "nodemailer";

const sendEmail = async(options)=>{
    const mailGenerator = new Mailgen({
        theme: "default",//This tells Mailgen to use its default email design.
        product:{//This defines information about your application.
            name:"PROJECT BASECAMP",
            link:"https://projectBasecamp.com"
        }
         //The generated email may automatically include:
        // Task Manager:
        // https://taskmanagerlink.com
        // It acts like your application's branding.
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    //Mailgen converts your content into plain text.Plain text emails work
    // even if HTML is disabled.
    const emailHTML = mailGenerator.generate(options.mailgenContent);
    //This creates the HTML version.Most email clients display this HTML version.

    const transporter = nodeMailer.createTransport({
        // Gmail SMTP uses STARTTLS on port 587. Keep all credentials in .env.
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        // Fail before the frontend request timeout when SMTP is unreachable.
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 8000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 8000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000),
        auth:{
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    const mail = {//This object contains everything that should be sent.
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: options.email,
        subject: options.subject, // subject line
        text: emailTextual, // plain text body
        html: emailHTML, // HTML body
    }

    try {
        const info = await transporter.sendMail(mail);
        return info;
    } catch (error) {
        console.error("error occured!! email service failed",error.message);
        throw error;
    }

    //This line does several things:
    // Step 1
    // Connect to Mailtrap SMTP server.
    // ↓
    // Step 2
    // Authenticate using username and password.
    // ↓
    // Step 3
    // Upload the email data.
    // ↓
    // Step 4
    // Mailtrap receives the email.
    // ↓
    // Step 5
    // Store response in info.
    }

    const emailVerifyMailgenContent = (username, verificationURL) => {
        return {
            body: {
                name: username,
                intro: "Welcome to Project Camp",
                action: {
                    instructions: "To verify your email, click the button below:",
                    button: {
                        color: "#2563EB",
                        text: "Verify Email",
                        link: verificationURL
                    }
                },
                outro: "Need help or have questions? Just reply to this email, we'll help!"
            }
        };
    };
const forgotPassowrdMailgenContent = (username,verificationURl)=>{
    return {
        body : {
            name:username,
            intro: "Hello ji! Welcome to Project Camp ji, we got to know u wanna change ur password ji?",
            action:{
                instructions:"To change ur password,click on link below:",
                button:{
                    color:"#00008B",
                    text: "Reset Password",
                    link: verificationURl
                }
            },
            outro:"Need help, or have questions? Just reply to this email, will help!!"
        }
    }
}

export {forgotPassowrdMailgenContent, emailVerifyMailgenContent, sendEmail};
