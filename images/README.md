# Custom Background Images

To use the same Warcraft 3 wooden background as the matches display:

## Required Images:

1. **`test_texture-wood-alt.png`** - The tiled wooden texture background
2. **`war3_metal_frame_4k.png`** - The decorative metal frame overlay

Add these files to this folder and restart the bot.

## Fallback:

If these images aren't found, the bot will generate a gradient background based on the server region (EU=Blue, USW=Red, etc.).

## Tips:
- Wooden texture will be tiled to fill the entire image
- Frame overlay will be drawn on top at full opacity
- Recommended wooden texture size: 256x256 pixels (will tile)
- Frame should be 800x400 pixels to match the game image size
