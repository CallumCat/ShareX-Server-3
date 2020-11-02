let oldFile;

async function upload() {
    const fileField = document.querySelector('input[type="file"]');
    if (!fileField.files[0]) return message('No file was chosen.', 'red');

    if (oldFile === fileField.files[0]) return message('That file was already uploaded.', 'red');
    oldFile = fileField.files[0];


    let username = document.getElementById('username').value;
    if (!username) return message('No username was given.', 'red');

    let password = document.getElementById('password').value;
    if (!password) return message('No password was given.', 'red');

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
        message(JSON.parse(url).error, 'red');
    } else {
        message(url, 'green');
        copyToClipboard(url);
    }

    document.getElementById('UserName').setAttribute('hidden', 'true');
    document.getElementById('PassWord').setAttribute('hidden', 'true');
    return;
}

function message(_message, color) {
    let error = document.getElementById('error');
    error.textContent = _message.toString();
    error.style.color = color;
    error.onclick = copyToClipboard(error.innerText);
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