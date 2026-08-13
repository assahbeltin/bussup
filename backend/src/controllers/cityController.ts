import { Request, Response, NextFunction } from 'express';
import { cityRepository } from '../repositories/cityRepository';

export class CityController {
  async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const cities = await cityRepository.findAll();
      return res.status(200).json({
        success: true,
        data: cities,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cityController = new CityController();
