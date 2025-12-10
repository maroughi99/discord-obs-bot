const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

async function generateGameImage(game) {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    try {
        // Load wooden background and frame
        const bgPath = path.join(__dirname, 'images', 'test_texture-wood-alt.png');
        const framePath = path.join(__dirname, 'images', 'war3_metal_frame_4k.png');
        let hasCustomBg = false;
        let hasFrame = false;
        
        // Load wooden texture background
        try {
            const background = await loadImage(bgPath);
            // Draw tiled background
            const pattern = ctx.createPattern(background, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, width, height);
            hasCustomBg = true;
            console.log('✓ Loaded wooden background');
        } catch (err) {
            console.log('✗ Wooden background not found, using gradient:', err.message);
            
            // Create gradient background based on server
            const serverGradients = {
                'eu': ['#1a1a2e', '#16213e', '#0f3460'],
                'usw': ['#2d1b1e', '#4a1e2b', '#6b1f3a'],
                'use': ['#2d1b1e', '#4a2e1e', '#6b3a1f'],
                'kr': ['#1e1a2d', '#2e1e4a', '#3a1f6b'],
                'cn': ['#2d2a1e', '#4a441e', '#6b5f1f']
            };
            
            const colors = serverGradients[game.server.toLowerCase()] || ['#1a1a2e', '#16213e', '#0f3460'];
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(0.5, colors[1]);
            gradient.addColorStop(1, colors[2]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Add pattern overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            for (let i = 0; i < 50; i++) {
                ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
            }
        }

        // Load metal frame overlay
        try {
            const frame = await loadImage(framePath);
            ctx.globalAlpha = 1.0;
            ctx.drawImage(frame, 0, 0, width, height);
            ctx.globalAlpha = 1.0;
            hasFrame = true;
            console.log('✓ Loaded metal frame');
        } catch (err) {
            console.log('✗ Frame overlay not found, using border:', err.message);
            
            // Draw border only if no frame
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, width - 4, height - 4);

            // Draw inner shadow effect
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(6, 6, width - 12, height - 12);
        }

        // Add semi-transparent overlay for readability (lighter if we have wooden bg)
        if (hasCustomBg) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        }
        ctx.fillRect(0, 0, width, height);

        // Draw game name (title)
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText(game.name, width / 2, 80);
        ctx.fillText(game.name, width / 2, 80);

        // Draw map name
        ctx.font = 'italic 24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(`Map: ${game.map}`, width / 2, 130);
        ctx.fillText(`Map: ${game.map}`, width / 2, 130);

        // Draw info boxes
        const boxY = 180;
        const boxWidth = 220;
        const boxHeight = 140;
        const boxSpacing = 30;
        
        // Left box - Server & Host
        const leftBoxX = 40;
        drawInfoBox(ctx, leftBoxX, boxY, boxWidth, boxHeight);
        
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'left';
        ctx.fillText('🌐 SERVER', leftBoxX + 20, boxY + 35);
        
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(game.server.toUpperCase(), leftBoxX + 20, boxY + 70);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('🎮 Host:', leftBoxX + 20, boxY + 100);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#FFFFFF';
        const hostName = game.host.length > 18 ? game.host.substring(0, 15) + '...' : game.host;
        ctx.fillText(hostName, leftBoxX + 20, boxY + 125);
        
        // Center box - Players
        const centerBoxX = leftBoxX + boxWidth + boxSpacing;
        drawInfoBox(ctx, centerBoxX, boxY, boxWidth, boxHeight);
        
        const playerPercent = (game.slotsTaken / game.slotsTotal) * 100;
        const playerColor = playerPercent >= 80 ? '#FF4444' : 
                           playerPercent >= 50 ? '#FFA500' : '#00FF00';
        
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'left';
        ctx.fillText('👥 PLAYERS', centerBoxX + 20, boxY + 35);
        
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = playerColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        const playerText = `${game.slotsTaken}/${game.slotsTotal}`;
        ctx.strokeText(playerText, centerBoxX + boxWidth / 2, boxY + 95);
        ctx.fillText(playerText, centerBoxX + boxWidth / 2, boxY + 95);
        
        // Right box - Time & Status
        const rightBoxX = centerBoxX + boxWidth + boxSpacing;
        drawInfoBox(ctx, rightBoxX, boxY, boxWidth, boxHeight);
        
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'left';
        ctx.fillText('⏱️ UPTIME', rightBoxX + 20, boxY + 35);
        
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(formatUptime(game.uptime), rightBoxX + 20, boxY + 75);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = game.isOfficial ? '#00FF00' : '#AAAAAA';
        ctx.fillText(game.isOfficial ? '🏆 OFFICIAL' : '📦 CUSTOM', rightBoxX + 20, boxY + 110);
        
        // Draw game ID in corner
        ctx.font = '14px Arial';
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'right';
        ctx.fillText(`Game ID: ${game.id}`, width - 20, height - 20);

        // Draw timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { 
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'left';
        ctx.fillText(`Posted at ${timestamp}`, 20, height - 20);

        return canvas.toBuffer('image/png');

    } catch (error) {
        console.error('Error generating game image:', error);
        throw error;
    }
}

function drawInfoBox(ctx, x, y, width, height) {
    // Draw box background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y, width, height);
    
    // Draw box border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw inner highlight
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
}

function formatUptime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

module.exports = {
    generateGameImage
};
