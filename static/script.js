document.addEventListener('DOMContentLoaded', function() {
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

   // Function to add a message to the chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

    // Check if the message contains image URLs like /static/image.jpg
    const imageRegex = /(\/static\/[\w\-\.]+\.(jpg|jpeg|png|gif))/gi;
    const imageMatches = message.match(imageRegex);

    // Extract and remove image URLs from the message
    let processedMessage = message;
    if (imageMatches && !isUser) {
        // Remove the image URLs from the text
        processedMessage = message.replace(imageRegex, '');

        // Convert URLs to clickable links and preserve line breaks
        const formattedMessage = processedMessage
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        messageDiv.innerHTML = formattedMessage;

        // Add each image found
        imageMatches.forEach(imgSrc => {
            const imgElement = document.createElement('img');
            imgElement.src = imgSrc;
            imgElement.alt = 'OLFU Campus Image';
            imgElement.classList.add('chat-image');
            messageDiv.appendChild(imgElement);
        });
    } else {
        // Convert URLs to clickable links and preserve line breaks
        const formattedMessage = message
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        messageDiv.innerHTML = formattedMessage;
    }

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(timeDiv);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}
    // Function to add an image to the chat
function addImageToChat(imageUrl, caption) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot-message');

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = caption || 'OLFU Campus Image';
    imgElement.classList.add('chat-image');

    messageDiv.appendChild(imgElement);

    if (caption) {
        const captionDiv = document.createElement('div');
        captionDiv.classList.add('image-caption');
        captionDiv.textContent = caption;
        messageDiv.appendChild(captionDiv);
    }

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(timeDiv);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Modify the sendMessage function to handle image responses
async function sendMessage(message) {
    addMessage(message, true);
    userInput.value = '';

    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        removeTypingIndicator();

        // Check if the response includes images
        if (data.images && data.images.length > 0) {
            // Display text response first if available
            if (data.response) {
                addMessage(data.response);
            }

            // Display images
            data.images.forEach(img => {
                addImageToChat(img.url, img.caption);
            });
        } else {
            // Just display text response
            addMessage(data.response);
        }

        // Show quick replies if available
        if (data.quick_replies && data.quick_replies.length > 0) {
            addQuickReplies(data.quick_replies);
        }
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again later.');
    }
}
    function addQuickReplies(suggestions) {
    const container = document.getElementById('quick-reply-container');
    container.innerHTML = '';

    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.classList.add('quick-reply-btn');
        button.textContent = suggestion;
        button.addEventListener('click', () => {
            userInput.value = suggestion;
            sendMessage(suggestion);
            container.innerHTML = '';
        });
        container.appendChild(button);
    });
}

    // Function to show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('bot-typing');
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingDiv.appendChild(dot);
        }
        
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Function to remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Function to send message to server and get response
    async function sendMessage(message) {
        addMessage(message, true);
        userInput.value = '';
        
        showTypingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            removeTypingIndicator();
            addMessage(data.response);
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again later.');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', function() {
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const message = userInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
    });
    // Call this after receiving first bot message
    addQuickReplies([
    "Tell me about STEM",
    "What are the admission requirements?",
    "How much is the tuition fee?",
    "Where is the campus located?"
    ]);
    function saveMessageToHistory(message, isUser) {
    let chatHistory = JSON.parse(localStorage.getItem('olfuChatHistory') || '[]');

    // Add current message with timestamp
    chatHistory.push({
        content: message,
        isUser: isUser,
        timestamp: new Date().toISOString()
    });

    // Limit history to last 50 messages to avoid storage issues
    if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(chatHistory.length - 50);
    }

    // Save back to localStorage
    localStorage.setItem('olfuChatHistory', JSON.stringify(chatHistory));
}

// Function to load chat history
function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem('olfuChatHistory') || '[]');

    if (chatHistory.length > 0) {
        // Add a resume message
        const resumeDiv = document.createElement('div');
        resumeDiv.classList.add('message', 'bot-message', 'system-message');
        resumeDiv.innerHTML = 'Welcome back! Continuing your previous conversation...';
        chatBody.appendChild(resumeDiv);

        // Add previous messages (limit to last 10 for UI clarity)
        const recentMessages = chatHistory.slice(Math.max(chatHistory.length - 10, 0));

        recentMessages.forEach(msg => {
            addMessage(msg.content, msg.isUser, new Date(msg.timestamp));
        });

        // Add a separator
        const separatorDiv = document.createElement('div');
        separatorDiv.classList.add('chat-separator');
        separatorDiv.innerHTML = '<span>New messages</span>';
        chatBody.appendChild(separatorDiv);

        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// Update the addMessage function to include timestamp parameter and save messages
function addMessage(message, isUser = false, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

    // Convert URLs to clickable links and preserve line breaks
    const formattedMessage = message
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

    messageDiv.innerHTML = formattedMessage;

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');

    // Use provided timestamp or current time
    const messageTime = timestamp ? new Date(timestamp) : new Date();
    timeDiv.textContent = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(timeDiv);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Save message to history (only if it's a new message, not loading history)
    if (!timestamp) {
        saveMessageToHistory(message, isUser);
    }
}

// Function to clear chat history
function clearChatHistory() {
    if (confirm('Are you sure you want to clear your chat history?')) {
        localStorage.removeItem('olfuChatHistory');
        // Reload the page to start fresh
        window.location.reload();
    }
}

// Modify your sendMessage function to include the updated addMessage
async function sendMessage(message) {
    addMessage(message, true);
    userInput.value = '';

    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        removeTypingIndicator();
        addMessage(data.response);
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again later.');
    }
}

// Function to add a clear history button
function addClearHistoryButton() {
    const chatHeader = document.querySelector('.chat-header');

    const clearButton = document.createElement('button');
    clearButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>';
    clearButton.classList.add('clear-history-btn');
    clearButton.title = "Clear chat history";
    clearButton.addEventListener('click', clearChatHistory);

    chatHeader.appendChild(clearButton);
}

// Update your DOMContentLoaded event to call these new functions
document.addEventListener('DOMContentLoaded', function() {
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Add Clear History button
    addClearHistoryButton();

    // Load chat history from localStorage
    loadChatHistory();

    // Rest of your existing code...

    // Focus the input field when the page loads
    userInput.focus();
});

    // Focus the input field when the page loads
    userInput.focus();
});
