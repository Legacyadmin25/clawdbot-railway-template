const fs = require('fs');
const path = require('path');

// Folder Setup
const INBOX = path.join(__dirname, 'data', 'mailbox', 'inbox');
const PROCESSED = path.join(__dirname, 'data', 'mailbox', 'processed');

// Ensure directories exist
if (!fs.existsSync(INBOX)) fs.mkdirSync(INBOX, { recursive: true });
if (!fs.existsSync(PROCESSED)) fs.mkdirSync(PROCESSED, { recursive: true });

console.log('--- OpenClaw Agent Bridge Active ---');
console.log('Watching:', INBOX);

const handleTask = async (task) => {
    // Determine target agent
    const target = task.target || 'DEVELOPER'; // Default to developer
    console.log(`Routing task to: ${target}`);

    switch (target) {
        case 'DEVELOPER':
            // Developer Agent Logic
            switch (task.command) {
                case 'verify_connection':
                    console.log('Dev Agent: Running system diagnostic...');
                    break;
                case 'process_policy':
                    console.log(`Dev Agent: Processing policy ID: ${task.policyId}`);
                    break;
                default:
                    throw new Error(`Developer agent does not know command: ${task.command}`);
            }
            break;

        case 'PA':
            // PA Agent Logic
            switch (task.command) {
                case 'send_message':
                    console.log(`PA Agent: Sending Telegram message: ${task.content}`);
                    // Trigger your Telegram API call here
                    break;
                case 'schedule_task':
                    console.log(`PA Agent: Scheduling ${task.description} for ${task.time}`);
                    break;
                default:
                    throw new Error(`PA agent does not know command: ${task.command}`);
            }
            break;

        default:
            throw new Error(`Unknown target agent: ${target}`);
    }
};

setInterval(() => {
    fs.readdir(INBOX, (err, files) => {
        if (err) return;

        files.forEach(async (file) => {
            if (file.endsWith('.json')) {
                const filePath = path.join(INBOX, file);
                
                try {
                    let content = fs.readFileSync(filePath, 'utf8');
                    const jsonString = content.replace(/^[^{]*/, '');
                    
                    const task = JSON.parse(jsonString);
                    console.log(`\nTask: ${file} | Target: ${task.target || 'DEVELOPER'} | Command: ${task.command}`);
                    
                    await handleTask(task);

                    const timestamp = Date.now();
                    const destPath = path.join(PROCESSED, `${timestamp}_${file}`);
                    fs.renameSync(filePath, destPath);
                    console.log(`Archive success: ${destPath}`);

                } catch (err) {
                    console.error(`Task Error [${file}]:`, err.message);
                }
            }
        });
    });
}, 2000);