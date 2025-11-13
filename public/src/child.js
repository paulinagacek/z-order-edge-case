console.log('child.js script started.');

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const h1 = document.getElementById('windowTitle');
const p = document.getElementById('windowText');
const btn_focus = document.getElementById('focus-c-btn');

if (id) {
    h1.textContent = `Window ${id}`;
    p.textContent = `This is child window number ${id}.`;
    document.title = `Child Window ${id}`;
    console.log(`child.html: Content updated for Window ${id}`);
    if (id == 1){
        btn_focus.style.display = 'flex';
    }

} else {
    console.log('child.html: No ID found in URL parameters.');
}