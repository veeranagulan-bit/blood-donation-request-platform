let map;

// ✅ NEW 10 CHAT QUESTIONS (YOUR REQUEST)
const questions = [
  "What is blood donation?",
  "How to register donor?",
  "Who can donate blood?",
  "What is minimum age?",
  "What is minimum weight?",
  "Is blood donation safe?",
  "How to find donor near me?",
  "What are blood groups?",
  "How often can I donate?",
  "Emergency blood request help"
];

// MAP
function loadMap() {
  map = L.map("map").setView([11.0168, 76.9558], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  loadAll();
}

// LOAD DONORS
async function loadAll() {
  let res = await fetch("http://localhost:3000/donors");
  let data = await res.json();

  data.forEach(d => {
    L.marker([d.lat, d.lng])
      .addTo(map)
      .bindPopup(`${d.name} - ${d.group}`);
  });
}

// REGISTER (FIXED)
async function registerDonor() {
  navigator.geolocation.getCurrentPosition(async pos => {

    const data = {
      name: document.getElementById("name").value,
      group: document.getElementById("group").value,
      phone: document.getElementById("phone").value,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    if (!data.name || !data.group || !data.phone) {
      alert("Fill all fields");
      return;
    }

    await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    document.getElementById("msg").innerText = "Registered Successfully!";
  },
  () => alert("Enable location"));
}

// FIND DONOR
async function findDonor() {
  let blood = document.getElementById("blood").value;

  let res = await fetch("http://localhost:3000/donors/" + blood);
  let data = await res.json();

  let out = "";
  data.forEach(d => {
    out += `${d.name} - ${d.phone}<br>`;
  });

  document.getElementById("result").innerHTML = out;
}

// ELIGIBILITY
function checkEligibility() {
  let a = age.value;
  let w = weight.value;

  eligibility.innerText =
    (a >= 18 && w >= 50) ? "Eligible" : "Not Eligible";
}

// CHATBOT (UPDATED ANSWERS)
function sendChat() {
  let q = chatinput.value.toLowerCase();
  let ans = "";

  if (q.includes("blood")) ans = "Blood saves lives and helps patients";
  else if (q.includes("register")) ans = "Fill form and click register button";
  else if (q.includes("donor")) ans = "Donors are people who give blood";
  else if (q.includes("eligible")) ans = "Age 18+ and weight 50kg+ required";
  else if (q.includes("safe")) ans = "Yes, blood donation is safe";
  else if (q.includes("emergency")) ans = "Search nearest donor or contact hospital";
  else if (q.includes("blood group")) ans = "A, B, AB, O are main groups";
  else if (q.includes("how often")) ans = "Every 3 months you can donate";
  else ans = "Ask about donor, register, eligibility, emergency";

  chatArea.innerHTML +=
    `<div class='userMsg'>${q}</div>
     <div class='botMsg'>${ans}</div>`;

  chatinput.value = "";
}

// QUICK BUTTONS (SHOW FULL QUESTIONS)
function quick(n) {
  chatinput.value = questions[n - 1];
  sendChat();
}

window.onload = loadMap;