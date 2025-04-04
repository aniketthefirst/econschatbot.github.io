// ===== CONFIGURATION =====
const SIMILARITY_THRESHOLD = 0.6; // 60% match required
let currentBot = "economics"; // 'economics' or 'science'
let waitingForAnswer = false;
let correctTerm = "";

// Store data for both bots
const botData = {
  economics: {
    streak: 0,
    chatHistory: [{
      html: "📊 Economics mode activated!<br>Type terms or <strong>'ask'</strong> to test yourself.",
      className: "bot-text"
    }]
  },
  science: {
    streak: 0,
    chatHistory: [{
      html: "🔬 Science mode activated!<br>Type terms or <strong>'ask'</strong> to test yourself.",
      className: "bot-text"
    }]
  }
};

// Economics Knowledge Base
const economicsResponses = {
  "opportunity cost": "The next best alternative forgone when making a decision.",
  "consumption": "The buying of goods and services.",
  "economic goods": "Goods with an associated opportunity cost.",
  "economic system": "How resources are allocated in an economy.",
  "free goods": "Unlimited in supply and no opportunity cost.",
  "capital goods": "Man-made goods used to produce other goods.",
  "public sector": "Economic activity directly involving the government. Aim - to provide a service.",
  "private sector": "Economic activity of private individuals and firms. Aim - earn profits.",
  "public goods": "Non-excludable and non-rival goods and services. Can cause market failure because there is a lack of profit motive to produce them.",
  "merit goods": "Goods and services that create positive spillover effects when consumed.",
  "market": "Where buyers and sellers exchange g/s at a particular price.",
  "macroeconomics": "Study of economic behavior and decision-making in the whole economy, rather than individual markets.",
  "microeconomics": "Study of particular markets and sections of the economy, rather than the economy as a whole.",
  "resource allocation": "The way economies decide what to produce, how to produce it, and for whom to produce it for.",
  "demand": "The willingness and ability of consumers to purchase a good/service at a given price at a given time, assuming ceteris paribus.",
  "individual demand": "The willingness and ability of one individual or firm to purchase a good/service.",
  "supply": "The amount of a good/service that a producer is willing and able to produce at a given price at a certain time.",
  "market demand": "Total horizontal summation of the willingness and ability of consumers to purchase a good/service.",
  "government intervention": "Government action to correct market failure.",
  "individual supply": "The amount of a good/service one producer is willing and able to supply.",
  "ped": "The responsiveness of demand to a change in price.",
  "pes": "The responsiveness of quantity supplied to a change in price.",
  "market equilibrium": "Where supply and demand meet, balancing the economy.",
  "market supply": "Total horizontal summation of the amount of a good/service all individual firms are willing and able to produce.",
  "market failure": "When the price mechanism fails to allocate resources efficiently, leading to social costs exceeding social benefits.",
  "private costs": "Costs borne by those directly involved in consuming or producing a product.",
  "external costs": "Negative side effects; costs borne by third parties who are not directly involved in the economic transaction.",
  "social costs": "The true cost of consumption or production to society, i.e., the sum of private costs and external costs.",
  "private benefits": "The benefits of production and consumption enjoyed by a firm, individual, or government.",
  "external benefits": "Positive side effects of production or consumption experienced by third parties, for which no money is paid.",
  "social benefits": "The true benefits of consumption or production, i.e., the sum of private benefits and external benefits.",
  "social costs formula": "Social Costs = Private Costs + External Costs",
  "social benefits formula": "Social Benefits = Private Benefits + External Benefits",
  "trade unions": "Groups of workers who advocate for better working conditions, wages, rights, and benefits through collective bargaining.",
  "specialisation": "When a firm or country focuses its resources on producing one or more goods/services.",
  "division of labour": "Breaking down production into smaller tasks so workers can specialize.",
  "productivity": "The relationship between inputs and outputs in the production process.",
  "labour productivity": "Output per worker = Total output / Total workforce.",
  "capital intensive production": "Production that mainly uses man-made resources.",
  "labour intensive production": "Production that mainly uses human resources.",
  "labour market": "Where buyers and sellers exchange labour through economic transactions.",
  "labour demand": "The amount of labour firms are willing and able to hire at a given wage rate.",
  "labour supply": "The number of people willing and able to work at a given wage rate.",
  "disposable income": "Income available for spending after income tax deductions.",
  "real income": "Income adjusted for inflation.",
  "wage rates": "The price of labour, determined by labour demand and supply.",
  "routine work": "Repetitive work requiring a low skill level.",
  "standardised goods": "Goods that are uniform in appearance and quality.",
  "interdependence": "The way actions of one affect others in firms/workplaces.",
  "deskilling": "Loss of proficiency over time, affecting unemployed workers.",
  "derived demand": "Labour demand that arises from demand for goods/services.",
  "strike action": "Workers withdrawing labour to protest.",
  "overtime ban": "Employees refusing to work extra hours beyond their contract.",
  "work to rule": "Workers strictly following contract terms, avoiding extra effort.",
  "go slow": "Workers intentionally slowing down to pressure employers.",
  "collective bargaining": "Negotiations between employers and employees for agreements.",
  "productivity agreement": "Employers increasing pay in exchange for higher worker output.",
  "primary sector": "The extraction of raw materials and natural resources",
  "secondary sector": "Manufactures goods and processes raw materials",
  "tertiary sector": "Provides service to it's customers", 
};

// Science Knowledge Base
const scienceResponses = {
  // Add science terms here if needed
};

// ===== CORE FUNCTIONS =====

// Get current response database
function getCurrentResponses() {
  return currentBot === "economics" ? economicsResponses : scienceResponses;
}

// Calculate similarity between two strings
function calculateSimilarity(input, correct) {
  const distance = levenshteinDistance(input, correct);
  const maxLength = Math.max(input.length, correct.length);
  return maxLength > 0 ? 1 - (distance / maxLength) : 0;
}

// Check if answer is correct (with typo tolerance)
function checkAnswer(userInput, correctTerm) {
  const responses = getCurrentResponses();

  // Direct match check
  if (responses[userInput] !== undefined) {
    return userInput === correctTerm;
  }
  
  // Fuzzy match fallback
  const similarity = calculateSimilarity(userInput, correctTerm);
  return similarity >= SIMILARITY_THRESHOLD;
}

// Switch between economics and science modes
function switchBot() {
  // Save current chat before switching
  saveCurrentChat();
  
  // Toggle bot mode
  currentBot = currentBot === "economics" ? "science" : "economics";
  document.getElementById("switchBot").textContent = 
    `Switch to ${currentBot === "economics" ? "Science" : "Economics"}`;
  
  // Reset quiz state
  waitingForAnswer = false;
  
  // Load the other bot's chat
  restoreChat();
  updateStreak();
}

// Save current chat to history
function saveCurrentChat() {
  const chatbox = document.getElementById("chatbox");
  botData[currentBot].chatHistory = Array.from(chatbox.children).map(el => ({
    html: el.innerHTML,
    className: el.className
  }));
}

// Restore chat from history
function restoreChat() {
  const chatbox = document.getElementById("chatbox");
  chatbox.innerHTML = '';
  
  botData[currentBot].chatHistory.forEach(msg => {
    const message = document.createElement("div");
    message.className = msg.className;
    message.innerHTML = msg.html;
    chatbox.appendChild(message);
  });
  
  scrollChatbox();
}

// Handle message sending
function sendMessage() {
  const inputField = document.getElementById("userInput");
  const userInput = inputField.value.trim().toLowerCase();

  if (!userInput) return;

  appendMessage(userInput, "user-text");

  const responses = getCurrentResponses();
  const terms = Object.keys(responses);

  let botResponse = "";

  if (waitingForAnswer) {
    waitingForAnswer = false;
    const closestMatch = findClosestMatch(userInput, [correctTerm]);

    if (closestMatch) {
      botData[currentBot].streak++;
      botResponse = `✅ <strong>Correct!</strong> It was "${correctTerm}".<br>🔥 Streak: ${botData[currentBot].streak}`;
    } else {
      botData[currentBot].streak = 0;
      botResponse = `❌ <strong>That's not right...</strong> <br>The answer was "${correctTerm}".`;
    }
    updateStreak();
  } else if (userInput === "ask") {
    correctTerm = terms[Math.floor(Math.random() * terms.length)];
    botResponse = `🤔 <strong>Guess the ${currentBot} term:</strong><br>"${responses[correctTerm]}"`;
    waitingForAnswer = true;
  } else {
    // NEW: Find closest match when looking up a definition
    const closestMatch = findClosestMatch(userInput, terms);
    botResponse = closestMatch
      ? `📖 <strong>${closestMatch}:</strong> ${responses[closestMatch]}`
      : `I don't recognize that ${currentBot} term. Try another or type <strong>'ask'</strong> to quiz yourself!`;
  }

  appendMessage(botResponse, "bot-text");
  inputField.value = "";
  scrollChatbox();
}

function findClosestMatch(input, terms) {
  let closestMatch = "";
  let minDistance = Infinity;

  for (const term of terms) {
    const distance = levenshteinDistance(input, term); // Change this line to use 'levenshteinDistance'
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = term;
    }
  }

  return minDistance <= 2 ? closestMatch : null; // Allow small typo tolerance
}


// ===== HELPER FUNCTIONS =====

// Add message to chat
function appendMessage(content, className) {
  const message = document.createElement("div");
  message.className = className;
  message.innerHTML = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  document.getElementById("chatbox").appendChild(message);
}

// Update streak display
function updateStreak() {
  document.getElementById("streakCount").textContent = botData[currentBot].streak;
}

// Scroll chat to bottom
function scrollChatbox() {
  const chatbox = document.getElementById("chatbox");
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Calculate Levenshtein distance
function levenshteinDistance(a, b) {
  if (!a || !b) return Math.max(a?.length || 0, b?.length || 0);
  
  const matrix = Array.from({ length: a.length + 1 }, () => 
    Array(b.length + 1).fill(0));
  
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  // Set up event listeners
  document.getElementById("sendButton").addEventListener("click", sendMessage);
  document.getElementById("userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  document.getElementById("switchBot").addEventListener("click", switchBot);
  
  // Initialize UI
  restoreChat();
  updateStreak();
});

