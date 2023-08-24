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
const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
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
    let num = Math.pow(36, currentLength - 1) * 100;
    let maxnum = Math.pow(36, currentLength) - 1;
    let nums = String(Math.pow(10, currentLength - 1) * 100).split('');
    let validEmails = [];
    let ctn = 0;
    while (num < maxnum) {
        let email = "";
        for (const cnum of nums) {
            email += chars.charAt(cnum);
        }
        email += '@';
        let current;
        for (const domain of domains) {
            current = email + domain;
            if (!validEmails.includes(current) && verifyEmailSync(current)) {
                validEmails.push(current);
            }
        }
        num += 1;
        nums[charArray.length - 1] += 1;
        for (let i = 0; i > nums.length; i++) {
            if (nums[i] >= 36) {
                nums[i] = 0;
                nums[i + 1] += 1;
            }
        }
        ctn += 1;
        if (ctn === 500) {
            fs.writeFileSync('emails.txt', [...validEmails, ...emails].join('\n'));
        }
    }
    fs.writeFileSync('emails.txt', [...validEmails, ...emails].join('\n'));
}

while (true) {
    genEmail();
    currentLength += 1;
}
