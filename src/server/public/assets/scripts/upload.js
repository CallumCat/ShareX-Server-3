let oldFile;

async function upload() {
    const fileField = document.querySelector('input[type="file"]');
    if (!fileField.files[0]) return errorMessage('No file was chosen.');

    if (oldFile === fileField.files[0]) return errorMessage('That file was already uploaded.');
    oldFile = fileField.files[0];


    let username = document.getElementById('username').value;
    if (!username) return errorMessage('No username was given.');

    let password = document.getElementById('password').value;
    if (!password) return errorMessage('No password was given.');

    const formData = new FormData();
    formData.append('file', fileField.files[0]);

    let data = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
            'username': username,
            'password': password
        }
    });

    let url = await data.text();

    if (isJson(url)) {
        errorMessage(JSON.parse(url).error);
    } else {
        goodMessage(url);
        copyToClipboard(url);
    }

    document.getElementById('UserName').setAttribute('hidden', 'true');
    document.getElementById('PassWord').setAttribute('hidden', 'true');
    return;
}

function errorMessage(message) {
    let error = document.getElementById('error');
    error.textContent = message.toString();
    error.style.color = 'red';
}

function goodMessage(message) {
    let error = document.getElementById('error');
    error.textContent = message.toString();
    error.onclick = copyToClipboard(error.innerText);
    error.style.color = 'green';
}

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}