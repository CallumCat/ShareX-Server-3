function navbar() {
    let topnav = document.getElementById('topnav');
    topnav.innerHTML = `<a class="active" href="/">Home</a>
    <a href="https://netdata.terano.dev">Netdata</a>
    <a href="/pages/upload">Upload</a>
    <a href="/pages/files">Files</a>
    <a href="/pages/signup">Sign Up</a>
    <a class="right" href="https://github.com/Million900o">Github</a>`;
}