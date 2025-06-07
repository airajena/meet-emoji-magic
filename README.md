
# Meet Gesture Reactions Chrome Extension

Transform your Google Meet calls with magical gesture-controlled emoji reactions! Wave your hand, give a thumbs up, or flash a peace sign to trigger beautiful floating emoji effects that enhance your video call experience.

## ✨ Features

- **Real-time Hand Gesture Detection**: Uses advanced MediaPipe technology to detect hand gestures through your webcam
- **Beautiful Floating Animations**: iPhone-style emoji reactions with smooth physics and particle effects
- **Multiple Gesture Support**: 
  - 👍 Thumbs up → Triggers positive emojis
  - ✌️ Peace sign → Triggers celebration emojis  
  - 👋 Wave → Triggers greeting emojis
- **Seamless Integration**: Works automatically on Google Meet with minimal interface
- **Privacy Focused**: All processing happens locally in your browser

## 🚀 Installation

### Option 1: Load as Developer Extension (Recommended)

1. **Download the Extension**
   - Clone or download this repository to your computer
   - Extract the files to a folder (e.g., `meet-gesture-reactions`)

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Turn on "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Verify Installation**
   - Look for the 🖐️ icon in your Chrome toolbar
   - The extension is ready to use!

### Option 2: Install from Chrome Web Store
*Coming soon - extension under review*

## 📖 How to Use

1. **Join a Google Meet Call**
   - Navigate to [meet.google.com](https://meet.google.com)
   - Join or start a video call

2. **Activate Gesture Detection**
   - Look for the control panel in the top-right corner of the Meet window
   - Click "Start Gestures" button
   - Allow camera access when prompted

3. **Make Gestures**
   - Hold your hand clearly in view of the camera
   - Make these gestures to trigger reactions:
     - **Thumbs Up** 👍 - Shows positive emojis (👍, 💪, ✨)
     - **Peace Sign** ✌️ - Shows celebration emojis (✌️, 😎, 🎉)
     - **Open Hand/Wave** 👋 - Shows friendly emojis (👋, 💫, ❤️)

4. **Enjoy the Magic**
   - Watch as beautiful emoji animations float across your screen
   - Other participants will see your reactions through screen sharing

## 🛠️ Technical Details

### Technologies Used
- **MediaPipe Hands**: Google's machine learning solution for hand tracking
- **Chrome Extension API**: For seamless browser integration
- **CSS Animations**: For smooth, performant emoji effects
- **JavaScript**: Real-time gesture processing and UI management

### Performance Optimizations
- Efficient frame processing to minimize CPU usage
- Hardware-accelerated CSS animations
- Smart gesture debouncing to prevent spam
- Automatic cleanup of animation elements

### Privacy & Security
- All hand detection processing happens locally in your browser
- No gesture data is transmitted to external servers
- Camera access is only requested when you activate the feature
- Full control over when gesture detection is active

## 🎨 Customization

The extension includes beautiful default animations, but developers can customize:

- **Emoji Sets**: Modify the `emojiMap` in `content.js`
- **Animation Styles**: Adjust CSS animations in `styles.css`
- **Gesture Sensitivity**: Fine-tune detection parameters
- **UI Appearance**: Customize the control panel styling

## 🔧 Development

### Project Structure
```
meet-gesture-reactions/
├── manifest.json          # Extension configuration
├── content.js             # Main gesture detection logic
├── styles.css             # UI styling and animations
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
└── README.md              # Documentation
```

### Local Development
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test changes on Google Meet

## 🤝 Contributing

We welcome contributions! Here are some ideas:

- **New Gestures**: Add support for more hand gestures
- **Emoji Themes**: Create themed emoji packages
- **Sound Effects**: Add audio feedback for reactions
- **Customization UI**: Build settings panel for user preferences
- **Performance**: Optimize gesture detection algorithms

## 📋 Requirements

- **Chrome Browser**: Version 88+ (or any Chromium-based browser)
- **Camera Access**: Required for hand gesture detection
- **Google Meet**: Extension works on meet.google.com

## 🐛 Troubleshooting

### Gesture Detection Not Working
- Ensure camera permissions are granted
- Check that your hand is clearly visible in good lighting
- Try restarting gesture detection
- Verify camera is not being used by other applications

### Emojis Not Appearing
- Refresh the Google Meet page
- Check if the extension is enabled in `chrome://extensions/`
- Ensure you're on a Google Meet call page

### Performance Issues
- Close other camera-using applications
- Reduce the number of browser tabs
- Check Chrome task manager for resource usage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe Team**: For the incredible hand tracking technology
- **Google Meet**: For providing an extensible platform
- **Chrome Extensions Team**: For the robust extension APIs

---

**Enjoy bringing more fun and interactivity to your Google Meet calls! 🎉**

For support or questions, please open an issue on GitHub.
