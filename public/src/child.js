console.log('child.js script started.');

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const h1 = document.getElementById('windowTitle');
const p = document.getElementById('windowText');
const btn_focus = document.getElementById('focus-c-btn');

// Function to send the message to the parent window
function sendMessageToParent() {
    // Check if there is an opener (i.e., this is a child window)
    if (window.opener) {
        // Send a message to the parent window.
        // '*' is used for the target origin for simplicity in this local example, 
        // but it should be the actual parent origin for security in production.
        window.opener.postMessage('FOCUS_CHILD_WINDOW_2', '*');
        console.log('Message sent to parent: FOCUS_CHILD_WINDOW_2');
        btn_focus.textContent = 'Message SENT! Waiting for Parent to Focus...';
        btn_focus.disabled = true; // Disable after one click
    } else {
        console.error('This window does not have an opener.');
    }
}

if (id) {
    h1.textContent = `Window ${id}`;
    p.textContent = `This is child window number ${id}.`;
    document.title = `Child Window ${id}`;
    console.log(`child.html: Content updated for Window ${id}`);
    if (id == 1){
        btn_focus.style.display = 'flex';
        btn_focus.addEventListener('click', sendMessageToParent);
    }

} else {
    console.log('child.html: No ID found in URL parameters.');
}