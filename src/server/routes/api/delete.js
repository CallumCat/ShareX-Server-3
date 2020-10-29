/*
    The router for deleting a file
*/
const { unlink } = require('fs');
const { Router } = require('express');
const { resolve } = require('path');

const { getUserFromKey, getFile, delFile } = require('../../../database/index');
const { fileDELETE } = require('../../../util/logger');

const router = Router();

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 75
});
router.use(limiter);

router.delete("/api/delete/:name", async (req, res) => {
    let fileName = req.params.name;
    if (!fileName) return res.status(200).json({
        "error": "File does not exist."
    });

    let fileData = await getFile(fileName);
    if (fileData == null) return res.status(404).json({
        "error": "File does not exist."
    });

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
    if (userData.name !== fileData.uploader) return res.status(400).json({
        "error": "An incorrect key was provided."
    });

    let filePath = resolve(`${__dirname}/../../../${fileData.path}`);
    await delFile(fileData.name);
    unlink(filePath, (err) => {
        if (err) throw err;
    });

    fileDELETE(fileData.name, req.ip, userData.key);

    return res.status(400).json({
        "success": true,
        "message": "File was deleted."
    });
});

module.exports = router;
