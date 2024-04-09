const { Images } = require("../models");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const { auth } = require('../config/firebase.config');
const storage = getStorage();
const uuid = require('uuid');

const postImages = async (req, res, next) => {
    try {
        const files = req.files;
        const type = req.body.type;

        if (!files) return res.status(400).json({
            message: "Upload failed",
        })
        else if (files.length === 0) {
            res.status(400).json({
                message: "Upload none",
            })
        }
        else if (files.length === 1) {
            const uuid4 = uuid.v4()

            const dateTime = giveCurrentDateTime();

            const storageRef = ref(storage, `posts/${files.originalname + "_" + dateTime}_${uuid4}`);

            // Create file metadata including the content type
            const metadata = {
                contentType: files.mimetype,
            };

            // Upload the file in the bucket storage
            const snapshot = await uploadBytesResumable(storageRef, files.buffer, metadata);
            //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

            // Grab the public url
            const downloadURL = await getDownloadURL(snapshot.ref);

            res.status(200).json({
                message: "Upload successful",
            });
        } else if (files.length > 1) {
            const uuid4 = uuid.v4()

            const dateTime = giveCurrentDateTime();

            await files.map(async (file) => {
                const storageRef = ref(storage, `posts/${file.originalname + "_" + dateTime}_${uuid4}`);

                // Create file metadata including the content type
                const metadata = {
                    contentType: file.mimetype,
                };

                // Upload the file in the bucket storage
                const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
                //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

                // Grab the public url
                const downloadURL = await getDownloadURL(snapshot.ref);
                console.log(downloadURL);
            })


            res.status(200).json({
                message: "Upload successful",
            });
        }
    } catch (err) {
        res.status(400).json({
            message: "Upload failed",
            error: err.message
        });
    }
}

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}

module.exports = {
    postImages
}