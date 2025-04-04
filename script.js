let waitingForAnswer = false;
let correctTerm = "";
let streakCounter = 0;

let responses = {
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
  "market": "Where buyers and sellers exchange goods and services at a particular price.",
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
  "tertiary sector": "Provides service to it's customers"
};

function sendMessage() {
  let inputField = document.getElementById("userInput");
  let userInput = inputField.value.trim().toLowerCase();
  if (!userInput) return;

  appendMessage(userInput, "user-text");

  let botResponse = "";

  if (waitingForAnswer) {
    waitingForAnswer = false;
    let similarity = 1 - levenshteinDistance(userInput, correctTerm) / Math.max(userInput.length, correctTerm.length);
    if (similarity >= 0.6) {
      streakCounter++;
      botResponse = `✅ Correct! It was "${correctTerm}".\n Streak: ${streakCounter} 🔥`;
    } else {
      streakCounter = 0;
      botResponse = `❌ Nope, the answer was "${correctTerm}". Try again!`;
    }
  } else if (userInput === "ask") {
    let keys = Object.keys(responses);
    correctTerm = keys[Math.floor(Math.random() * keys.length)];
    botResponse = `🤔 Guess the term:\n"${responses[correctTerm]}"`;
    waitingForAnswer = true;
  } else {
    botResponse = getBotResponse(userInput);
  }

  appendMessage(botResponse, "bot-text");
  inputField.value = "";
  document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight;
}

function appendMessage(text, className) {
  const message = document.createElement("p");
  message.className = className;
  message.innerText = text;
  document.getElementById("chatbox").appendChild(message);
}

function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[a.length][b.length];
}

function getBotResponse(input) {
  if (responses[input]) return responses[input];

  let closest = null, minDist = Infinity, threshold = Math.floor(input.length * 0.4);
  for (let key in responses) {
    let dist = levenshteinDistance(input, key);
    if (dist < minDist && dist <= threshold) {
      minDist = dist;
      closest = key;
    }
  }

  if (closest) return `Did you mean "${closest}"?\n${responses[closest]}`;
  return "That doesn't seem right 💀 — try again or type 'ask' for a random definition.";
}

document.getElementById("userInput").addEventListener("keypress", function (event) {
  if (event.key === "Enter") sendMessage();
});
