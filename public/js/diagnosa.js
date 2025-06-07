// public/js/diagnosa.js
async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userMessage = input.value;
  if (!userMessage) return;

  chatBox.innerHTML += `<div><strong>Anda:</strong> ${userMessage}</div>`;

  const response = await fetch("/diagnosa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });

  const data = await response.json();
  chatBox.innerHTML += `<div><strong>Bot:</strong> ${data.reply}</div>`;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}
