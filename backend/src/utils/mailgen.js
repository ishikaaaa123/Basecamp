import Mailgen from "mailgen";
import nodeMailer from "nodemailer";

const sendEmail = async(options)=>{
    const mailGenerator = new Mailgen({
        theme: "default",//This tells Mailgen to use its default email design.
        product:{//This defines information about your application.
            name:"task manager",
            link:"https://taskmanagerlink.com"
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
        //A transporter is an object that handles the connection to your 
        // email service and sends messages on your behalf. 
        // You create one transporter and reuse it for all your emails.
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
            //Logs into Mailtrap using your credentials.
        }
        //Connect to sandbox.smtp.mailtrap.io (host)
        // Enter through port 2525
        // Log in using user and pass
        // Submit the email
        // Mailtrap stores that email in your Mailtrap Inbox
    })

    const mail = {//This object contains everything that should be sent.
        from: "team@example.com", // sender address
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
                intro: "Hello ji! Welcome to Project Camp ji",
                action: {
                    instructions: "To verify your email, click the button below:",
                    button: {
                        color: "#00FF00",
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
                    color:"#00FF00",
                    text: "Reset Password",
                    link: verificationURl
                }
            },
            outro:"Need help, or have questions? Just reply to this email, will help!!"
        }
    }
}

export {forgotPassowrdMailgenContent, emailVerifyMailgenContent, sendEmail};