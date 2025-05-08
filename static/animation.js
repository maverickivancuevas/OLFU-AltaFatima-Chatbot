// animated-responses.js - Progressive loading animations for OLFU chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Intersection Observer for scroll animations
    const observerOptions = {
        root: document.querySelector('#chat-body'),
        rootMargin: '0px',
        threshold: 0.1
    };

    // Observer for animating messages as they scroll into view
    const messageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const message = entry.target;
                if (!message.classList.contains('animate-visible')) {
                    message.classList.add('animate-visible');
                    messageObserver.unobserve(message);
                }
            }
        });
    }, observerOptions);

    // Override the original addMessage function to include animation capabilities
    const originalAddMessage = window.addMessage || function() {};
    
    window.addMessage = function(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.classList.add('animate-prepare'); // Add animation class

        // Check if the message contains image URLs
        const imageRegex = /(\/static\/[\w\-\.]+\.(jpg|jpeg|png|gif))/gi;
        const imageMatches = message.match(imageRegex);

        // Process message content similar to original function
        let processedMessage = message;
        if (imageMatches && !isUser) {
            processedMessage = message.replace(imageRegex, '');
            const formattedMessage = processedMessage
                .replace(/\n/g, '<br>')
                .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

            messageDiv.innerHTML = formattedMessage;

            imageMatches.forEach(imgSrc => {
                const imgElement = document.createElement('img');
                imgElement.src = imgSrc;
                imgElement.alt = 'OLFU Campus Image';
                imgElement.classList.add('chat-image');
                messageDiv.appendChild(imgElement);
            });
        } else {
            // For bot messages (not user), add progressive text animation container
            if (isUser) {
                const formattedMessage = message
                    .replace(/\n/g, '<br>')
                    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
                messageDiv.innerHTML = formattedMessage;
            } else {
                // Create container for the animated text
                const textContainer = document.createElement('div');
                textContainer.classList.add('progressive-text');
                
                // Process line breaks and URLs
                const formattedMessage = message
                    .replace(/\n/g, '<br>')
                    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
                
                textContainer.innerHTML = formattedMessage;
                messageDiv.appendChild(textContainer);
            }
        }

        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-time');
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(timeDiv);
        const chatBody = document.getElementById('chat-body');
        chatBody.appendChild(messageDiv);
        
        // Start observing the new message for scroll animations
        messageObserver.observe(messageDiv);
        
        // For bot messages, start the typewriter effect
        if (!isUser) {
            setTimeout(() => {
                const textElement = messageDiv.querySelector('.progressive-text');
                if (textElement) {
                    animateText(textElement);
                }
            }, 100);
        }
        
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // If the original function saved to history, call it
        if (window.saveMessageToHistory) {
            window.saveMessageToHistory(message, isUser);
        }
    };

    // Animate text with a typewriter effect
    function animateText(element) {
        const content = element.innerHTML;
        element.innerHTML = '';  // Clear content
        element.style.visibility = 'visible';
        
        // Handle HTML content (preserve tags)
        const htmlContent = parseHtmlContent(content);
        
        let currentIndex = 0;
        let isTag = false;
        let tagBuffer = '';
        let textBuffer = '';
        
        function typeNextCharacter() {
            if (currentIndex < htmlContent.length) {
                const char = htmlContent[currentIndex];
                
                if (char === '<') {
                    // Beginning of an HTML tag
                    isTag = true;
                    // Append accumulated text
                    if (textBuffer) {
                        element.innerHTML += textBuffer;
                        textBuffer = '';
                    }
                    tagBuffer += char;
                } else if (char === '>' && isTag) {
                    // End of an HTML tag
                    isTag = false;
                    tagBuffer += char;
                    element.innerHTML += tagBuffer;
                    tagBuffer = '';
                } else if (isTag) {
                    // Inside an HTML tag
                    tagBuffer += char;
                } else {
                    // Regular text
                    textBuffer += char;
                    if (textBuffer.length >= 3 || currentIndex === htmlContent.length - 1) {
                        element.innerHTML += textBuffer;
                        textBuffer = '';
                    }
                }
                
                currentIndex++;
                
                // Type next character based on whether we're in a tag
                const typeSpeed = isTag ? 0 : Math.floor(Math.random() * 10) + 15;
                setTimeout(typeNextCharacter, typeSpeed);
                
                // Auto-scroll as text appears
                const chatBody = document.getElementById('chat-body');
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }
        
        // Start typing
        setTimeout(typeNextCharacter, 200);
    }

    // Helper function to handle HTML content
    function parseHtmlContent(html) {
        return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    // Modify the original typing indicator to use animated dots
    const originalShowTypingIndicator = window.showTypingIndicator || function() {};
    
    window.showTypingIndicator = function() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('bot-typing', 'animate-typing');
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingDiv.appendChild(dot);
        }
        
        const chatBody = document.getElementById('chat-body');
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    // Function to handle animation of existing messages when page loads
    function setupExistingMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            // For existing bot messages, wrap content in progressive-text container
            if (message.classList.contains('bot-message') && !message.querySelector('.progressive-text')) {
                const content = message.innerHTML;
                const timeElement = message.querySelector('.message-time');
                let newContent = content;
                
                if (timeElement) {
                    newContent = content.replace(timeElement.outerHTML, '');
                    message.innerHTML = '';
                    
                    const textContainer = document.createElement('div');
                    textContainer.classList.add('progressive-text', 'already-visible');
                    textContainer.innerHTML = newContent;
                    
                    message.appendChild(textContainer);
                    message.appendChild(timeElement);
                }
            }
            
            message.classList.add('animate-prepare');
            messageObserver.observe(message);
        });
    }

    // Initialize existing messages
    setupExistingMessages();
});