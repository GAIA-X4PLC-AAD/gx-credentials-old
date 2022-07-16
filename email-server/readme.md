# Email Server

This is currently a dummy email server that works as a witness for the Email Credential. The server is responsible for:
- Sending challenges to a given address
- Storing the sent challenges (currently in a Redis store)
- Verifying the challenges
The server currently uses nodemailer library for sending emails and Ethereal (a fake SMTP service).

# Setup
1. Run npm i inside the directory
2. Set MAIL_SERVER_USER and MAIL_SERVER_PWD values in your .env file (create Ethereal account here https://ethereal.email/create)
3. Run node index.js to serve the email server on http://localhost:8081