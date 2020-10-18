import { Router } from "express";
import multer from "multer";

import OrphanagesController from "./controllers/OrphanagesController";
import uploadConfig from './config/upload';

const routers = Router();
const upload = multer(uploadConfig);

routers.get('/orphanages', OrphanagesController.index);
routers.get('/orphanages/:id', OrphanagesController.show);
routers.post('/orphanages', upload.array('images'), OrphanagesController.create);

export default routers;