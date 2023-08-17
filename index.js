const fs = require('fs');
const dns = require('dns');
const net = require('net');
if (!fs.existsSync('emails.txt')) {
    fs.writeFileSync('emails.txt', '');
    const emails = [];
} else {
    const emails = fs.readFileSync('emails.txt', 'utf8').split('\n');
}
let currentLength = emails.length;
let curr = 0;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const domains = [
    '@gmail.com',
    '@yahoo.com',
    '@hotmail.com',
    '@outlook.com'
];
let validEmails = 0;
function genEmail() {
    let currentChars = ''
    for (let i = 0; i < currentLength; i++) {
        currentChars += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    curr += currentLength;
    if (curr >=  chars * currentLength) {
        currentLength += 1;
        curr = 0;
    }
    let all = [];
    for (let i = 0; i < domains.length; i++) {
        all.push(currentChars + domains[i]);
    }
    for (let i = 0; i < all.length; i++) {
        if (emails.includes(all[i])) {
            return genEmail();
        }
    }
    return all;
}

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

while (true) {
    for (const email of genEmail()) {
        if (verifyEmail(email)) {
            validEmails += 1;
            console.log(`${email} is valid`);
            console.log(`${validEmails}`);
            fs.appendFile('emails.txt', `${email}\n`, (err) => {});
        }
    }
}
