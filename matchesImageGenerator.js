const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateMatchesImage(recentMatches) {
    const width = 800;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    try {
        // Load background
        const bgPath = path.join(__dirname, '../../web/public/images/maps/test_texture-wood-alt.png');
        const background = await loadImage(bgPath);
        
        // Draw tiled background
        const pattern = ctx.createPattern(background, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);

        // Load frame overlay
        const framePath = path.join(__dirname, '../../web/public/images/maps/war3_metal_frame_4k.png');
        const frame = await loadImage(framePath);
        
        // Draw frame with full opacity
        ctx.globalAlpha = 1.0;
        ctx.drawImage(frame, 0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Draw title
        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText('RECENT/ONGOING MATCHES', width / 2, 80);
        ctx.fillText('RECENT/ONGOING MATCHES', width / 2, 80);

        // Draw match count
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        const matchCount = recentMatches.length;
        const ongoingCount = recentMatches.filter(m => m.isOngoing).length;
        const completedCount = matchCount - ongoingCount;
        const countText = matchCount === 0 ? 'No matches yet' : `${ongoingCount} ongoing • ${completedCount} recent`;
        ctx.strokeText(countText, width / 2, 130);
        ctx.fillText(countText, width / 2, 130);

        if (matchCount === 0) {
            // Draw "waiting for matches" message
            ctx.font = 'italic 20px Arial';
            ctx.fillStyle = '#CCCCCC';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText('No active matches...', width / 2, height / 2);
            ctx.fillText('No active matches...', width / 2, height / 2);
        } else {
            // Draw matches
            let y = 180;
            const lineHeight = 170; // Increased spacing between matches
            
            ctx.textAlign = 'left';
            
            for (let i = 0; i < Math.min(matchCount, 5); i++) {
                const match = recentMatches[i];
                
                // Calculate time since match started
                const timeAgo = getTimeAgo(new Date(match.played_at));
                
                // Draw match number
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeText(`Match #${i + 1}`, 60, y);
                ctx.fillText(`Match #${i + 1}`, 60, y);
                
                if (match.isOngoing) {
                    // ONGOING MATCH - Show "In Progress"
                    ctx.font = 'bold 16px Arial';
                    ctx.fillStyle = '#FFA500';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1.5;
                    ctx.strokeText(`⚔️ IN PROGRESS - ${timeAgo}`, 60, y + 25);
                    ctx.fillText(`⚔️ IN PROGRESS - ${timeAgo}`, 60, y + 25);
                    
                    // Draw player 1 (blue)
                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#5599FF';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    const player1Text = `${match.winner_username}`;
                    ctx.strokeText(player1Text, 60, y + 55);
                    ctx.fillText(player1Text, 60, y + 55);
                    
                    // Draw player 1 ELO
                    ctx.font = '18px Arial';
                    ctx.fillStyle = '#87CEEB';
                    const player1EloText = `${match.winner_elo_before} ELO`;
                    ctx.strokeText(player1EloText, 80, y + 80);
                    ctx.fillText(player1EloText, 80, y + 80);
                    
                    // Draw VS
                    ctx.font = 'bold 20px Arial';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeText('VS', 400, y + 67);
                    ctx.fillText('VS', 400, y + 67);
                    
                    // Draw player 2 (orange)
                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#FF9955';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    const player2Text = `${match.loser_username}`;
                    ctx.strokeText(player2Text, 480, y + 55);
                    ctx.fillText(player2Text, 480, y + 55);
                    
                    // Draw player 2 ELO
                    ctx.font = '18px Arial';
                    ctx.fillStyle = '#FFB088';
                    const player2EloText = `${match.loser_elo_before} ELO`;
                    ctx.strokeText(player2EloText, 500, y + 80);
                    ctx.fillText(player2EloText, 500, y + 80);
                    
                    // Draw map name if available
                    if (match.map && match.map.name) {
                        ctx.font = 'italic 16px Arial';
                        ctx.fillStyle = '#AAAAAA';
                        ctx.strokeStyle = '#000000';
                        ctx.lineWidth = 1.5;
                        ctx.strokeText(`Map: ${match.map.name}`, 60, y + 110);
                        ctx.fillText(`Map: ${match.map.name}`, 60, y + 110);
                    }
                } else {
                    // COMPLETED MATCH - Show winner/loser with ELO changes
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#AAAAAA';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1.5;
                    ctx.strokeText(`✅ Completed - ${timeAgo}`, 60, y + 25);
                    ctx.fillText(`✅ Completed - ${timeAgo}`, 60, y + 25);
                    
                    // Draw winner (green)
                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#00FF00';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    const winnerText = `🏆 ${match.winner_username}`;
                    ctx.strokeText(winnerText, 60, y + 55);
                    ctx.fillText(winnerText, 60, y + 55);
                    
                    // Draw winner ELO change
                    ctx.font = '18px Arial';
                    ctx.fillStyle = '#90EE90';
                    const winnerEloText = `${match.winner_elo_before} → ${match.winner_elo_after} (+${match.elo_change})`;
                    ctx.strokeText(winnerEloText, 80, y + 80);
                    ctx.fillText(winnerEloText, 80, y + 80);
                    
                    // Draw loser (red)
                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#FF6666';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    const loserText = `💀 ${match.loser_username}`;
                    ctx.strokeText(loserText, 60, y + 105);
                    ctx.fillText(loserText, 60, y + 105);
                    
                    // Draw loser ELO change
                    ctx.font = '18px Arial';
                    ctx.fillStyle = '#FFB6B6';
                    const loserEloChange = match.loser_elo_after - match.loser_elo_before;
                    const loserEloText = `${match.loser_elo_before} → ${match.loser_elo_after} (${loserEloChange})`;
                    ctx.strokeText(loserEloText, 80, y + 130);
                    ctx.fillText(loserEloText, 80, y + 130);
                }
                
                y += lineHeight;
            }
        }

        // Draw timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.textAlign = 'center';
        ctx.strokeText(`Updated: ${timestamp}`, width / 2, height - 40);
        ctx.fillText(`Updated: ${timestamp}`, width / 2, height - 40);

        return canvas.toBuffer('image/png');

    } catch (error) {
        console.error('Error generating matches image:', error);
        throw error;
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

module.exports = {
    generateMatchesImage
};
