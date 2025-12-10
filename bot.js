require('dotenv').config();
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { generateGameImage } = require('./gameImageGenerator');

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1372149095556317194'; 
const API_URL = 'https://api.wc3stats.com/gamelist';
const POLL_INTERVAL = 30000; // 30 seconds

// Store tracked game IDs to avoid duplicate posts
const trackedGames = new Set();

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Fetch games from API
async function fetchGames() {
    try {
        const response = await axios.get(API_URL);
        if (response.data && response.data.status === 'OK' && response.data.body) {
            return response.data.body;
        }
        return [];
    } catch (error) {
        console.error('Error fetching games:', error.message);
        return [];
    }
}

// Post new games to Discord
async function checkAndPostGames() {
    const games = await fetchGames();
    const channel = client.channels.cache.get(CHANNEL_ID);

    if (!channel) {
        console.error('Channel not found!');
        return;
    }

    let newGamesCount = 0;

    for (const game of games) {
        // Only post games we haven't seen before
        if (!trackedGames.has(game.id)) {
            trackedGames.add(game.id);
            
            // Filter: Only games with "obs" as a separate word (not part of other words like "noobs")
            const nameLower = game.name.toLowerCase();
            const hasObs = /\bobs\b/.test(nameLower);
            
            // Only post if the game is relatively new (uptime < 5 minutes) AND matches filters
            if (game.uptime < 300 && hasObs) {
                try {
                    // Generate image for the game
                    const imageBuffer = await generateGameImage(game);
                    const attachment = new AttachmentBuilder(imageBuffer, { name: 'game.png' });
                    
                    await channel.send({ 
                        content: `**New Game Hosted!**\n<@&1372146756745433119> <@&1372146948160884868>`,
                        files: [attachment] 
                    });
                    newGamesCount++;
                    console.log(`Posted game: ${game.name} (ID: ${game.id}) - OBS game`);
                    
                    // Add small delay between posts to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`Error posting game ${game.id}:`, error.message);
                }
            }
        }
    }

    // Clean up old game IDs (keep only last 500)
    if (trackedGames.size > 500) {
        const idsArray = Array.from(trackedGames);
        trackedGames.clear();
        idsArray.slice(-500).forEach(id => trackedGames.add(id));
    }

    if (newGamesCount > 0) {
        console.log(`Posted ${newGamesCount} new game(s)`);
    }
}

// Bot ready event
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📡 Monitoring WC3Stats API every ${POLL_INTERVAL / 1000} seconds`);
    console.log(`📢 Posting to channel: ${CHANNEL_ID}`);
    
    // Debug: List all available channels
    console.log(`\n🔍 Available channels:`);
    client.channels.cache.forEach(channel => {
        console.log(`  - ${channel.name || 'DM'} (ID: ${channel.id}, Type: ${channel.type})`);
    });
    
    const targetChannel = client.channels.cache.get(CHANNEL_ID);
    if (targetChannel) {
        console.log(`\n✅ Target channel found: ${targetChannel.name}`);
    } else {
        console.log(`\n❌ Target channel NOT found! Double-check the ID: ${CHANNEL_ID}`);
    }
    
    // Initial fetch to populate tracked games (without posting)
    fetchGames().then(games => {
        games.forEach(game => trackedGames.add(game.id));
        console.log(`🎯 Initialized with ${trackedGames.size} existing games`);
        
        // Start polling for new games
        setInterval(checkAndPostGames, POLL_INTERVAL);
    });
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(DISCORD_TOKEN);
