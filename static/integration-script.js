// animation-integration.js - Helper script to integrate animations

document.addEventListener('DOMContentLoaded', function() {
    // Function to highlight important information in bot messages
    function highlightImportantInfo() {
        // Keywords to highlight in bot responses
        const importantKeywords = [
            'tuition', 'fees', 'requirements', 'deadline', 'application', 'admission',
            'enrollment', 'scholarship', 'voucher', 'STEM', 'ABM', 'HUMSS', 'GAS',
            'SHS Plus', 'Regular Program', 'Important Dates'
        ];
        
        // Find all bot messages
        document.querySelectorAll('.bot-message').forEach(message => {
            // Skip messages that have already been processed
            if (message.dataset.processed) return;
            message.dataset.processed = 'true';
            
            // Get text content
            const content = message.innerHTML;
            
            // Process each keyword
            importantKeywords.forEach(keyword => {
                // Case insensitive search
                const regex = new RegExp(`(${keyword})`, 'gi');
                // Replace with span
                const newContent = content.replace(regex, '<span class="highlight-text">$1</span>');
                message.innerHTML = newContent;
            });
        });
    }
    
    // Function to add animated emojis to responses
    function addAnimatedEmojis() {
        // Find all bot messages containing emojis
        document.querySelectorAll('.bot-message').forEach(message => {
            // Skip messages that have already been processed for emojis
            if (message.dataset.emojiProcessed) return;
            message.dataset.emojiProcessed = 'true';
            
            // Get text content
            let content = message.innerHTML;
            
            // Add subtle animation to emojis
            const emojiRegex = /(\p{Emoji})/gu;
            const newContent = content.replace(emojiRegex, '<span class="animated-emoji">$1</span>');
            message.innerHTML = newContent;
        });
    }
    
    // Add animated emoji styling
    const emojiStyle = document.createElement('style');
    emojiStyle.innerHTML = `
        .animated-emoji {
            display: inline-block;
            transition: transform 0.3s ease;
        }
        .animated-emoji:hover {
            transform: scale(1.3);
            cursor: default;
        }
    `;
    document.head.appendChild(emojiStyle);
    
    // Function to automatically detect and enhance lists in bot messages
    function enhanceLists() {
        document.querySelectorAll('.bot-message').forEach(message => {
            // Skip messages that have already been processed for lists
            if (message.dataset.listProcessed) return;
            message.dataset.listProcessed = 'true';
            
            // Look for bullet points or numbered lists
            const content = message.innerHTML;
            
            // Pattern for dash/bullet/star lists
            const bulletListPattern = /(?:<br>|^)((?:\s*[-•*]\s+.*(?:<br>|$))+)/g;
            const bulletItemPattern = /\s*([-•*])\s+(.*?)(?:<br>|$)/g;
            
            // Pattern for numbered lists
            const numberedListPattern = /(?:<br>|^)((?:\s*\d+\.\s+.*(?:<br>|$))+)/g;
            const numberedItemPattern = /\s*(\d+\.)\s+(.*?)(?:<br>|$)/g;
            
            // Process bullet lists
            let newContent = content.replace(bulletListPattern, (match, listContent) => {
                let listHtml = '<ul class="animated-list">';
                let itemMatch;
                
                // Reset the regex
                bulletItemPattern.lastIndex = 0;
                
                // Process each list item
                while ((itemMatch = bulletItemPattern.exec(listContent)) !== null) {
                    listHtml += `<li>${itemMatch[2]}</li>`;
                }
                
                listHtml += '</ul>';
                return listHtml;
            });
            
            // Process numbered lists
            newContent = newContent.replace(numberedListPattern, (match, listContent) => {
                let listHtml = '<ol class="animated-list">';
                let itemMatch;
                
                // Reset the regex
                numberedItemPattern.lastIndex = 0;
                
                // Process each list item
                while ((itemMatch = numberedItemPattern.exec(listContent)) !== null) {
                    listHtml += `<li>${itemMatch[2]}</li>`;
                }
                
                listHtml += '</ol>';
                return listHtml;
            });
            
            if (newContent !== content) {
                message.innerHTML = newContent;
            }
        });
    }
    
    // Add list animation styling
    const listStyle = document.createElement('style');
    listStyle.innerHTML = `
        .animated-list {
            padding-left: 20px;
            margin: 10px 0;
        }
        .animated-list li {
            opacity: 0;
            transform: translateX(-10px);
            animation: slideInListItem 0.5s ease forwards;
            margin-bottom: 5px;
        }
        @keyframes slideInListItem {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .bot-message .animated-list li:nth-child(1) { animation-delay: 0.1s; }
        .bot-message .animated-list li:nth-child(2) { animation-delay: 0.2s; }
        .bot-message .animated-list li:nth-child(3) { animation-delay: 0.3s; }
        .bot-message .animated-list li:nth-child(4) { animation-delay: 0.4s; }
        .bot-message .animated-list li:nth-child(5) { animation-delay: 0.5s; }
        .bot-message .animated-list li:nth-child(6) { animation-delay: 0.6s; }
        .bot-message .animated-list li:nth-child(7) { animation-delay: 0.7s; }
        .bot-message .animated-list li:nth-child(8) { animation-delay: 0.8s; }
        .bot-message .animated-list li:nth-child(9) { animation-delay: 0.9s; }
        .bot-message .animated-list li:nth-child(10) { animation-delay: 1.0s; }
    `;
    document.head.appendChild(listStyle);
    
    // Enhanced observer to process messages as they appear
    const messageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check after a short delay to ensure content is fully loaded
                setTimeout(() => {
                    highlightImportantInfo();
                    addAnimatedEmojis();
                    enhanceLists();
                }, 100);
            }
        });
    });
    
    // Start observing the chat body for added messages
    messageObserver.observe(document.getElementById('chat-body'), {
        childList: true,
        subtree: true
    });
    
    // Run once on page load for existing messages
    setTimeout(() => {
        highlightImportantInfo();
        addAnimatedEmojis();
        enhanceLists();
    }, 500);
});