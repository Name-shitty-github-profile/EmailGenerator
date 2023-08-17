const fs = require('fs');
const dns = require('dns');
const net = require('net');
let emails = [];
if (!fs.existsSync('emails.txt')) {
    fs.writeFileSync('emails.txt', '');
    emails = [];
} else {
    emails = fs.readFileSync('emails.txt', 'utf8').split('\n');
}
let currentLength = emails[emails.length - 1].split('@')[0].length;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const domains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com'
];
let validEmails = 0;
let validEmailss = 0;

async function verifyEmail(email) {
    const domain = email.split('@')[1];
    try {
        const mxRecords = await dns.promises.resolveMx(domain);
        const mxServer = mxRecords[0].exchange;
        const socket = net.connect(25, mxServer);
        return new Promise((resolve) => {
            socket.on('connect', () => {
                socket.write(`VRFY ${email}\r\n`);
            });
            
            socket.on('data', (data) => {
                if (data.toString().includes('250')) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                socket.end();
            });
            
            socket.on('error', () => {
                resolve(false);
            });
        });
    } catch (error) {
        console.log('Error:', error);
    }
}

function verifyEmailSync(email) {
    return new Promise((resolve, reject) => {
        verifyEmail(email).then(result => {
            resolve(result);
        });
    });
}

function genEmail() {
    const validEmails = [];
    let validEmailss = 0;
    let possibilities = 0;
    const possiblitiesLength = Math.pow(chars.length, currentLength);

    while (possibilities < possiblitiesLength) {
        let newPossibility = "";
        let temp = possibilities;

        for (let i = 0; i < currentLength; i++) {
            const charIndex = temp % chars.length;
            newPossibility += chars.charAt(charIndex);
            temp = Math.floor(temp / chars.length);
        }

        for (const domain of domains) {
            const emaill = `${newPossibility}@${domain}`;
            if (!validEmails.includes(emaill) && verifyEmailSync(emaill)) {
                validEmails.push(emaill);
                validEmailss += 1;
                console.log(`${emaill} is valid | ${validEmailss}`);
                if (validEmailss === 500) {
                    validEmailss = 0;
                    console.log("Writing emails to file");
                    fs.writeFileSync('emails.txt', validEmails.join('\n'));
                }
            }
        }
        possibilities += 1;
    }
}

while (true) {
    genEmail();
    currentLength += 1;
}
