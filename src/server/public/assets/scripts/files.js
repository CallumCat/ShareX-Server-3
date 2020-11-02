async function getStuff() {
    let username = document.getElementById('username').value;
    if (!username) return message('No username was given.', 'red');

    let password = document.getElementById('password').value;
    if (!password) return message('No password was given.', 'red');

    let data = await fetch('/api/user/uploads', {
        method: 'GET',
        headers: {
            'username': username,
            'password': password
        }
    });

    let dataArray = await data.json();
    console.log(dataArray);

    try {
        dataArray = dataArray.sort((a, b) => a.UploadedAt - b.UploadedAt).reverse();
    } catch (e) {
        return message('An incorrect username or password was provided', 'red');
    }

    dataArray.forEach(e => {
        createData(JSON.parse(JSON.stringify(e)));
    });

    document.getElementById('UserName').setAttribute('hidden', 'true');
    document.getElementById('PassWord').setAttribute('hidden', 'true');
    document.getElementById('loginPart').setAttribute('hidden', 'true');
    document.getElementById('yes').setAttribute('hidden', 'true');
    document.getElementById('error').setAttribute('onclick', '');
    document.getElementById('error').setAttribute('style', 'corsor: default;');

    if (dataArray.length === 0)
        message('You do not have any files uploaded.', 'green');
    else document.getElementById('error').setAttribute('hidden', 'true');
    return;
}

function createData(data) {
    var div = document.createElement('div');
    div.style.margin = 'auto';
    div.style.padding = '3%';
    div.style.marginTop = '2%';
    div.className = 'fileDiv';
    // div.setAttribute('id', `${data.name}Div`);
    div.innerHTML = `<a onClick="showMoreData('${data.name}', '${new Date(data.UploadedAt).toLocaleString()}', '${data.views}')" class="fileA">${data.originalName || data.name}</a><br><br><div id="${data.name}Div" class="fileDataDiv"></div><br><a href="/pages/delete?f=${data.name}" class="delete">Delete</a>`;
    document.body.appendChild(div);
}

function showMoreData(name, date, views) {
    let div = document.getElementById(name + 'Div');
    div.style.textAlign = 'left';
    div.style.paddingTop = '10px';
    div.style.paddingBottom = '10px';
    div.style.paddingRight = '10px';
    div.style.paddingLeft = '10px';
    div.style.borderRadius = '5px';
    div.style.marginBottom = '10px';
    div.style.width = '340px';
    div.innerHTML = `<a id="fileDataA" >Uploaded At: ${date}<br>Views: ${views}<br><img src="/files/${name}" height="200px"><br>Link: </a><a id="fileLink" href="/files/${name}" id="fileDataA"> Click Here<a>`;
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