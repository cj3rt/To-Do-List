# To-Do List Application

A premium, deep dark-themed Single Page Application for managing to-do lists with a centralized Command Center and section-specific views.

## Features

- **Deep Dark Navy-to-Black Gradient**: Subtle, expensive-looking background transition.
- **Glassmorphism UI**: Dark frosted glass panels with backdrop blur for a modern aesthetic.
- **Centralized Task Creation**: Home page with floating input bar for adding tasks to any section.
- **Section-Specific Views**: Filter tasks by section (Home, Daily, Weekly, Monthly, Someday).
- **Task Management**: Drag-and-drop between status columns, inline editing, delete on hover.
- **Data Persistence**: Tasks saved in localStorage with robust state management.
- **Modern UI**: Dark charcoal task cards, cyan accents, smooth transitions, floating shadows.

## How to Use

1. Open index.html in a modern browser.
2. The Home page shows a centered input bar for adding tasks.
3. Select a section from the dropdown and enter task text, then click Add.
4. Navigate to specific sections (Daily, Weekly, etc.) using the sidebar.
5. In section views, drag tasks between "Didn't start yet", "Already started", and "Done" columns.
6. Click on task text to edit inline (press Enter or click away to save).
7. Hover over tasks to reveal the delete icon.
8. Tasks persist across browser sessions and are filtered by section.

## File Structure

- index.html: Main HTML with Home input bar and section columns.
- styles.css: CSS with navy-to-black gradient, dark glassmorphism, and modern styling.
- script.js: JavaScript for centralized task management, drag-and-drop, inline editing, and localStorage persistence.

## Task Data Structure

Tasks are stored as objects: { id: number, text: string, section: string, status: 'todo'|'in-progress'|'done' }

## Browser Compatibility

Requires modern browsers with CSS backdrop-filter, drag-and-drop API, and contentEditable support.

## Troubleshooting

- Tasks not saving: Ensure localStorage is enabled.
- Drag-and-drop not working: Check browser compatibility.
- Home page not showing: Refresh and ensure 'home' is selected.
- Editing not saving: Click away or press Enter after editing.
