// ==================== DATA MODELS ====================

/**
 * Todo Class: Represents a single todo item
 */
class Todo {
    constructor(id, title, description = '', dueDate = '', priority = 'Medium', project = 'home', status = 'Todo') {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority; // 'Low', 'Medium', 'High'
        this.project = project; // 'daily', 'weekly', 'monthly', 'someday'
        this.status = status; // 'Todo', 'Started', or 'Done'
        this.createdAt = new Date().toISOString();
    }

    moveBackward() {
        const statuses = ['Todo', 'Started', 'Done'];
        const currentIndex = statuses.indexOf(this.status);
        if (currentIndex > 0) {
            this.status = statuses[currentIndex - 1];
        }
    }

    moveForward() {
        const statuses = ['Todo', 'Started', 'Done'];
        const currentIndex = statuses.indexOf(this.status);
        if (currentIndex < statuses.length - 1) {
            this.status = statuses[currentIndex + 1];
        }
    }

    formatDate() {
        if (!this.dueDate) return '';
        const date = new Date(this.dueDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// ==================== APP STATE & STORAGE ====================

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('nav a');
    const homeDashboard = document.getElementById('home-dashboard');
    const sectionGrid = document.getElementById('section-grid');
    const taskTextInput = document.getElementById('task-text-input');
    const taskProjectSelect = document.getElementById('task-project-select');
    const taskPrioritySelect = document.getElementById('task-priority-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskLists = document.querySelectorAll('.task-list');
    const toast = document.getElementById('toast');
    const editModal = document.getElementById('edit-modal');

    // State
    let allTodos = [];
    let currentProject = 'home';
    let nextId = 1;
    let editingTodoId = null;

    // ==================== STORAGE ====================

    const loadTodos = () => {
        const stored = localStorage.getItem('todoAppData');
        if (!stored) return [];
        
        const data = JSON.parse(stored);
        // Rehydrate as Todo instances
        return data.map(t => {
            const todo = new Todo(t.id, t.title, t.description, t.dueDate, t.priority, t.project, t.status);
            todo.createdAt = t.createdAt;
            return todo;
        });
    };

    const saveTodos = () => {
        localStorage.setItem('todoAppData', JSON.stringify(allTodos));
        localStorage.setItem('todoAppNextId', JSON.stringify(nextId));
    };

    const initializeData = () => {
        allTodos = loadTodos();
        const stored = localStorage.getItem('todoAppNextId');
        nextId = stored ? JSON.parse(stored) : 1;
        
        if (allTodos.length === 0) {
            nextId = 1;
            const welcome = new Todo(
                nextId++,
                'Welcome to Your Todo App!',
                'Click on any task card to edit details, priority, and due dates.',
                '',
                'Medium',
                'daily',
                'Todo'
            );
            allTodos.push(welcome);
            saveTodos();
        }
    };

    // ==================== UI FUNCTIONS ====================

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    const createTaskCard = (todo) => {
        const card = document.createElement('div');
        card.className = `task priority-${todo.priority.toLowerCase()}`;
        card.dataset.id = todo.id;

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = todo.title;
        if (todo.dueDate) {
            taskText.innerHTML += `<span class="task-date"> • ${todo.formatDate()}</span>`;
        }

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        // Left side actions
        const leftActions = document.createElement('div');
        leftActions.className = 'actions-left';

        const editBtn = document.createElement('button');
        editBtn.className = 'action-icon edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Task Details';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(todo);
        });

        const backBtn = document.createElement('button');
        backBtn.className = 'action-icon back-btn';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backBtn.title = 'Move to Previous Status';
        if (todo.status === 'Todo') {
            backBtn.style.display = 'none';
        } else {
            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                todo.moveBackward();
                saveTodos();
                render();
            });
        }

        leftActions.appendChild(editBtn);
        leftActions.appendChild(backBtn);

        // Right side actions
        const rightActions = document.createElement('div');
        rightActions.className = 'actions-right';

        const forwardBtn = document.createElement('button');
        forwardBtn.className = 'action-icon play-btn';
        forwardBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
        forwardBtn.title = 'Move to Next Status';
        forwardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            todo.moveForward();
            saveTodos();
            render();
        });

        const doneBtn = document.createElement('button');
        doneBtn.className = 'action-icon check-btn';
        doneBtn.innerHTML = '<i class="fas fa-check"></i>';
        doneBtn.title = 'Mark as Done';
        doneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            todo.status = 'Done';
            saveTodos();
            render();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-icon delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Task';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(card, todo);
        });

        rightActions.appendChild(forwardBtn);
        rightActions.appendChild(doneBtn);
        rightActions.appendChild(deleteBtn);

        taskActions.appendChild(leftActions);
        taskActions.appendChild(rightActions);

        card.appendChild(taskText);
        card.appendChild(taskActions);

        return card;
    };

    const showDeleteConfirmation = (card, todo) => {
        const originalContent = card.innerHTML;
        card.classList.add('delete-confirming');
        card.innerHTML = '';

        const message = document.createElement('div');
        message.className = 'delete-confirm-message';
        message.textContent = 'Confirm Delete?';

        const buttons = document.createElement('div');
        buttons.className = 'delete-confirm-buttons';

        const yesBtn = document.createElement('button');
        yesBtn.className = 'confirm-yes';
        yesBtn.textContent = 'Yes';
        yesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.add('fade-out');
            setTimeout(() => {
                allTodos = allTodos.filter(t => t.id !== todo.id);
                saveTodos();
                card.remove();
                showToast('Task Deleted');
            }, 300);
        });

        const noBtn = document.createElement('button');
        noBtn.className = 'confirm-no';
        noBtn.textContent = 'No';
        noBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.remove('delete-confirming');
            card.innerHTML = originalContent;
            // Re-render to reattach listeners
            render();
        });

        buttons.appendChild(yesBtn);
        buttons.appendChild(noBtn);
        card.appendChild(message);
        card.appendChild(buttons);
    };

    const openEditModal = (todo) => {
        editingTodoId = todo.id;
        document.getElementById('modal-title').value = todo.title;
        document.getElementById('modal-description').value = todo.description;
        document.getElementById('modal-priority').value = todo.priority;
        document.getElementById('modal-due-date').value = todo.dueDate;
        editModal.classList.add('show');
    };

    const closeEditModal = () => {
        editingTodoId = null;
        editModal.classList.remove('show');
    };

    const saveEditModal = () => {
        const title = document.getElementById('modal-title').value.trim();
        const description = document.getElementById('modal-description').value;
        const priority = document.getElementById('modal-priority').value;
        const dueDate = document.getElementById('modal-due-date').value;

        if (!title) {
            showToast('Title cannot be empty');
            return;
        }

        const todo = allTodos.find(t => t.id === editingTodoId);
        if (todo) {
            todo.title = title;
            todo.description = description;
            todo.priority = priority;
            todo.dueDate = dueDate;
            saveTodos();
            closeEditModal();
            render();
            showToast('Task Updated');
        }
    };

    const updateAddButtonState = () => {
        const hasText = taskTextInput.value.trim().length > 0;
        const hasProject = taskProjectSelect.value.length > 0;
        addTaskBtn.disabled = !hasText || !hasProject;
    };

    const render = () => {
        if (currentProject === 'home') {
            homeDashboard.style.display = 'flex';
            sectionGrid.classList.remove('visible');
        } else {
            homeDashboard.style.display = 'none';
            sectionGrid.classList.add('visible');
            renderTasks();
        }
    };

    const renderTasks = () => {
        taskLists.forEach(list => {
            list.innerHTML = '';
        });

        const projectTodos = allTodos.filter(t => t.project === currentProject);

        const statuses = ['Todo', 'Started', 'Done'];
        statuses.forEach(status => {
            const taskList = document.querySelector(`.task-list[data-status="${status}"]`);
            if (taskList) {
                const statusTodos = projectTodos.filter(t => t.status === status);
                statusTodos.forEach(todo => {
                    const card = createTaskCard(todo);
                    taskList.appendChild(card);
                });
            }
        });
    };

    // ==================== EVENT LISTENERS ====================

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            currentProject = this.dataset.project;
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            render();
        });
    });

    // Add Task
    addTaskBtn.addEventListener('click', () => {
        const title = taskTextInput.value.trim();
        const project = taskProjectSelect.value;
        const priority = taskPrioritySelect.value;

        if (!title || !project) {
            showToast('Please fill in all fields');
            return;
        }

        const newTodo = new Todo(nextId++, title, '', '', priority, project, 'Todo');
        allTodos.push(newTodo);
        saveTodos();
        taskTextInput.value = '';
        taskProjectSelect.value = '';
        taskPrioritySelect.value = 'Medium';
        updateAddButtonState();
        showToast('Task Added!');
        render();
    });

    taskTextInput.addEventListener('input', updateAddButtonState);
    taskProjectSelect.addEventListener('change', updateAddButtonState);

    taskTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTaskBtn.click();
    });

    // Modal Controls
    document.getElementById('modal-close').addEventListener('click', closeEditModal);
    document.getElementById('modal-cancel').addEventListener('click', closeEditModal);
    document.getElementById('modal-save').addEventListener('click', saveEditModal);

    window.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    // ==================== INITIALIZATION ====================

    initializeData();
    render();
    updateAddButtonState();
    
    // Set active nav
    navLinks.forEach(link => {
        if (link.dataset.project === currentProject) {
            link.classList.add('active');
        }
    });
});


