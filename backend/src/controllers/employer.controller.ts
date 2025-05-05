import { Request, Response } from 'express';
import { Employer } from '../models';
import logger from '../config/logger';

/**
 * Controller for Employer-related operations
 */
const employerController = {
  /**
   * Get all employers
   */
  getAllEmployers: async (req: Request, res: Response) => {
    try {
      const employers = await Employer.findAll();
      return res.status(200).json({
        success: true,
        data: employers,
      });
    } catch (error: any) {
      logger.error('Error fetching employers:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch employers',
        error: error.message,
      });
    }
  },

  /**
   * Get employer by ID
   */
  getEmployerById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employer = await Employer.findByPk(id, {
        include: ['quotes', 'documents'],
      });

      if (!employer) {
        return res.status(404).json({
          success: false,
          message: 'Employer not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: employer,
      });
    } catch (error: any) {
      logger.error(`Error fetching employer with ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch employer',
        error: error.message,
      });
    }
  },

  /**
   * Create a new employer
   */
  createEmployer: async (req: Request, res: Response) => {
    try {
      const newEmployer = await Employer.create(req.body);
      return res.status(201).json({
        success: true,
        data: newEmployer,
        message: 'Employer created successfully',
      });
    } catch (error: any) {
      logger.error('Error creating employer:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create employer',
        error: error.message,
      });
    }
  },

  /**
   * Update an employer
   */
  updateEmployer: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employer = await Employer.findByPk(id);

      if (!employer) {
        return res.status(404).json({
          success: false,
          message: 'Employer not found',
        });
      }

      await employer.update(req.body);
      
      return res.status(200).json({
        success: true,
        data: employer,
        message: 'Employer updated successfully',
      });
    } catch (error: any) {
      logger.error(`Error updating employer with ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update employer',
        error: error.message,
      });
    }
  },

  /**
   * Delete an employer
   */
  deleteEmployer: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employer = await Employer.findByPk(id);

      if (!employer) {
        return res.status(404).json({
          success: false,
          message: 'Employer not found',
        });
      }

      await employer.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Employer deleted successfully',
      });
    } catch (error: any) {
      logger.error(`Error deleting employer with ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete employer',
        error: error.message,
      });
    }
  },
};

export default employerController; 