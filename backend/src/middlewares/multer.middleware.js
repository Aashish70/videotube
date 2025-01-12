import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // we are storing using the name givrn by user 
    }
}) 


export const upload = multer(
    {
        storage: storage,
    }
)