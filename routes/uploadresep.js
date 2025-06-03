const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../views/uploadresep.html'));
    } catch (error) {
        console.error('Error serving uploadresep:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;