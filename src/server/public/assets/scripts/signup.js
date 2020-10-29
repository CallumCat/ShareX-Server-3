async function getStuff() {
    let username = document.getElementById("username").value;
    if (!username) return errorMessage("No username was given.");

    let password = document.getElementById("password").value;
    if (!password) return errorMessage("No password was given.");

    let data = await fetch('/api/user', {
        method: 'POST',
        headers: {
            'name': username,
            'password': password
        }
    });

    data = await data.json();

    if (data.error) return errorMessage(data.error);

    document.getElementById('UserName').setAttribute('hidden', 'true');
    document.getElementById('PassWord').setAttribute('hidden', 'true');
    document.getElementById('loginPart').setAttribute('hidden', 'true');

    let div = document.getElementById('results');
    div.style.width = "420px";
    div.style.height = "125px";
    div.style.paddingRight = "3%";
    div.style.paddingLeft = "3%";
    div.style.paddingBottom = ".5%";
    div.style.paddingTop = ".5%";
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
    goodMessage("Copy your key so you can upload with it.");
    return;
}

function errorMessage(message) {
    let error = document.getElementById("error");
    error.textContent = message.toString();
    error.style.color = "red";
}

function goodMessage(message) {
    let error = document.getElementById("error");
    error.textContent = message.toString();
    error.onclick = copyToClipboard(error.innerText);
    error.style.color = "green";
}

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}