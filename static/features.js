// features.js - Additional features for OLFU Chatbot
// This file adds personalization, FAQ section, and dark mode

document.addEventListener('DOMContentLoaded', function() {
    // Add feature UI elements
    addFeatureUI();
    
    // Initialize features
    initializePersonalization();
    initializeFAQSection();
    initializeDarkMode();
});

// ========== FEATURE UI ELEMENTS ==========
function addFeatureUI() {
    // Add chat controls to the header
    const chatHeader = document.querySelector('.chat-header');
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'chat-controls';
    
    // Add dark mode toggle
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.className = 'control-btn';
    darkModeToggle.title = "Toggle Dark Mode";
    darkModeToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    
    // Add FAQ button
    const faqButton = document.createElement('button');
    faqButton.id = 'faq-button';
    faqButton.className = 'control-btn';
    faqButton.title = "Frequently Asked Questions";
    faqButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    
    // Add buttons to controls
    controlsContainer.appendChild(darkModeToggle);
    controlsContainer.appendChild(faqButton);
    chatHeader.appendChild(controlsContainer);
    
    // Add FAQ Modal
    const faqModal = document.createElement('div');
    faqModal.id = 'faq-modal';
    faqModal.className = 'modal';
    faqModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Frequently Asked Questions</h3>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body" id="faq-body">
                <div class="faq-category">
                    <h4>Admissions</h4>
                    <button class="faq-question">Is there an entrance exam?</button>
                    <button class="faq-question">What are the admission requirements?</button>
                    <button class="faq-question">How do I apply for SHS?</button>
                </div>
                <div class="faq-category">
                    <h4>Programs</h4>
                    <button class="faq-question">Tell me about STEM strand</button>
                    <button class="faq-question">What is SHS Plus program?</button>
                    <button class="faq-question">Can I shift strands after enrollment?</button>
                </div>
                <div class="faq-category">
                    <h4>Fees & Financial Aid</h4>
                    <button class="faq-question">How much is the tuition fee?</button>
                    <button class="faq-question">What scholarships are available?</button>
                    <button class="faq-question">How does the voucher program work?</button>
                </div>
                <div class="faq-category">
                    <h4>Campus Life</h4>
                    <button class="faq-question">What facilities are available?</button>
                    <button class="faq-question">Where is the campus located?</button>
                    <button class="faq-question">What student organizations can I join?</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(faqModal);
    
    // Create personalization welcome card for first-time users
    const welcomeCard = document.createElement('div');
    welcomeCard.id = 'welcome-card';
    welcomeCard.className = 'welcome-card hidden';
    welcomeCard.innerHTML = `
        <div class="welcome-content">
            <h3>Welcome to AltaFatima Chatbot! 👋</h3>
            <p>I'd like to personalize your experience. Could you tell me a bit about yourself?</p>
            <div class="welcome-form">
                <div class="welcome-input-group">
                    <label for="user-name">Your Name:</label>
                    <input type="text" id="user-name" placeholder="Enter your name">
                </div>
                <div class="welcome-input-group">
                    <label>Interested in which strand?</label>
                    <div class="strand-options">
                        <button class="strand-btn" data-strand="STEM">STEM</button>
                        <button class="strand-btn" data-strand="ABM">ABM</button>
                        <button class="strand-btn" data-strand="HUMSS">HUMSS</button>
                        <button class="strand-btn" data-strand="GAS">GAS</button>
                    </div>
                </div>
                <button id="save-preferences" class="welcome-submit-btn">Start Chatting</button>
            </div>
        </div>
    `;
    document.body.appendChild(welcomeCard);
}

// ========== PERSONALIZATION ==========
function initializePersonalization() {
    const chatBody = document.getElementById('chat-body');
    const welcomeCard = document.getElementById('welcome-card');
    const savePrefsBtn = document.getElementById('save-preferences');
    const userNameInput = document.getElementById('user-name');
    const strandButtons = document.querySelectorAll('.strand-btn');
    let selectedStrand = null;
    
    // Check if user preferences already exist
    const userPrefs = JSON.parse(localStorage.getItem('olfuUserPrefs'));
    
    // Show welcome card only for first-time users
    if (!userPrefs) {
        welcomeCard.classList.remove('hidden');
    }
    
    // Handle strand selection
    strandButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            strandButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            selectedStrand = this.getAttribute('data-strand');
        });
    });
    
    // Save user preferences
    savePrefsBtn.addEventListener('click', function() {
        const userName = userNameInput.value.trim();
        
        if (userName) {
            // Save preferences to localStorage
            const userPrefs = {
                name: userName,
                strand: selectedStrand || 'Not specified',
                dateJoined: new Date().toISOString(),
                darkMode: false
            };
            
            localStorage.setItem('olfuUserPrefs', JSON.stringify(userPrefs));
            
            // Hide welcome card
            welcomeCard.classList.add('hidden');
            
            // Send personalized welcome message
            sendPersonalizedWelcome(userName, selectedStrand);
        } else {
            // Show error if name is empty
            userNameInput.classList.add('error');
            setTimeout(() => userNameInput.classList.remove('error'), 1000);
        }
    });
    
    // If user already exists, check if we need to update the initial greeting
    if (userPrefs && chatBody.childElementCount <= 2) {
        // Update the initial greeting if only the default greeting exists
        const initialMessage = chatBody.querySelector('.bot-message');
        if (initialMessage) {
            initialMessage.innerHTML = `Hello there, ${userPrefs.name}! 😊 I'm Oli, your friendly OLFU Antipolo Senior High School Assistant! 🎉 Got questions about our ${userPrefs.strand} strand or other programs? I'm here to help—just ask away! 💚✨
                <div class="message-time">Now</div>`;
        }
    }
}

function sendPersonalizedWelcome(name, strand) {
    // Create a personalized message based on user preferences
    let welcomeMsg = `Hello, ${name}! 😊 I'm Oli, your friendly OLFU Antipolo Senior High School Assistant!`;
    
    if (strand) {
        welcomeMsg += ` I see you're interested in our ${strand} strand, that's great! Feel free to ask me anything about that program or our other offerings at OLFU Antipolo.`;
    } else {
        welcomeMsg += ` Feel free to ask me anything about our programs and services at OLFU Antipolo SHS!`;
    }
    
    // Send as a bot message
    addMessage(welcomeMsg, false);
    
    // Add some suggested questions based on strand interest
    const suggestedQuestions = getStrandSpecificQuestions(strand);
    addQuickReplies(suggestedQuestions);
}

function getStrandSpecificQuestions(strand) {
    // Return strand-specific questions
    const commonQuestions = [
        "What are the admission requirements?",
        "How much is the tuition fee?"
    ];
    
    const strandQuestions = {
        'STEM': [
            "Tell me more about the STEM curriculum",
            "What careers can STEM lead to?",
            "Are there STEM-specific scholarships?"
        ],
        'ABM': [
            "What subjects are taught in ABM?",
            "What college courses match with ABM?",
            "What skills will I learn in ABM?"
        ],
        'HUMSS': [
            "What makes HUMSS special at OLFU?",
            "What electives are available in HUMSS?",
            "Is HUMSS good for law school preparation?"
        ],
        'GAS': [
            "How flexible is the GAS curriculum?",
            "Can GAS students specialize later?",
            "What makes GAS different from other strands?"
        ]
    };
    
    // Return strand-specific questions or general questions if no strand selected
    if (strand && strandQuestions[strand]) {
        return [...strandQuestions[strand].slice(0, 2), ...commonQuestions];
    } else {
        return [
            "Tell me about STEM strand",
            "What is SHS Plus program?",
            "What are the admission requirements?",
            "How much is the tuition fee?"
        ];
    }
}

// ========== FAQ SECTION ==========
function initializeFAQSection() {
    const faqButton = document.getElementById('faq-button');
    const faqModal = document.getElementById('faq-modal');
    const modalClose = faqModal.querySelector('.modal-close');
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Open FAQ modal
    faqButton.addEventListener('click', function() {
        faqModal.style.display = 'flex';
    });
    
    // Close FAQ modal
    modalClose.addEventListener('click', function() {
        faqModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === faqModal) {
            faqModal.style.display = 'none';
        }
    });
    
    // Handle FAQ question clicks
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const questionText = this.textContent;
            
            // Close the modal
            faqModal.style.display = 'none';
            
            // Send the question as if user typed it
            const userInput = document.getElementById('user-input');
            userInput.value = questionText;
            
            // Trigger send message
            const sendButton = document.getElementById('send-button');
            sendButton.click();
        });
    });
}

// ========== DARK MODE ==========
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const userPrefs = JSON.parse(localStorage.getItem('olfuUserPrefs')) || {};
    
    // Apply dark mode if previously set
    if (userPrefs.darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('click', function() {
        // Toggle dark mode class on body
        document.body.classList.toggle('dark-mode');
        
        // Update user preferences
        const isDarkMode = document.body.classList.contains('dark-mode');
        userPrefs.darkMode = isDarkMode;
        localStorage.setItem('olfuUserPrefs', JSON.stringify(userPrefs));
    });
}

// ========== HELPER FUNCTIONS ==========
// These functions are extensions of or similar to your existing code

// Check if the original addMessage function exists and extend it,
// otherwise create a compatible version
function addMessage(message, isUser = false) {
    // Try to access the existing function from your script.js
    if (typeof window.addMessage === 'function') {
        // Use the original function
        window.addMessage(message, isUser);
    } else {
        // Create a compatible implementation
        const chatBody = document.getElementById('chat-body');
        
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
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(timeDiv);
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Save message to history if the function exists
        if (typeof saveMessageToHistory === 'function') {
            saveMessageToHistory(message, isUser);
        }
    }
}

// Similar approach for addQuickReplies
function addQuickReplies(suggestions) {
    if (typeof window.addQuickReplies === 'function') {
        window.addQuickReplies(suggestions);
    } else {
        const container = document.getElementById('quick-reply-container');
        container.innerHTML = '';

        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.classList.add('quick-reply-btn');
            button.textContent = suggestion;
            button.addEventListener('click', () => {
                document.getElementById('user-input').value = suggestion;
                // Find and trigger the send button click
                document.getElementById('send-button').click();
                container.innerHTML = '';
            });
            container.appendChild(button);
        });
    }
}
