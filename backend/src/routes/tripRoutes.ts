import { Router } from 'express';
import { tripController } from '../controllers/tripController';

const router = Router();

router.get('/search', (req, res, next) => tripController.search(req, res, next));
router.get('/:id', (req, res, next) => tripController.getById(req, res, next));
router.get('/:id/seats', (req, res, next) => tripController.getSeats(req, res, next));
router.post('/:id/holds', (req, res, next) => tripController.holdSeats(req, res, next));
router.delete('/:id/holds', (req, res, next) => tripController.releaseSeats(req, res, next));

export default router;
