
class MeetGestureReactions {
  constructor() {
    this.isActive = false;
    this.handDetector = null;
    this.emojiContainer = null;
    this.videoOverlay = null;
    this.lastGesture = null;
    this.gestureConfidence = 0;
    this.gestureStartTime = null;
    this.confidenceThreshold = 0.8;
    this.holdDuration = 800; // ms to hold gesture before triggering
    this.init();
  }

  async init() {
    await this.waitForMeet();
    this.createVideoOverlay();
    this.createEmojiContainer();
    this.createControlPanel();
    await this.initHandDetection();
  }

  waitForMeet() {
    return new Promise((resolve) => {
      const checkMeet = () => {
        if (document.querySelector('[data-meeting-title]') || 
            document.querySelector('[jsname="HlFzfd"]') ||
            document.querySelector('[data-self-name]') ||
            window.location.pathname.includes('/meet/')) {
          resolve();
        } else {
          setTimeout(checkMeet, 1000);
        }
      };
      checkMeet();
    });
  }

  createVideoOverlay() {
    // Create overlay that appears directly on the video feed
    this.videoOverlay = document.createElement('div');
    this.videoOverlay.id = 'gesture-video-overlay';
    this.videoOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    `;

    // Find the user's video element and add overlay
    this.attachToUserVideo();
  }

  attachToUserVideo() {
    const findAndAttachToVideo = () => {
      // Look for the user's video element in Google Meet
      const videoElements = document.querySelectorAll('video');
      const userVideoContainer = document.querySelector('[data-self-name]') || 
                                document.querySelector('[data-participant-id*="self"]') ||
                                document.querySelector('.yxEBhf') || // User's video container
                                document.querySelector('[data-allocation-index="0"]');

      if (userVideoContainer) {
        const videoElement = userVideoContainer.querySelector('video');
        if (videoElement && !videoElement.querySelector('#gesture-video-overlay')) {
          const parent = videoElement.parentElement;
          parent.style.position = 'relative';
          parent.appendChild(this.videoOverlay);
          console.log('Video overlay attached to user video');
          return true;
        }
      }

      // Fallback: attach to any video element
      if (videoElements.length > 0) {
        const videoElement = videoElements[0];
        const parent = videoElement.parentElement;
        if (parent && !parent.querySelector('#gesture-video-overlay')) {
          parent.style.position = 'relative';
          parent.appendChild(this.videoOverlay);
          console.log('Video overlay attached to fallback video');
          return true;
        }
      }

      return false;
    };

    if (!findAndAttachToVideo()) {
      // Retry every 2 seconds until we find a video
      setTimeout(() => this.attachToUserVideo(), 2000);
    }
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
          <span id="gesture-status-text">Auto Gestures: Off</span>
        </div>
        <div class="confidence-display">
          <span id="confidence-text">Confidence: 0%</span>
          <div class="confidence-bar">
            <div class="confidence-fill" id="confidence-fill"></div>
          </div>
        </div>
        <button id="gesture-toggle-btn" class="gesture-btn">
          <span>🤖</span>
          <span>Start Auto Gestures</span>
        </button>
        <div class="gesture-info">
          <div class="gesture-hint active-hint" id="thumbs-hint">
            <span>👍</span> Hold thumbs up
          </div>
          <div class="gesture-hint active-hint" id="peace-hint">
            <span>✌️</span> Hold peace sign
          </div>
          <div class="gesture-hint active-hint" id="wave-hint">
            <span>👋</span> Hold open hand
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);

    const toggleBtn = document.getElementById('gesture-toggle-btn');
    toggleBtn.addEventListener('click', () => this.toggleGestureDetection());
  }

  async initHandDetection() {
    try {
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
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
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

      this.videoElement = document.createElement('video');
      this.videoElement.style.display = 'none';
      this.videoElement.srcObject = stream;
      this.videoElement.play();
      document.body.appendChild(this.videoElement);

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
    this.lastGesture = null;
    this.gestureStartTime = null;
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
      const gestureResult = this.detectGestureWithConfidence(landmarks);
      
      this.updateConfidenceDisplay(gestureResult.confidence);
      this.updateGestureHints(gestureResult.gesture);

      if (gestureResult.gesture && gestureResult.confidence > this.confidenceThreshold) {
        if (this.lastGesture === gestureResult.gesture) {
          // Continue tracking the same gesture
          const currentTime = Date.now();
          if (this.gestureStartTime && (currentTime - this.gestureStartTime) > this.holdDuration) {
            this.triggerEmojiReaction(gestureResult.gesture);
            this.gestureStartTime = currentTime; // Reset timer for next reaction
          }
        } else {
          // New gesture detected
          this.lastGesture = gestureResult.gesture;
          this.gestureStartTime = Date.now();
        }
      } else {
        // No confident gesture detected
        this.lastGesture = null;
        this.gestureStartTime = null;
      }
    } else {
      // No hand detected
      this.updateConfidenceDisplay(0);
      this.updateGestureHints(null);
      this.lastGesture = null;
      this.gestureStartTime = null;
    }
  }

  detectGestureWithConfidence(landmarks) {
    const thumb_tip = landmarks[4];
    const thumb_ip = landmarks[3];
    const index_tip = landmarks[8];
    const index_pip = landmarks[6];
    const middle_tip = landmarks[12];
    const middle_pip = landmarks[10];
    const ring_tip = landmarks[16];
    const ring_pip = landmarks[14];
    const pinky_tip = landmarks[20];
    const pinky_pip = landmarks[18];

    let maxConfidence = 0;
    let detectedGesture = null;

    // Thumbs up detection with confidence
    const thumbUp = thumb_tip.y < thumb_ip.y;
    const fingersDown = index_tip.y > index_pip.y && middle_tip.y > middle_pip.y && 
                       ring_tip.y > ring_pip.y && pinky_tip.y > pinky_pip.y;
    
    if (thumbUp && fingersDown) {
      const confidence = Math.min(
        (thumb_ip.y - thumb_tip.y) * 5,
        (index_tip.y - index_pip.y) * 3,
        1.0
      );
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedGesture = 'thumbs_up';
      }
    }

    // Peace sign detection with confidence
    const indexUp = index_tip.y < index_pip.y;
    const middleUp = middle_tip.y < middle_pip.y;
    const ringDown = ring_tip.y > ring_pip.y;
    const pinkyDown = pinky_tip.y > pinky_pip.y;
    
    if (indexUp && middleUp && ringDown && pinkyDown) {
      const confidence = Math.min(
        (index_pip.y - index_tip.y) * 4,
        (middle_pip.y - middle_tip.y) * 4,
        (ring_tip.y - ring_pip.y) * 2,
        1.0
      );
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedGesture = 'peace';
      }
    }

    // Open hand / wave detection with confidence
    const allFingersUp = thumb_tip.y < landmarks[2].y && indexUp && middleUp &&
                        ring_tip.y < ring_pip.y && pinky_tip.y < pinky_pip.y;
    
    if (allFingersUp) {
      const confidence = Math.min(
        (index_pip.y - index_tip.y) * 2,
        (middle_pip.y - middle_tip.y) * 2,
        (ring_pip.y - ring_tip.y) * 2,
        (pinky_pip.y - pinky_tip.y) * 2,
        1.0
      );
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedGesture = 'wave';
      }
    }

    return { gesture: detectedGesture, confidence: maxConfidence };
  }

  updateConfidenceDisplay(confidence) {
    const confidenceText = document.getElementById('confidence-text');
    const confidenceFill = document.getElementById('confidence-fill');
    
    if (confidenceText && confidenceFill) {
      const percentage = Math.round(confidence * 100);
      confidenceText.textContent = `Confidence: ${percentage}%`;
      confidenceFill.style.width = `${percentage}%`;
      
      if (confidence > this.confidenceThreshold) {
        confidenceFill.style.background = '#10b981';
      } else {
        confidenceFill.style.background = '#f59e0b';
      }
    }
  }

  updateGestureHints(currentGesture) {
    const hints = ['thumbs-hint', 'peace-hint', 'wave-hint'];
    const gestureMap = {
      'thumbs_up': 'thumbs-hint',
      'peace': 'peace-hint',
      'wave': 'wave-hint'
    };

    hints.forEach(hintId => {
      const hint = document.getElementById(hintId);
      if (hint) {
        hint.classList.remove('detecting');
        if (currentGesture && gestureMap[currentGesture] === hintId) {
          hint.classList.add('detecting');
        }
      }
    });
  }

  triggerEmojiReaction(gesture) {
    const emojiMap = {
      'thumbs_up': ['👍', '💪', '✨', '🔥', '👏'],
      'peace': ['✌️', '😎', '🎉', '🎊', '🌟'],
      'wave': ['👋', '💫', '❤️', '✨', '🌈']
    };

    const emojis = emojiMap[gesture] || ['😊'];
    
    // Create multiple emojis for dramatic effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        this.createFloatingEmoji(emoji);
        this.createVideoOverlayEmoji(emoji);
      }, i * 150);
    }
  }

  createFloatingEmoji(emoji) {
    const emojiElement = document.createElement('div');
    emojiElement.className = 'floating-emoji sparkle';
    emojiElement.textContent = emoji;
    
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight;
    
    emojiElement.style.cssText = `
      position: absolute;
      left: ${startX}px;
      top: ${startY}px;
      font-size: ${50 + Math.random() * 50}px;
      pointer-events: none;
      z-index: 10001;
      animation: floatUp ${4 + Math.random() * 2}s ease-out forwards;
      --start-rotation: ${-30 + Math.random() * 60}deg;
    `;

    this.emojiContainer.appendChild(emojiElement);

    setTimeout(() => {
      if (emojiElement.parentNode) {
        emojiElement.parentNode.removeChild(emojiElement);
      }
    }, 6000);
  }

  createVideoOverlayEmoji(emoji) {
    if (!this.videoOverlay) return;

    const emojiElement = document.createElement('div');
    emojiElement.className = 'video-overlay-emoji';
    emojiElement.textContent = emoji;
    
    const startX = Math.random() * 80 + 10; // 10-90% of video width
    const startY = Math.random() * 80 + 10; // 10-90% of video height
    
    emojiElement.style.cssText = `
      position: absolute;
      left: ${startX}%;
      top: ${startY}%;
      font-size: ${30 + Math.random() * 30}px;
      pointer-events: none;
      z-index: 1001;
      animation: videoEmojiFloat 3s ease-out forwards;
      transform: scale(0);
    `;

    this.videoOverlay.appendChild(emojiElement);

    setTimeout(() => {
      if (emojiElement.parentNode) {
        emojiElement.parentNode.removeChild(emojiElement);
      }
    }, 3000);
  }

  updateUI() {
    const statusIndicator = document.getElementById('gesture-status-indicator');
    const statusText = document.getElementById('gesture-status-text');
    const toggleBtn = document.getElementById('gesture-toggle-btn');

    if (this.isActive) {
      statusIndicator.className = 'status-indicator active';
      statusText.textContent = 'Auto Gestures: Active';
      toggleBtn.innerHTML = '<span>🛑</span><span>Stop Auto Gestures</span>';
    } else {
      statusIndicator.className = 'status-indicator';
      statusText.textContent = 'Auto Gestures: Off';
      toggleBtn.innerHTML = '<span>🤖</span><span>Start Auto Gestures</span>';
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
