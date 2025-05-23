const chatBody = document.getElementById('chat-body');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');
const voiceBtn = document.getElementById('voice-btn');
const exportBtn = document.getElementById('export-btn');
const themeToggle = document.getElementById('theme-toggle');

let messages = [];

function addBotMessage(text) {
  const msg = document.createElement('div');
  msg.classList.add('chat-message', 'bot');
  msg.innerText = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
  messages.push({ role: 'bot', content: text });
}

function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.classList.add('chat-message', 'user');
  msg.innerText = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
  messages.push({ role: 'user', content: text });
}

function showTyping() {
  const typing = document.createElement('div');
  typing.classList.add('typing-indicator');
  typing.innerHTML = '<span></span><span></span><span></span>';
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;
  return typing;
}

function removeElement(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addUserMessage(text);
  userInput.value = '';
  callGemini(text);
}

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

window.onload = () => {
  addBotMessage(`It's aj_Chat\nHello! How can I assist you today?`);
};

const GEMINI_API_KEY = 'AIzaSyCfDOq-HD-9F3hRlyNr999XcUNperg3DS0';

async function callGemini(userText) {
  const typingIndicator = showTyping();
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userText
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    removeElement(typingIndicator);

    if (data.error) throw new Error(data.error.message);

    const botText = data.candidates[0].content.parts[0].text.trim();
    addBotMessage(botText);
    messages.push({ role: 'bot', content: botText });

    if (/happy birthday|শুভ জন্মদিন/i.test(userText)) startConfetti();

  } catch (error) {
    removeElement(typingIndicator);
    addBotMessage(`Sorry, there was an error: ${error.message}`);
    console.error(error);
  }
}

let recognition;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.lang = 'en-US'; // or 'bn-BD' for Bengali
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log("🎤 Voice recognition started");
    voiceBtn.classList.add('listening');
  };

  recognition.onend = () => {
    console.log("🛑 Voice recognition ended");
    voiceBtn.classList.remove('listening');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    if (transcript) {
      userInput.value = transcript;
      sendMessage(); // <--- make sure this calls your message send function
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    voiceBtn.classList.remove('listening');
  };

  voiceBtn.addEventListener('click', () => {
    recognition.start();
  });
} else {
  console.warn("Speech recognition not supported.");
  voiceBtn.style.display = 'none';
}



fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Only image files are supported!');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imgMsg = document.createElement('div');
    imgMsg.classList.add('chat-message', 'user');
    const img = document.createElement('img');
    img.src = reader.result;
    img.alt = 'User sent image';
    img.style.maxWidth = '200px';
    img.style.borderRadius = '12px';
    imgMsg.appendChild(img);
    chatBody.appendChild(imgMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    messages.push({ role: 'user', content: '[Image]' });
    fileInput.value = '';
  };
  reader.readAsDataURL(file);
});


function startConfetti() {
  const confettiContainer = document.getElementById('confetti');
  const colors = ['#ff0a54', '#ff477e', '#ff85a1', '#fbb1b1', '#f9bec7'];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '8px';
    confetti.style.height = '8px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.top = `${Math.random() * window.innerHeight}px`;
    confetti.style.left = `${Math.random() * window.innerWidth}px`;
    confetti.style.opacity = '0.8';
    confetti.style.borderRadius = '50%';
    confetti.style.animation = `confetti-fall ${2 + Math.random() * 2}s ease forwards`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}
