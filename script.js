document.addEventListener('DOMContentLoaded', function() {
    // Start Quiz Button
    const startQuizBtn = document.getElementById('startQuizBtn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', function() {
            // Reset correct answers counter when starting a new quiz
            localStorage.setItem('correctAnswers', '0');
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
        option.addEventListener('click', async function() {
            // Reset all options
            options.forEach(opt => {
                opt.classList.remove('selected-correct');
                opt.classList.remove('selected-incorrect');
            });

            // Get the radio input and check it
            const radioInput = this.querySelector('input[type="radio"]');
            radioInput.checked = true;

            // Get current quiz ID from the page
            const currentPage = window.location.pathname.split('/').pop();
            const quizId = parseInt(currentPage.replace('quiz', '').replace('.html', ''));

            // Check if this is the correct answer
            if (this.dataset.correct === 'true') {
                this.classList.add('selected-correct');
                // Enable next button
                if (nextQuizBtn) {
                    nextQuizBtn.disabled = false;
                }
                // Save quiz result
                await handleQuizSubmission(quizId, 1);
            } else {
                this.classList.add('selected-incorrect');
                // Keep next button disabled if answer is incorrect
                if (nextQuizBtn) {
                    nextQuizBtn.disabled = true;
                }
                // Save quiz result
                await handleQuizSubmission(quizId, 0);
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

// Load quiz data from server
async function loadQuizData(quizId) {
    try {
        const response = await fetch(`http://127.0.0.1:5001/api/quiz/${quizId}`);
        if (!response.ok) {
            throw new Error('Failed to load quiz data');
        }
        const quizData = await response.json();
        return quizData;
    } catch (error) {
        console.error('Error loading quiz data:', error);
        return null;
    }
}

// Save user progress
async function saveUserProgress(userId, materialId, status) {
    try {
        const response = await fetch('http://127.0.0.1:5001/api/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                material_id: materialId,
                status: status
            })
        });
        if (!response.ok) {
            throw new Error('Failed to save progress');
        }
        return await response.json();
    } catch (error) {
        console.error('Error saving progress:', error);
        return null;
    }
}

// Save test results
async function saveQuizResult(userId, quizId, score) {
    try {
        const response = await fetch('http://127.0.0.1:5001/api/quiz-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                quiz_id: quizId,
                score: score
            })
        });
        if (!response.ok) {
            throw new Error('Failed to save quiz result');
        }
        return await response.json();
    } catch (error) {
        console.error('Error saving quiz result:', error);
        return null;
    }
}

// Get user stats
async function getUserStats(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:5001/api/stats/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to get user stats');
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting user stats:', error);
        return null;
    }
}

// Modify existing quiz processing functions
async function handleQuizSubmission(quizId, score) {
    const userId = localStorage.getItem('userId') || 'default_user';
    await saveQuizResult(userId, quizId, score);
    
    // Update local storage
    const quizResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
    quizResults[quizId] = score;
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    
    // Calculate total correct answers from quiz results
    const totalCorrect = Object.values(quizResults).reduce((sum, score) => sum + score, 0);
    localStorage.setItem('correctAnswers', totalCorrect.toString());
}

// Modify learning progress handling function
async function handleLearningProgress(materialId) {
    const userId = localStorage.getItem('userId') || 'default_user';
    await saveUserProgress(userId, materialId, 'completed');
    // Update local storage
    const completedMaterials = JSON.parse(localStorage.getItem('completedMaterials') || '[]');
    if (!completedMaterials.includes(materialId)) {
        completedMaterials.push(materialId);
        localStorage.setItem('completedMaterials', JSON.stringify(completedMaterials));
    }
}

// Add function to display statistics
async function displayUserStats() {
    const userId = localStorage.getItem('userId') || 'default_user';
    const stats = await getUserStats(userId);
    if (stats) {
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            // Format the last activity time
            let lastActivityTime = 'No activity yet';
            if (stats.last_activity) {
                const date = new Date(stats.last_activity);
                // Check if the date is valid (not the default timestamp)
                if (date.getFullYear() > 1970) {
                    // Convert to Eastern Time
                    lastActivityTime = date.toLocaleString('en-US', {
                        timeZone: 'America/New_York',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                }
            }

            statsContainer.innerHTML = `
                <h2>Learning Statistics</h2>
                <table class="stats-table">
                    <tr>
                        <th>Completed Learning Materials</th>
                        <td>${stats.completed_materials}</td>
                    </tr>
                    <tr>
                        <th>Number of Tests Completed</th>
                        <td>${stats.total_quizzes}</td>
                    </tr>
                    <tr>
                        <th>Average Score</th>
                        <td>${stats.average_score.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th>Last Activity Time</th>
                        <td>${lastActivityTime}</td>
                    </tr>
                </table>
            `;
        }
    }
} 