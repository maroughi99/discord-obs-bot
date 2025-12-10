# WC3 Observer Bot

A Discord bot that monitors the [WC3Stats API](https://api.wc3stats.com/gamelist) and automatically posts newly hosted Warcraft 3 games to a specified Discord channel.

## Features

- 🎮 Monitors WC3Stats API for new game lobbies
- 📢 Posts game information to Discord channel (ID: 1372149095556317194)
- 🎨 Beautiful embed messages with game details
- ⚡ Polls API every 30 seconds for updates
- 🔄 Prevents duplicate posts with game tracking
- 🌍 Shows server region, host, map, and player count

## Prerequisites

- Node.js (v16 or higher)
- A Discord bot token
- Discord bot must have these permissions:
  - View Channels
  - Send Messages
  - Embed Links

## Setup

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a Discord Bot**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token
   - Enable "Message Content Intent" if needed

4. **Configure the bot**
   - Copy `.env.example` to `.env`
   ```bash
   copy .env.example .env
   ```
   - Edit `.env` and add your Discord bot token:
   ```
   DISCORD_TOKEN=your_actual_bot_token_here
   ```

5. **Invite the bot to your server**
   - Go to OAuth2 > URL Generator in Discord Developer Portal
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Embed Links`, `View Channels`
   - Copy the generated URL and open it in your browser
   - Select your server and authorize the bot

6. **Run the bot**
   ```bash
   npm start
   ```

## Configuration

You can modify these settings in `bot.js`:

- `CHANNEL_ID`: The Discord channel ID where games will be posted (default: 1372149095556317194)
- `POLL_INTERVAL`: How often to check for new games in milliseconds (default: 30000 = 30 seconds)
- `API_URL`: The WC3Stats API endpoint (default: https://api.wc3stats.com/gamelist)

## Game Information Posted

Each game post includes:
- 🎮 Game name
- 🗺️ Map name
- 🌍 Server region (EU, USW, KR, etc.)
- 👤 Host player name
- 👥 Current players / Total slots
- ⏱️ Game uptime
- 🏆 Official game status
- 🆔 Game ID

## How It Works

1. Bot connects to Discord when started
2. Fetches current game list from API and stores game IDs
3. Every 30 seconds, checks API for new games
4. Posts only new games (uptime < 5 minutes) to avoid spam
5. Tracks posted games to prevent duplicates
6. Maintains a cache of last 500 game IDs

## Troubleshooting

**Bot not posting messages:**
- Verify the bot has correct permissions in the channel
- Check that CHANNEL_ID is correct
- Ensure bot is online (check console for "Logged in as..." message)

**Bot crashes or errors:**
- Check your DISCORD_TOKEN is valid
- Ensure internet connection is stable
- Check console logs for specific error messages

**No games being posted:**
- The bot only posts games with uptime < 5 minutes (recently created)
- Games may not be available at the time of checking
- Try adjusting the uptime filter in the code if needed

## License

ISC
