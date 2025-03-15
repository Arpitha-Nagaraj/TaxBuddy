function sendQuestion() {
    let question = document.getElementById("taxPrompt").value.trim();
    let chatContainer = document.getElementById("chatContainer");

    if (question.length === 0) {
        alert("⚠️ Please enter a question!");
        return;
    }

    // Add user question to chat
    let userMessage = `<div class="user-message">🧑‍💻 <b>You:</b> ${question}</div>`;
    chatContainer.innerHTML += userMessage;

    // Show AI thinking message
    let aiThinking = `<div class="ai-message"><i>🤖 AI is thinking...</i></div>`;
    chatContainer.innerHTML += aiThinking;

    fetch("http://localhost:3000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question })
    })
    .then(response => response.json())
    .then(data => {
        let answer = data.answer || "Sorry, I couldn't fetch an answer.";

        // Apply formatting
        let formattedAnswer = formatResponse(answer);

        // Remove "Thinking..." message
        chatContainer.removeChild(chatContainer.lastElementChild);

        // Add AI response to chat
        let aiMessage = `<div class="ai-message">🤖 <b>AI:</b> ${formattedAnswer}</div>`;
        chatContainer.innerHTML += aiMessage;
    })
    .catch(error => {
        console.error("Error:", error);

        // Remove "Thinking..." message
        chatContainer.removeChild(chatContainer.lastElementChild);

        // Show error message in chat
        let errorMessage = `<div class="ai-message" style="color: red; font-weight: bold;">⚠️ Error fetching response. Please try again.</div>`;
        chatContainer.innerHTML += errorMessage;

        // Show popup alert
        alert("⚠️ Something went wrong! Check your internet connection or try again later.");
    });
}

// Function to format response
function formatResponse(text) {
    text = text.replace(/\n/g, "<br>");
    text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    text = text.replace(/\* (.*?)<br>/g, "• $1<br>");
    return text;
}

// ✅ **Listen for Enter key press and trigger sendQuestion**
document.getElementById("taxPrompt").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {  // Prevents new line on Shift+Enter
        event.preventDefault(); // Prevent default behavior of Enter key
        sendQuestion(); // Call function to send the question
    }
});
