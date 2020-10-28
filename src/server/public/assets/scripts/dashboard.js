async function getStuff() {
    let key = document.getElementById("key").value;
    if (!key) return errorMessage("No key was given.");

    let data = await fetch('/api/user/uploads', {
        method: 'GET',
        headers: {
            'key': key
        }
    });

    let dataArray = await data.json();

    dataArray = dataArray.sort((a, b) => a.UploadedAt - b.UploadedAt).reverse();

    console.log(dataArray);

    dataArray.forEach(e => {
        createData(JSON.parse(JSON.stringify(e)));
    });

    document.getElementById('keyPart').setAttribute('hidden', 'true');
    document.getElementById('loginPart').setAttribute('hidden', 'true');
    document.getElementById("error").setAttribute('hidden', 'true');
}

function createData(data) {
    var div = document.createElement("div");
    div.style.margin = 'auto';
    div.style.padding = '3%';
    div.style.marginTop = '2%';
    div.className = 'fileDiv';
    // div.setAttribute('id', `${data.name}Div`);
    div.innerHTML = `<a onClick="showMoreData('${data.name}', '${new Date(data.UploadedAt).toLocaleString()}', '${data.views}')" class="fileA">${data.name}</a><br><br><div id="${data.name}Div" class="fileDataDiv"></div><br><a href="/pages/delete?f=${data.name}" class="delete">Delete</a>`;
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
    div.innerHTML = `<a id="fileDataA" >Uploaded At: ${date}<br>Views: ${views}<br><br>Link: </a><a id="fileLink" href="https://data.terano.dev/files/${name}" id="fileDataA"> Click Here<a>`;
}

function errorMessage(message) {
    let error = document.getElementById("error");
    error.textContent = message;
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