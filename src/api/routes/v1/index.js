const express = require('express');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');

const router = express.Router();

/**
 * GET v1/status
 */

const auth = (req, res, next) => {
    var origin = req.get('origin');
  //  if (origin === "https://blackandbelonging.com") {
        next();
   // }
    // else {
    //     res.send({
    //         message: "origin doesn't match",
    //     })
    // }
}


const storage = new Storage({ keyFilename: process.env.KEY_FILENAME });
const bucketName = process.env.BUCKET_NAME;

const upload = multer({
    storage: multer.memoryStorage(),
});
const baseUrl = process.env.BASE_URL;

router.get('/', (req, res) => res.send('OK'));
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        console.log('===started==');
        const file = req.file;
        // Replace 'your-folder' with the desired folder in your bucket
        const bucket = storage.bucket(bucketName);
        const destination = 'videoevent/' + file.originalname;

        const blob = bucket.file(destination);
        const blobStream = blob.createWriteStream();
        console.log('===mid==');
        blobStream.on('error', (err) => {
            console.log('===eroro==',err);
            res.status(500).send('Error uploading file');
        });

        blobStream.on('finish', () => {
            console.log('===finish==');
            const url = baseUrl + '' + destination;
            res.status(200).send({ message: "File Uploaded!!!!", url: url });
        });

        // No need for sharp processing for video files
        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error handling file upload:', error.message);
        res.status(500).send('Error handling file upload');
    }
});


module.exports = router;
