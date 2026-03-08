import { Request, Response } from 'express';
import { Team } from '../models';
import { Op } from 'sequelize';
import path from 'path';

const parseBoolean = (value: unknown): boolean => value === true || value === 'true' || value === 1 || value === '1';

const parseOptionalFloat = (value: unknown, fieldName: string): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = parseFloat(String(value));
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}`);
  }

  return parsed;
};

const parseOptionalInt = (value: unknown, fieldName: string): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}`);
  }

  return parsed;
};

const parseStringArray = (value: unknown, fieldName: string): string[] => {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
      throw new Error();
    } catch {
      throw new Error(`Invalid array format for ${fieldName}`);
    }
  }

  throw new Error(`Invalid array format for ${fieldName}`);
};

const normalizeEndgameType = (value: unknown): 'L1' | 'L2' | 'L3' | 'NA' => {
  if (value === undefined || value === null || value === '') {
    return 'NA';
  }

  const normalized = String(value).toUpperCase();
  if (['L1', 'L2', 'L3', 'NA'].includes(normalized)) {
    return normalized as 'L1' | 'L2' | 'L3' | 'NA';
  }

  throw new Error('Endgame type must be one of: L1, L2, L3, NA');
};

const normalizeImagePath = (file: Express.Multer.File | undefined): string | null => {
  if (!file) {
    return null;
  }

  const fileData = file as any;
  const rawPath = fileData.path ? String(fileData.path) : '';

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }

  if (fileData.filename) {
    return `/uploads/${fileData.filename}`;
  }

  if (rawPath) {
    const normalizedRawPath = rawPath.replace(/\\/g, '/');
    const fileName = path.posix.basename(normalizedRawPath);
    return fileName ? `/uploads/${fileName}` : null;
  }

  return null;
};

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received team data:', JSON.stringify(req.body, null, 2));
    
    if (!req.body.teamNumber) {
      throw new Error('Team number is required');
    }

    const teamNumber = parseInt(req.body.teamNumber, 10);
    const estimatedTotalPoints = parseOptionalInt(req.body.estimatedTotalPoints, 'estimatedTotalPoints');
    const pointContributionPercent = parseOptionalInt(req.body.pointContributionPercent, 'pointContributionPercent');
    const ballsPerCycle = parseOptionalFloat(req.body.ballsPerCycle, 'ballsPerCycle');
    const cyclesPerMatch = parseOptionalFloat(req.body.cyclesPerMatch, 'cyclesPerMatch');
    const maxBallCapacity = parseOptionalInt(req.body.maxBallCapacity, 'maxBallCapacity');
    const robotWidth = parseOptionalFloat(req.body.robotWidth, 'robotWidth');
    const robotLength = parseOptionalFloat(req.body.robotLength, 'robotLength');
    const robotHeight = parseOptionalFloat(req.body.robotHeight, 'robotHeight');
    const robotWeight = parseOptionalFloat(req.body.robotWeight, 'robotWeight');
    const shootingTypes = parseStringArray(req.body.shootingTypes, 'shootingTypes');
    const shootingLocationType = req.body.shootingLocationType || 'single';
    const endgameType = normalizeEndgameType(req.body.endgameType);

    if (isNaN(teamNumber)) {
      throw new Error('Invalid team number format');
    }

    if (pointContributionPercent !== null && ![10, 20, 30, 40, 50, 60].includes(pointContributionPercent)) {
      throw new Error('Point contribution percent must be one of: 10, 20, 30, 40, 50, 60');
    }

    if (!['single', 'multiple'].includes(shootingLocationType)) {
      throw new Error('Shooting location type must be either "single" or "multiple"');
    }

    const allowedShootingTypes = ['turret', 'fixed'];
    const invalidShootingType = shootingTypes.find((type) => !allowedShootingTypes.includes(type));
    if (invalidShootingType) {
      throw new Error('Shooting types must be one of: turret, fixed');
    }

    const uploadedImagePath = normalizeImagePath(req.file);
    
    const processedData = {
      teamNumber,
      scouterName: req.body.scouterName ? String(req.body.scouterName).trim() : null,
      autoCanScoreBalls: parseBoolean(req.body.autoCanScoreBalls),
      estimatedTotalPoints,
      pointContributionPercent,
      ballsPerCycle,
      cyclesPerMatch,
      maxBallCapacity,
      shootingTypes,
      shootingLocationType,
      shootingLocationNotes: req.body.shootingLocationNotes || null,
      mustStartSpecificPosition: parseBoolean(req.body.mustStartSpecificPosition),
      autoStartingPosition: req.body.autoStartingPosition || null,
      endgameType,
      robotWidth,
      robotLength,
      robotHeight,
      robotWeight,
      drivetrainType: req.body.drivetrainType || null,
      notes: req.body.notes || '',
      imageUrl: uploadedImagePath,
    };

    console.log('Processed team data:', JSON.stringify(processedData, null, 2));

    try {
      const team = await Team.create(processedData);
      console.log('Team created successfully:', team.toJSON());
      res.status(201).json(team);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      console.error('SQL Query:', dbError.sql);
      console.error('SQL Parameters:', dbError.parameters);
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error creating team:', error);
    console.error('Error details:', error.original || error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ 
      error: 'Error creating team', 
      message: error.message,
      details: error.original?.detail || error.original?.message || error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const teamNumber = parseInt(req.params.teamNumber);
    
    if (isNaN(teamNumber)) {
      return res.status(400).json({ error: 'Invalid team number' });
    }

    const team = await Team.findOne({
      where: { teamNumber },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    return res.json(team);
  } catch (error: any) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ error: 'Error fetching team', details: error.message });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const team = await Team.findOne({
      where: { teamNumber: req.params.teamNumber },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await team.update(req.body);
    return res.json(team);
  } catch (error: any) {
    console.error('Error updating team:', error);
    return res.status(400).json({ error: 'Error updating team', details: error.message });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const teamNumber = parseInt(req.params.teamNumber, 10);

    if (Number.isNaN(teamNumber)) {
      return res.status(400).json({ error: 'Invalid team number' });
    }

    const deletedCount = await Team.destroy({
      where: { teamNumber },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    return res.json({ message: `Team ${teamNumber} deleted successfully` });
  } catch (error: any) {
    console.error('Error deleting team:', error);
    return res.status(500).json({ error: 'Error deleting team', details: error.message });
  }
};

export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, drivetrain, endgameType, shootingLocationType } = req.query;
    const where: any = {};

    if (search && !Number.isNaN(Number(search))) {
      where.teamNumber = Number(search);
    }

    if (drivetrain) {
      where.drivetrainType = { [Op.iLike]: `%${drivetrain}%` };
    }

    if (endgameType) {
      where.endgameType = endgameType;
    }

    if (shootingLocationType) {
      where.shootingLocationType = shootingLocationType;
    }

    const teams = await Team.findAll({ where });
    res.json(teams);
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    res.status(400).json({ error: 'Error fetching teams', details: error.message });
  }
}; 
