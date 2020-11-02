async function getStuff() {
    let username = document.getElementById('username').value;
    if (!username) return message('No username was given.', 'red');

    let password = document.getElementById('password').value;
    if (!password) return message('No password was given.', 'red');

    let data = await fetch('/api/user', {
        method: 'POST',
        headers: {
            'name': username,
            'password': password
        }
    });

    data = await data.json();

    if (data.error) return message(data.error, 'red');

    document.getElementById('UserName').setAttribute('hidden', 'true');
    document.getElementById('PassWord').setAttribute('hidden', 'true');
    document.getElementById('loginPart').setAttribute('hidden', 'true');

    let div = document.getElementById('results');
    div.style.width = '420px';
    div.style.height = '125px';
    div.style.paddingRight = '3%';
    div.style.paddingLeft = '3%';
    div.style.paddingBottom = '.5%';
    div.style.paddingTop = '.5%';
    // div.setAttribute('hidden', 'false');
    div.innerHTML = `<br>
    <div id=name>
        <a class="resultA">Name: ${data.name}</a>
    </div>
    <br><br>
    <div id=key>
        <a class="resultA">Key: ${data.key}</a>
    </div>`;
    // <div id=date>
    //     <a class="resultA">Created At: ${data.CreatedAt}</a>
    // </div>;
    message('Copy your key so you can upload with it.', 'green');
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