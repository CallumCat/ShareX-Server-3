/*
    The router for creating a short url
*/
const config = require('../../../config.json');

const { Router, json, urlencoded } = require('express');

const { saveURL, getURL, getUserFromKey } = require('../../../database/index');
const { urlAPIGET, urlPOST } = require('../../../util/logger');

const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 25
});
router.use(limiter);

router.get("/api/url/:id", async (req, res) => {
    let userData;
    if (req.headers.key) {
        userData = await getUserFromKey(req.headers.key);
        if (userData == null) return res.status(401).json({
            "error": "An incorrect key was provided in the headers."
        });
    } else if (req.headers.username && req.headers.password) {
        let password = sha256(req.headers.password);
        userData = await getUserFromPassword(req.headers.username, password);
        if (userData == null) return res.status(401).json({
            "error": "An incorrect username or password was provided in the headers."
        });
    } else return res.status(401).json({
        "error": "No key nor username or password was provided in the headers."
    });

    let urlID = req.params.id;
    if (!urlID) return res.status(400).json({
        "error": "No URL ID provided."
    });

    let urlData = await getURL(urlID);
    if (urlData == null) return res.status(400).json({
        "error": "URL not found."
    });

    if (urlData.uploader !== userData.name && userData.owner !== true) return res.status(401).json({
        "error": "You do not have access."
    });

    let returnObj = {
        "id": urlData.id,
        "link": `${config.mainURL}/url/${urlData.id}`,
        "views": urlData.views,
        "uploader": urlData.uploader,
        "redirect": urlData.redirect,
        "CreatedAt": urlData.CreatedAt,
    };

    urlAPIGET(urlData.id, req.ip);

    return res.status(200).json(returnObj);
});

router.post("/api/url", async (req, res) => {
    let userData;
    if (req.headers.key) {
        userData = await getUserFromKey(req.headers.key);
        if (userData == null) return res.status(401).json({
            "error": "An incorrect key was provided in the headers."
        });
    } else if (req.headers.username && req.headers.password) {
        let password = sha256(req.headers.password);
        userData = await getUserFromPassword(req.headers.username, password);
        if (userData == null) return res.status(401).json({
            "error": "An incorrect username or password was provided in the headers."
        });
    } else return res.status(401).json({
        "error": "No key nor username or password was provided in the headers."
    });

    let url = req.body.url;
    if (!url) return res.status(400).json({
        "error": "No url provided."
    });

    let redirectNum = await CreateUrl(10);

    await saveURL({
        id: redirectNum,
        views: 0,
        uploader: userData.name,
        redirect: url,
        CreatedAt: new Date()
    });

    let mainURL = userData.domain == undefined || userData.domain == "none" ? config.mainURL : (userData.subdomain == undefined || userData.subdomain == "none" ? config.mainURL : `https://${userData.subdomain}.${userData.domain}`);

    urlPOST(url, req.ip, userData.key);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(mainURL + '/url/' + redirectNum);
});

let CreateUrl = async (length) => {
    length = parseInt(length);
    let number = Math.floor(Math.random() * (10 ** length)).toString(36);
    let urlTest = await getURL(number);
    if (urlTest) return CreateUrl(Numbe(parseInt(length)));
    return number;
};

module.exports = router;
