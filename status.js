import fetch from 'node-fetch';
import { scheduleJob } from 'node-schedule';
import fs from 'fs';

// Replace with your Minecraft server details
const serverOptions = {
    type: 'minecraft',
    host: 'your.minecraft.server.ip',
    port: 25565  // Default Minecraft port
};

// Replace with your Discord webhook URL
const webhookURL = 'https://discord.com/api/webhooks/1241938443223695400/xHD0d6HQZFs81H8IReib54uDn5aCxjmplJIDvxJ9qs3E9vqgz6pcVo0R85852wqLBJzp';

let messageId = null;

const loadMessageId = () => {
    try {
        const data = fs.readFileSync('messageId.txt', 'utf8');
        return data.trim();
    } catch (err) {
        console.log('No previous message ID found, starting fresh.');
        return null;
    }
};

const saveMessageId = (id) => {
    fs.writeFileSync('messageId.txt', id, 'utf8');
};

const queryServer = async () => {
    try {
        const { default: Gamedig } = await import('gamedig');
        const state = await Gamedig.query(serverOptions);
        console.log('Server State:', state);

        const message = {
            username: "Minecraft Server Bot",
            embeds: [{
                title: "Minecraft Server Status",
                fields: [
                    { name: "Server", value: `${serverOptions.host}:${serverOptions.port}`, inline: true },
                    { name: "Players", value: `${state.players.length} / ${state.maxplayers}`, inline: true },
                    { name: "Map", value: state.map, inline: true },
                ],
                timestamp: new Date().toISOString()
            }]
        };

        let response;
        if (messageId) {
            response = await fetch(`${webhookURL}/messages/${messageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
        } else {
            response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
        }

        const responseText = await response.text();
        console.log('Response Text:', responseText);

        if (!response.ok) {
            throw new Error(`Failed to send or edit webhook: ${response.statusText}`);
        }

        const responseData = JSON.parse(responseText);

        if (!messageId) {
            messageId = responseData.id;
            saveMessageId(messageId);
        }

        console.log('Webhook operation completed successfully.');
    } catch (error) {
        console.error('Error querying server or sending webhook:', error);
    }
};

// Load the message ID from file
messageId = loadMessageId();

// Schedule the task to run every 5 minutes
scheduleJob('*/5 * * * *', queryServer);

// Initial call to the function
queryServer();
