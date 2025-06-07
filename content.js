
class MeetGestureReactions {
  constructor() {
    this.isActive = false;
    this.handDetector = null;
    this.emojiContainer = null;
    this.lastGesture = null;
    this.gestureConfidence = 0;
    this.init();
  }

  async init() {
    // Wait for Meet to fully load
    await this.waitForMeet();
    this.createEmojiContainer();
    this.createControlPanel();
    await this.initHandDetection();
  }

  waitForMeet() {
    return new Promise((resolve) => {
      const checkMeet = () => {
        if (document.querySelector('[data-meeting-title]') || 
            document.querySelector('[jsname="HlFzfd"]') ||
            window.location.pathname.includes('/meet/')) {
          resolve();
        } else {
          setTimeout(checkMeet, 1000);
        }
      };
      checkMeet();
    });
  }

  createEmojiContainer() {
    this.emojiContainer = document.createElement('div');
    this.emojiContainer.id = 'gesture-emoji-container';
    this.emojiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 10000;
      overflow: hidden;
    `;
    document.body.appendChild(this.emojiContainer);
  }

  createControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'gesture-control-panel';
    panel.innerHTML = `
      <div class="gesture-panel-content">
        <div class="gesture-status">
          <div class="status-indicator" id="gesture-status-indicator"></div>
          <span id="gesture-status-text">Gesture Detection: Off</span>
        </div>
        <button id="gesture-toggle-btn" class="gesture-btn">
          <span>🖐️</span>
          <span>Start Gestures</span>
        </button>
        <div class="gesture-info">
          <div class="gesture-hint">
            <span>👍</span> Thumbs up
          </div>
          <div class="gesture-hint">
            <span>✌️</span> Peace sign
          </div>
          <div class="gesture-hint">
            <span>👋</span> Wave hand
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);

    // Add event listeners
    const toggleBtn = document.getElementById('gesture-toggle-btn');
    toggleBtn.addEventListener('click', () => this.toggleGestureDetection());
  }

  async initHandDetection() {
    try {
      // Load MediaPipe Hands
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1633879962/hands.js';
      document.head.appendChild(script);

      script.onload = () => {
        this.setupHandDetection();
      };
    } catch (error) {
      console.error('Failed to load hand detection:', error);
    }
  }

  async setupHandDetection() {
    try {
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1633879962/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results) => this.processHandResults(results));

      this.handDetector = hands;
    } catch (error) {
      console.error('Failed to setup hand detection:', error);
    }
  }

  async toggleGestureDetection() {
    if (!this.isActive) {
      await this.startGestureDetection();
    } else {
      this.stopGestureDetection();
    }
  }

  async startGestureDetection() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });

      // Create hidden video element for processing
      this.videoElement = document.createElement('video');
      this.videoElement.style.display = 'none';
      this.videoElement.srcObject = stream;
      this.videoElement.play();
      document.body.appendChild(this.videoElement);

      // Start processing frames
      this.processVideoFrame();

      this.isActive = true;
      this.updateUI();
    } catch (error) {
      console.error('Failed to start gesture detection:', error);
      alert('Could not access camera. Please allow camera permissions.');
    }
  }

  stopGestureDetection() {
    if (this.videoElement && this.videoElement.srcObject) {
      const tracks = this.videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.remove();
    }

    this.isActive = false;
    this.updateUI();
  }

  processVideoFrame() {
    if (!this.isActive || !this.videoElement || !this.handDetector) return;

    if (this.videoElement.readyState === 4) {
      this.handDetector.send({ image: this.videoElement });
    }

    requestAnimationFrame(() => this.processVideoFrame());
  }

  processHandResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const gesture = this.detectGesture(landmarks);
      
      if (gesture && gesture !== this.lastGesture) {
        this.triggerEmojiReaction(gesture);
        this.lastGesture = gesture;
        
        // Reset after a delay to allow repeated gestures
        setTimeout(() => {
          this.lastGesture = null;
        }, 1500);
      }
    }
  }

  detectGesture(landmarks) {
    // Simple gesture detection based on landmark positions
    const thumb_tip = landmarks[4];
    const thumb_ip = landmarks[3];
    const index_tip = landmarks[8];
    const middle_tip = landmarks[12];
    const ring_tip = landmarks[16];
    const pinky_tip = landmarks[20];

    // Thumbs up detection
    if (thumb_tip.y < thumb_ip.y && 
        index_tip.y > landmarks[6].y &&
        middle_tip.y > landmarks[10].y) {
      return 'thumbs_up';
    }

    // Peace sign detection (index and middle up, others down)
    if (index_tip.y < landmarks[6].y &&
        middle_tip.y < landmarks[10].y &&
        ring_tip.y > landmarks[14].y &&
        pinky_tip.y > landmarks[18].y) {
      return 'peace';
    }

    // Open hand / wave detection
    if (thumb_tip.y < landmarks[2].y &&
        index_tip.y < landmarks[6].y &&
        middle_tip.y < landmarks[10].y &&
        ring_tip.y < landmarks[14].y &&
        pinky_tip.y < landmarks[18].y) {
      return 'wave';
    }

    return null;
  }

  triggerEmojiReaction(gesture) {
    const emojiMap = {
      'thumbs_up': ['👍', '💪', '✨'],
      'peace': ['✌️', '😎', '🎉'],
      'wave': ['👋', '💫', '❤️']
    };

    const emojis = emojiMap[gesture] || ['😊'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    this.createFloatingEmoji(emoji);
    
    // Create multiple emojis for more dramatic effect
    setTimeout(() => this.createFloatingEmoji(emoji), 200);
    setTimeout(() => this.createFloatingEmoji(emoji), 400);
  }

  createFloatingEmoji(emoji) {
    const emojiElement = document.createElement('div');
    emojiElement.className = 'floating-emoji';
    emojiElement.textContent = emoji;
    
    // Random starting position
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight;
    
    emojiElement.style.cssText = `
      position: absolute;
      left: ${startX}px;
      top: ${startY}px;
      font-size: ${40 + Math.random() * 40}px;
      pointer-events: none;
      z-index: 10001;
      animation: floatUp ${3 + Math.random() * 2}s ease-out forwards;
      transform: rotate(${-15 + Math.random() * 30}deg);
    `;

    this.emojiContainer.appendChild(emojiElement);

    // Remove after animation
    setTimeout(() => {
      if (emojiElement.parentNode) {
        emojiElement.parentNode.removeChild(emojiElement);
      }
    }, 5000);
  }

  updateUI() {
    const statusIndicator = document.getElementById('gesture-status-indicator');
    const statusText = document.getElementById('gesture-status-text');
    const toggleBtn = document.getElementById('gesture-toggle-btn');

    if (this.isActive) {
      statusIndicator.className = 'status-indicator active';
      statusText.textContent = 'Gesture Detection: Active';
      toggleBtn.innerHTML = '<span>🛑</span><span>Stop Gestures</span>';
    } else {
      statusIndicator.className = 'status-indicator';
      statusText.textContent = 'Gesture Detection: Off';
      toggleBtn.innerHTML = '<span>🖐️</span><span>Start Gestures</span>';
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MeetGestureReactions();
  });
} else {
  new MeetGestureReactions();
}
