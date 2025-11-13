const ws = new WebSocket('wss://localhost:8080');
const windows: Window[] = [];
let windowCount = 0;

const permissionBtn = document.getElementById('permissionBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLParagraphElement;

/**
 * Queries the current permission status and updates the button text.
 */
async function updatePermissionStatus() {
    if (!('permissions' in navigator)) {
        statusEl.textContent = 'Permissions API not supported.';
        permissionBtn.disabled = true;
        return;
    }

    try {
        const permissionStatus = await navigator.permissions.query({ name: 'window-management' });
        console.log('permissionStatus', permissionStatus);

        // Update button text based on state
        switch (permissionStatus.state) {
            case 'granted':
                permissionBtn.textContent = 'Permission: Granted';
                permissionBtn.disabled = true; // Already granted
                statusEl.textContent = 'Window Management permission is granted.';
                break;
            case 'denied':
                permissionBtn.textContent = 'Permission: Denied';
                permissionBtn.disabled = true; // User must change in browser settings
                statusEl.textContent = 'Permission denied. Please enable in site settings.';
                break;
            case 'prompt':
                permissionBtn.textContent = 'Grant Window Permission';
                permissionBtn.disabled = false;
                statusEl.textContent = 'Click the button to grant permission.';
                break;
        }

        // Listen for changes (e.g., if user revokes it in settings)
        permissionStatus.onchange = () => {
            updatePermissionStatus();
        };

    } catch (err) {
        statusEl.textContent = 'Window Management API not available.';
        permissionBtn.textContent = 'API Not Supported';
        permissionBtn.disabled = true;
        console.log("Error: ", 'Window Management API not available.')
    }
}

/**
 * Handles the click event to request permission.
 */
async function requestPermission() {
    statusEl.textContent = 'Requesting permission...';

    try {
        // Calling getScreenDetails() is what triggers the permission prompt
        await window.getScreenDetails();

        // If successful, update the status
        statusEl.textContent = 'Permission successfully granted!';

    } catch (err) {
        // User denied the prompt
        console.error('Permission request failed:', err);
        statusEl.textContent = 'Permission was not granted.';
    }

    // Refresh the button state after the attempt
    updatePermissionStatus();
}


/**
 * Opens a new child window with a given ID, loading content from 'child.html'.
 * MODIFIED: Now returns the new window object or null.
 */
function openNewWindow(id: number): Window | null {
    const windowName = `childWindow${id}`;
    const url = `/src/child.html?id=${id}`;
    // Stagger windows for visibility
    const offset = 100; // Make offset smaller for 5 windows
    const leftPosition = 100 + (offset * id); // Cascade left
    const topPosition = 100 + (offset * id); // Cascade top

    const windowFeatures = `width=300,height=300,left=${leftPosition},top=${topPosition}`;
    const newWindow = window.open(url, windowName, windowFeatures);

    if (newWindow) {
        windows.push(newWindow);
        // windowOrder.push(id); // REMOVED
        windowCount = windows.filter(w => !w.closed).length;
        return newWindow; // ADDED
    } else {
        console.log('Failed to open a new window. Check your pop-up blocker.');
        return null; // ADDED
    }
}

/**
 * Focuses a specific window by its index (0-based) in the 'windows' array.
 * @param index The index of the window to focus.
 */
function focusWindowByIndex(index: number): void {
    if (index < 0 || index >= windows.length) {
        console.error(`Error: Invalid window index ${index}.`);
        return;
    }

    const windowToFocus = windows[index];

    if (windowToFocus && !windowToFocus.closed) {
        try {
            windowToFocus.focus();
        } catch (e) {
            console.error(`Error focusing window ${index}:`, e);
        }
    } else {
        console.warn(`Warning: Window ${index + 1} is closed or inaccessible.`);
    }
}

/**
 * Sets up a message listener to receive messages from child windows.
 */
function setupChildMessageListener(): void {
    window.addEventListener('message', (event) => {
        // IMPORTANT: In production, verify event.origin for security!

        console.log('📬 Parent received message from origin:', event.origin); // Added console log for all messages
        console.log('📬 Parent received message data:', event.data);

        // Check for the specific message from the first child window
        if (event.data === 'FOCUS_CHILD_WINDOW_2') {
            console.log('Message received from Child 1: "Focus Child Window 2"');
            // The second child window is at index 1
            focusWindowByIndex(1);
        }
    });
    console.log('Parent window message listener initialized.');
}

/**
 * Sets up a Secure WebSocket connection to listen for remote commands.
 */
function setupRemoteControlListener(): void {
    ws.onopen = () => {
        console.log('Connected to WebSocket server. Waiting for commands...');
    };

    ws.onmessage = (event) => {
        console.log('Message received from server:', event.data);

        try {
            const { command, windowIndex } = JSON.parse(event.data);
            if (command === 'focus' && typeof windowIndex === 'number') {
                focusWindowByIndex(windowIndex);
            }
        } catch (error) {
            console.error('Failed to parse incoming message:', error);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error. Is the server running?', error);
    };

    ws.onclose = () => {
        console.warn('Disconnected from WebSocket server.');
    };
}

/**
 * Initializes the application.
 * MODIFIED: Now waits for all windows to load before starting the timer.
 */
function initializeApp(): void {
    // Check if the API is even available in this browser
    if (!('getScreenDetails' in window)) {
        statusEl.textContent = 'Window Management API is not supported by this browser.';
        if (permissionBtn) permissionBtn.disabled = true;
    } else {
        // Set up the permission button
        if (permissionBtn) {
            permissionBtn.addEventListener('click', requestPermission);
        }
        // Check and display the *current* permission status on load
        updatePermissionStatus();
    }

    setupChildMessageListener()

    // MODIFIED: Open 5 windows and wait for them to load
    console.log("Opening 5 windows...");
    const windowLoadPromises: Promise<void>[] = [];

    for (let i = 0; i < 5; i++) {
        const newWindow = openNewWindow(i + 1); // Get the returned window object

        if (newWindow) {
            // Create a promise that resolves on 'load' or rejects on timeout
            const loadPromise = new Promise<void>((resolve, reject) => {
                try {
                    // Add the load listener
                    newWindow.addEventListener('load', () => {
                        console.log(`Window ${i + 1} loaded.`);
                        resolve();
                    }, { once: true }); // Use 'once' to auto-remove listener

                    // Add a timeout in case a window fails to load
                    setTimeout(() => {
                        reject(new Error(`Window ${i + 1} timed out`));
                    }, 500); // 5 second timeout per window
                } catch (e) {
                    // Catch potential cross-origin errors
                    console.error(`Error adding listener to window ${i + 1}. Assuming loaded.`, e);
                    resolve(); // Resolve immediately if listener fails
                }
            });
            windowLoadPromises.push(loadPromise);
        }
    }

    // MODIFIED: Wait for all promises to settle (either resolve or reject)
    // We use allSettled so that even if some windows time out, we still proceed.
    Promise.allSettled(windowLoadPromises)
        .then((results) => {
            const loadedCount = results.filter(r => r.status === 'fulfilled').length;
            const failedCount = results.filter(r => r.status === 'rejected').length;
            console.log(`All windows finished: ${loadedCount} loaded, ${failedCount} timed out/failed.`);
        });

    // This will run *before* windows are loaded, which is fine.
    setupRemoteControlListener();
}

document.addEventListener('DOMContentLoaded', initializeApp);