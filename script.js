document.addEventListener('DOMContentLoaded', function() {
    // Start Quiz Button
    const startQuizBtn = document.getElementById('startQuizBtn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', function() {
            window.location.href = 'quiz1.html';
        });
    }

    // Next Button
    const nextQuizBtn = document.getElementById('nextQuizBtn');
    if (nextQuizBtn) {
        // Disable next button on drag-drop pages until correct sequence is achieved
        const isDragDropPage = document.querySelector('.drag-drop-container');
        if (isDragDropPage) {
            nextQuizBtn.disabled = true;
        }
        
        nextQuizBtn.addEventListener('click', function() {
            // Get current page and navigate to next page
            const currentPage = window.location.pathname.split('/').pop();
            
            switch(currentPage) {
                case 'quiz1.html':
                    window.location.href = 'quiz2.html';
                    break;
                case 'quiz2.html':
                    window.location.href = 'quiz3.html';
                    break;
                case 'quiz3.html':
                    window.location.href = 'quiz4.html';
                    break;
                case 'quiz4.html':
                    window.location.href = 'quiz5.html';
                    break;
                case 'quiz5.html':
                    window.location.href = 'quiz6.html';
                    break;
                case 'quiz6.html':
                    window.location.href = 'index.html';
                    break;
                default:
                    break;
            }
        });
    }

    // Previous Button
    const prevButton = document.querySelector('.prev-button');
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            // Get current page and navigate to previous page
            const currentPage = window.location.pathname.split('/').pop();
            
            switch(currentPage) {
                case 'quiz1.html':
                    window.location.href = 'index.html';
                    break;
                case 'quiz2.html':
                    window.location.href = 'quiz1.html';
                    break;
                case 'quiz3.html':
                    window.location.href = 'quiz2.html';
                    break;
                case 'quiz4.html':
                    window.location.href = 'quiz3.html';
                    break;
                case 'quiz5.html':
                    window.location.href = 'quiz4.html';
                    break;
                case 'quiz6.html':
                    window.location.href = 'quiz5.html';
                    break;
                default:
                    break;
            }
        });
    }

    // Handle quiz options selection
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            // Reset all options
            options.forEach(opt => {
                opt.classList.remove('selected-correct');
                opt.classList.remove('selected-incorrect');
            });

            // Get the radio input and check it
            const radioInput = this.querySelector('input[type="radio"]');
            radioInput.checked = true;

            // Check if this is the correct answer
            if (this.dataset.correct === 'true') {
                this.classList.add('selected-correct');
                // Enable next button
                if (nextQuizBtn) {
                    nextQuizBtn.disabled = false;
                }
            } else {
                this.classList.add('selected-incorrect');
                // Keep next button disabled if answer is incorrect
                if (nextQuizBtn) {
                    nextQuizBtn.disabled = true;
                }
            }
        });
    });

    // Initialize drag and drop functionality if on those pages
    initDragAndDrop();
});

function initDragAndDrop() {
    const dragItems = document.querySelectorAll('.drag-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    if (!dragItems.length || !dropZones.length) return;

    let draggedItem = null;
    const nextQuizBtn = document.getElementById('nextQuizBtn');
    const dragFeedback = document.querySelector('.drag-feedback');

    // Add event listeners for drag and drop
    dragItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            e.dataTransfer.setData('text/plain', this.dataset.item);
        });

        item.addEventListener('dragend', function() {
            draggedItem = null;
            checkSequence();
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.border = '2px solid #B9FF66';
        });

        zone.addEventListener('dragleave', function() {
            this.style.border = '2px dashed #CCCCCC';
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.border = '2px dashed #CCCCCC';
            
            // Get the item data
            const itemData = e.dataTransfer.getData('text/plain');
            
            // Check if zone already has an item
            if (this.firstChild) {
                this.innerHTML = '';
            }
            
            // Create a clone of the dragged item
            const itemClone = document.createElement('div');
            itemClone.className = 'drag-item';
            itemClone.setAttribute('data-item', itemData);
            itemClone.innerText = itemData;
            
            // Add to drop zone
            this.appendChild(itemClone);
            
            // Check if the sequence is correct
            checkSequence();
        });
    });

    // Function to check if the sequence is correct
    function checkSequence() {
        let isCorrect = true;
        let allFilled = true;
        
        dropZones.forEach(zone => {
            // Check if all zones are filled
            if (!zone.firstChild) {
                allFilled = false;
                return;
            }
            
            // Check if item in zone matches the correct item for that position
            const itemInZone = zone.firstChild.dataset.item;
            const correctItem = zone.dataset.correct;
            
            if (itemInZone !== correctItem) {
                isCorrect = false;
            }
        });
        
        // Only check if all zones are filled
        if (allFilled) {
            if (isCorrect) {
                // Show correct feedback
                if (dragFeedback) {
                    dragFeedback.querySelector('.feedback-correct').style.display = 'block';
                    dragFeedback.querySelector('.feedback-incorrect').style.display = 'none';
                }
                
                // Enable next button
                if (nextQuizBtn) {
                    nextQuizBtn.disabled = false;
                }
            } else {
                // Show incorrect feedback
                if (dragFeedback) {
                    dragFeedback.querySelector('.feedback-correct').style.display = 'none';
                    dragFeedback.querySelector('.feedback-incorrect').style.display = 'block';
                }
                
                // Keep next button disabled
                if (nextQuizBtn) {
                    nextQuizBtn.disabled = true;
                }
            }
        } else {
            // Hide feedback if not all zones are filled
            if (dragFeedback) {
                dragFeedback.querySelector('.feedback-correct').style.display = 'none';
                dragFeedback.querySelector('.feedback-incorrect').style.display = 'none';
            }
        }
    }
} 