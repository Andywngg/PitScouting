"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const team_controller_1 = require("../controllers/team.controller");
const router = express_1.default.Router();
const hasCloudinaryConfig = Boolean(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (hasCloudinaryConfig) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
const storage = hasCloudinaryConfig
    ? new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            folder: 'pit-scouting',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
    })
    : multer_1.default.diskStorage({
        destination: './uploads/',
        filename: (_req, file, cb) => {
            cb(null, `${Date.now()}${path_1.default.extname(file.originalname)}`);
        },
    });
const upload = (0, multer_1.default)({ storage });
router.post('/', upload.single('robotImage'), team_controller_1.createTeam);
router.get('/:teamNumber', team_controller_1.getTeam);
router.get('/', team_controller_1.getAllTeams);
router.put('/:teamNumber', upload.single('robotImage'), team_controller_1.updateTeam);
router.delete('/:teamNumber', team_controller_1.deleteTeam);
exports.default = router;
//# sourceMappingURL=teams.js.map