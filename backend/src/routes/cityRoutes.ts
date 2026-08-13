import { Router } from 'express';
import { cityController } from '../controllers/cityController';

const router = Router();

router.get('/', (req, res, next) => cityController.getCities(req, res, next));

export default router;
