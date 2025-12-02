const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const arquivoId = req.params.id;
        const dir = path.join(__dirname, "..", "uploads", `arquivo_${arquivoId}`);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);

        cb(null, `${base}-${timestamp}${ext}`);
    },
});

module.exports = multer({ storage });
