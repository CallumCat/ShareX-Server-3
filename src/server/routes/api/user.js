/*
The router for creating a short url
*/
const config = require('../../../config.json');

const { Router, json, urlencoded } = require('express');

const { getUserFromKey, getAllFiles, saveUser, getUserFromName, getUserFromPassword } = require('../../../database/index');
const { userAPIGET, userAPIPOST, userAPIGETUPLOADS } = require('../../../util/logger');
const { sha256 } = require('../../../util/hash');

const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 25
});
router.use(limiter);

const createKey = async () => {
    let string = Math.floor(Math.random() * (10 ** 18)).toString(36) +
        Math.floor(Math.random() * (10 ** 18)).toString(36) +
        Math.floor(Math.random() * (10 ** 18)).toString(36);
    let urlTest = await getUserFromKey(string);
    if (urlTest !== null) return await CreateUrl();
    return string;
};

router.get("/api/user/uploads", async (req, res) => {

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

    let files = await getAllFiles(userData.name);

    userAPIGETUPLOADS(userData.name, userData.key, req.ip);

    return res.status(200).json(files);
});

router.get("/api/user", async (req, res) => {
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

    let userData = await getUserFromKey(key);
    if (userData == null) return res.status(401).json({
        "error": "An incorrect key was provided in the headers."
    });

    let returnObj = {
        "key": userData.key,
        "name": userData.name,
        "owner": userData.owner,
        "uploads": userData.uploads,
        "redirects": userData.redirects,
        "discord": userData.discord,
        "CreatedAt": userData.CreatedAt,
        "domain": userData.domain,
        "subdomain": userData.subdomain
    };

    userAPIGET(userData.name, userData.key, req.ip);

    return res.status(200).json(returnObj);
});

router.post("/api/user", async (req, res) => {
    if (!req.headers.name) return res.status(400).json({
        "error": "No name was provided in the headers."
    });
    let name = req.headers.name;

    let userData = await getUserFromName(name);
    if (userData !== null) return res.status(400).json({
        "error": "An user with that name already exists."
    });

    if (!req.headers.password) return res.status(400).json({
        "error": "No password was provided in the headers."
    });
    let password = sha256(req.headers.password);


    await saveUser({
        key: await createKey(),
        name: name,
        password: password,
        owner: false,
        uploads: 0,
        redirects: 0,
        discord: 'none',
        CreatedAt: new Date(),
        subdomain: "none",
        domain: "none",
    });

    userData = await getUserFromName(name);

    let returnObj = {
        "key": userData.key,
        "name": userData.name,
        "owner": userData.owner,
        "uploads": userData.uploads,
        "redirects": userData.redirects,
        "discord": userData.discord,
        "CreatedAt": userData.CreatedAt,
        "domain": userData.domain,
        "subdomain": userData.subdomain
    };

    userAPIPOST(userData.name, userData.key, req.ip);

    return res.status(200).json(returnObj);
});

module.exports = router;
