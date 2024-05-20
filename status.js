const Gamedig = require('gamedig');
const fetch = require('node-fetch');
const schedule = require('node-schedule');

// Replace with your Minecraft server details
const serverOptions = {
    type: 'minecraft',
    host: 'minecraft.belanga.cloud',
    port: 25565  // Default Minecraft port
};

// Replace with your Discord webhook URL
const webhookURL = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';

const queryServer = async () => {
    try {
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

        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(`Failed to send webhook: ${response.statusText}`);
        }

        console.log('Webhook sent successfully.');
    } catch (error) {
        console.error('Error querying server or sending webhook:', error);
    }
};

// Schedule the task to run every 5 minutes
schedule.scheduleJob('*/5 * * * *', queryServer);

// Initial call to the function
queryServer();
