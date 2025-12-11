const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

async function generateGameListImage(games) {
    const width = 1400;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    try {
        // Load wooden background
        const bgPath = path.join(__dirname, 'images', 'test_texture-wood-alt.png');
        const background = await loadImage(bgPath);
        const pattern = ctx.createPattern(background, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);

        // Load metal frame overlay
        const framePath = path.join(__dirname, 'images', 'war3_metal_frame_4k.png');
        const frame = await loadImage(framePath);
        ctx.drawImage(frame, 0, 0, width, height);

        // Semi-transparent overlay for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText('CUSTOM GAMES', width / 2, 70);
        ctx.fillText('CUSTOM GAMES', width / 2, 70);

        // Column headers
        const headerY = 130;
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        
        const colPlayers = 60;
        const colGameName = 180;
        const colMapName = 520;
        const colRegion = 1050;
        const colPing = 1220;
        
        ctx.strokeText('PLAYERS', colPlayers, headerY);
        ctx.fillText('PLAYERS', colPlayers, headerY);
        ctx.strokeText('GAME NAME', colGameName, headerY);
        ctx.fillText('GAME NAME', colGameName, headerY);
        ctx.strokeText('MAP NAME', colMapName, headerY);
        ctx.fillText('MAP NAME', colMapName, headerY);
        ctx.strokeText('REGION', colRegion, headerY);
        ctx.fillText('REGION', colRegion, headerY);
        ctx.strokeText('PING', colPing, headerY);
        ctx.fillText('PING', colPing, headerY);

        // Draw line under headers
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, headerY + 15);
        ctx.lineTo(width - 40, headerY + 15);
        ctx.stroke();

        // List games (max 15 games)
        const maxGames = 15;
        const startY = 180;
        const lineHeight = 45;
        
        ctx.font = '20px Arial';
        
        for (let i = 0; i < Math.min(games.length, maxGames); i++) {
            const game = games[i];
            const y = startY + (i * lineHeight);
            
            // Alternate row background
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(40, y - 25, width - 80, lineHeight - 5);
            }
            
            ctx.textAlign = 'left';
            
            // Players
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`${game.slotsTaken}/${game.slotsTotal}`, colPlayers, y);
            
            // Game name
            ctx.font = '20px Arial';
            ctx.fillStyle = '#FFFFFF';
            const gameName = game.name.length > 25 ? game.name.substring(0, 22) + '...' : game.name;
            ctx.fillText(gameName, colGameName, y);
            
            // Map name
            ctx.fillStyle = '#CCCCCC';
            const mapName = game.map.length > 35 ? game.map.substring(0, 32) + '...' : game.map;
            ctx.fillText(mapName, colMapName, y);
            
            // Region
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(game.server.toUpperCase(), colRegion, y);
            
            // Ping (color-coded)
            const ping = Math.floor(Math.random() * 300) + 100; // Simulated ping
            let pingColor;
            if (ping < 150) pingColor = '#00FF00';      // Green
            else if (ping < 200) pingColor = '#FFFF00'; // Yellow
            else if (ping < 250) pingColor = '#FF9900'; // Orange
            else pingColor = '#FF0000';                  // Red
            
            ctx.fillStyle = pingColor;
            ctx.fillText(`${ping}ms`, colPing, y);
        }

        // Footer info
        ctx.font = '18px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.textAlign = 'center';
        
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        ctx.fillText(`${games.length} games available • Updated: ${timestamp}`, width / 2, height - 40);

        return canvas.toBuffer('image/png');

    } catch (error) {
        console.error('Error generating game list image:', error);
        throw error;
    }
}

module.exports = {
    generateGameListImage
};
