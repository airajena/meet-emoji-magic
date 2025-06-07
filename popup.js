
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a Google Meet page
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    if (currentTab.url && currentTab.url.includes('meet.google.com')) {
      // We're on Google Meet, show active status
      showMeetStatus(true);
    } else {
      // Not on Google Meet, show instructions
      showMeetStatus(false);
    }
  });
});

function showMeetStatus(isOnMeet) {
  const instructions = document.querySelector('.instructions');
  
  if (isOnMeet) {
    instructions.innerHTML = `
      <strong>✅ Google Meet Detected!</strong><br>
      The gesture detection panel should be visible in the top-right corner of your Meet window. 
      Click "Start Gestures" to begin using hand gesture reactions!
    `;
    instructions.style.background = 'rgba(16, 185, 129, 0.2)';
  } else {
    instructions.innerHTML = `
      <strong>📍 Navigation Required</strong><br>
      Please navigate to <span class="highlight">meet.google.com</span> and join a call to use gesture reactions. 
      The extension will automatically activate on Google Meet pages.
    `;
    instructions.style.background = 'rgba(245, 158, 11, 0.2)';
  }
}

// Add some interactive elements
document.querySelectorAll('.feature').forEach(feature => {
  feature.addEventListener('mouseenter', function() {
    this.style.background = 'rgba(255, 255, 255, 0.1)';
    this.style.borderRadius = '8px';
    this.style.transform = 'translateX(4px)';
    this.style.transition = 'all 0.2s ease';
  });
  
  feature.addEventListener('mouseleave', function() {
    this.style.background = 'transparent';
    this.style.transform = 'translateX(0)';
  });
});
