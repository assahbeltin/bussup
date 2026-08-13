import { Request, Response, NextFunction } from 'express';

export class PaymentController {
  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentMethod, amount, phoneNumber, cardNumber, bookingId } = req.body;

      if (!paymentMethod || !amount) {
        return res.status(400).json({ success: false, message: 'Payment method and amount are required' });
      }

      // Simulate payment processing logic
      const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          transactionId,
          bookingId,
          paymentMethod,
          amount,
          status: 'COMPLETED',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
