import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

router.post('/process', (req, res, next) => paymentController.processPayment(req, res, next));

export default router;
