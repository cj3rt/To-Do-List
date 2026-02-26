document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('nav a');
    const homeDashboard = document.getElementById('home-dashboard');
    const sectionGrid = document.getElementById('section-grid');
    const taskTextInput = document.getElementById('task-text-input');
    const taskCategorySelect = document.getElementById('task-category-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskLists = document.querySelectorAll('.task-list');
    const settingsBtn = document.getElementById('settings-btn');
    const layoutBtn = document.getElementById('layout-btn');
    const toast = document.getElementById('toast');

    // State
    let allTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
    let currentSection = 'home';
    let nextId = allTasks.length > 0 ? Math.max(...allTasks.map(t => t.id)) + 1 : 1;

    // Initialize
    render();
    updateNavigation();
    updateAddButtonState();

    // Event Listeners - Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            currentSection = this.dataset.section;
            render();
            updateNavigation();
        });
    });

    // Event Listeners - Add Task
    addTaskBtn.addEventListener('click', function() {
        const text = taskTextInput.value.trim();
        const category = taskCategorySelect.value;

        if (!text) {
            alert('Please enter a task description');
            return;
        }

        if (!category) {
            alert('Please select a category');
            return;
        }

        const newTask = {
            id: nextId++,
            text: text,
            category: category,
            status: 'todo'
        };

        allTasks.push(newTask);
        saveTasks();
        taskTextInput.value = '';
        taskCategorySelect.value = '';
        updateAddButtonState();
        render();
        showToast('Task Added!');
    });

    // Event Listener - Input field to update button state
    taskTextInput.addEventListener('input', updateAddButtonState);
    taskCategorySelect.addEventListener('change', updateAddButtonState);

    // Event Listeners - Task Interactions
    document.addEventListener('click', function(e) {
        // Edit Task Text
        if (e.target.classList.contains('task-text') && currentSection !== 'home') {
            e.stopPropagation();
            const taskElement = e.target.closest('.task');
            const taskId = parseInt(taskElement.dataset.id);
            const task = allTasks.find(t => t.id === taskId);
            if (task) {
                makeEditable(e.target, task);
            }
        }
    });

    // Event Listener - Add Task on Enter
    taskTextInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    // Functions
    function render() {
        if (currentSection === 'home') {
            homeDashboard.style.display = 'flex';
            sectionGrid.classList.remove('visible');
        } else {
            homeDashboard.style.display = 'none';
            sectionGrid.classList.add('visible');
            renderSection();
        }
    }

    function renderSection() {
        // Clear all task lists
        taskLists.forEach(list => {
            list.innerHTML = '';
        });

        // Filter tasks by current section
        const filteredTasks = allTasks.filter(t => t.category === currentSection);

        // Organize tasks by status
        const tasksByStatus = {
            'todo': filteredTasks.filter(t => t.status === 'todo'),
            'started': filteredTasks.filter(t => t.status === 'started'),
            'done': filteredTasks.filter(t => t.status === 'done')
        };

        // Render tasks in each column
        const statuses = ['todo', 'started', 'done'];
        statuses.forEach(status => {
            const taskList = document.querySelector(`.task-list[data-status="${status}"]`);
            if (taskList) {
                tasksByStatus[status].forEach(task => {
                    const taskElement = createTaskElement(task);
                    taskList.appendChild(taskElement);
                });
            }
        });
    }

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task status-${task.status}`;
        taskElement.dataset.id = task.id;

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        // Left side actions container
        const leftActions = document.createElement('div');
        leftActions.className = 'actions-left';

        // Back arrow button - Move backward one status
        const backBtn = document.createElement('button');
        backBtn.className = 'action-icon back-btn';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backBtn.title = 'Move to Previous Status';

        if (task.status === 'todo') {
            backBtn.style.display = 'none';
        } else {
            backBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (task.status === 'started') {
                    task.status = 'todo';
                } else if (task.status === 'done') {
                    task.status = 'started';
                }
                saveTasks();
                render();
            });
        }

        leftActions.appendChild(backBtn);

        // Right side actions container
        const rightActions = document.createElement('div');
        rightActions.className = 'actions-right';

        // Play icon - Move to Started
        const playBtn = document.createElement('button');
        playBtn.className = 'action-icon play-btn';
        playBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
        playBtn.title = 'Move to Next Status';
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (task.status === 'todo') {
                task.status = 'started';
            } else if (task.status === 'started') {
                task.status = 'done';
            }
            saveTasks();
            render();
        });

        // Checkmark icon - Move to Done
        const checkBtn = document.createElement('button');
        checkBtn.className = 'action-icon check-btn';
        checkBtn.innerHTML = '<i class="fas fa-check"></i>';
        checkBtn.title = 'Mark as Done';
        checkBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            task.status = 'done';
            saveTasks();
            render();
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-icon delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Task';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showDeleteConfirmation(taskElement, task);
        });

        rightActions.appendChild(playBtn);
        rightActions.appendChild(checkBtn);
        rightActions.appendChild(deleteBtn);

        taskActions.appendChild(leftActions);
        taskActions.appendChild(rightActions);

        taskElement.appendChild(taskText);
        taskElement.appendChild(taskActions);

        return taskElement;
    }

    function makeEditable(element, task) {
        element.contentEditable = 'true';
        element.classList.add('editing');
        element.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        function finishEditing() {
            element.contentEditable = 'false';
            element.classList.remove('editing');
            const newText = element.textContent.trim();
            if (newText) {
                task.text = newText;
                saveTasks();
                render();
            } else {
                element.textContent = task.text;
            }
        }

        element.addEventListener('blur', finishEditing, { once: true });
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing();
            }
            if (e.key === 'Escape') {
                element.textContent = task.text;
                finishEditing();
            }
        });
    }

    function updateNavigation() {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === currentSection);
        });
    }

    function updateAddButtonState() {
        const hasText = taskTextInput.value.trim().length > 0;
        const hasCategory = taskCategorySelect.value.length > 0;
        addTaskBtn.disabled = !hasText || !hasCategory;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function showDeleteConfirmation(taskElement, task) {
        // Store original content
        const originalContent = taskElement.innerHTML;
        
        // Create confirmation UI
        taskElement.classList.add('delete-confirming');
        taskElement.innerHTML = '';
        
        const confirmMessage = document.createElement('div');
        confirmMessage.className = 'delete-confirm-message';
        confirmMessage.textContent = 'Confirm Delete?';
        
        const confirmButtons = document.createElement('div');
        confirmButtons.className = 'delete-confirm-buttons';
        
        const yesBtn = document.createElement('button');
        yesBtn.className = 'confirm-yes';
        yesBtn.textContent = 'Yes';
        yesBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Fade out and remove
            taskElement.classList.add('fade-out');
            setTimeout(() => {
                allTasks = allTasks.filter(t => t.id !== task.id);
                saveTasks();
                taskElement.remove();
                showToast('Task Deleted');
            }, 300);
        });
        
        const noBtn = document.createElement('button');
        noBtn.className = 'confirm-no';
        noBtn.textContent = 'No';
        noBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Restore original content
            taskElement.classList.remove('delete-confirming');
            taskElement.innerHTML = originalContent;
            // Re-attach event listeners
            reattachTaskListeners(taskElement, task);
        });
        
        confirmButtons.appendChild(yesBtn);
        confirmButtons.appendChild(noBtn);
        
        taskElement.appendChild(confirmMessage);
        taskElement.appendChild(confirmButtons);
    }
    
    function reattachTaskListeners(taskElement, task) {
        // Reattach delete button listener
        const deleteBtn = taskElement.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showDeleteConfirmation(taskElement, task);
            });
        }
        
        // Reattach other button listeners
        const backBtn = taskElement.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (task.status === 'started') {
                    task.status = 'todo';
                } else if (task.status === 'done') {
                    task.status = 'started';
                }
                saveTasks();
                render();
            });
        }
        
        const playBtn = taskElement.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (task.status === 'todo') {
                    task.status = 'started';
                } else if (task.status === 'started') {
                    task.status = 'done';
                }
                saveTasks();
                render();
            });
        }
        
        const checkBtn = taskElement.querySelector('.check-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                task.status = 'done';
                saveTasks();
                render();
            });
        }
    }

    function saveTasks() {
        localStorage.setItem('allTasks', JSON.stringify(allTasks));
    }
});

