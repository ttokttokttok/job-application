import { Router, Request, Response } from 'express';
import { upload } from '../utils/fileUpload';
import { ResumeParserService } from '../services/resumeParser.service';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import logger from '../utils/logger';

const router = Router();
const resumeParser = new ResumeParserService();

/**
 * POST /api/resume/upload
 * Upload resume file, parse it with Claude, return structured data
 */
router.post('/upload', upload.single('resumeFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded'
      });
    }

    logger.info(`Resume uploaded: ${req.file.filename}`);

    // Read file content
    const fileBuffer = await fs.readFile(req.file.path);
    let resumeText = '';

    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(fileBuffer);
      resumeText = pdfData.text;
    } else {
      // For DOCX, we'd need a library like mammoth
      // For now, just convert buffer to string (basic support)
      resumeText = fileBuffer.toString('utf-8');
    }

    // Parse resume with Claude
    logger.info('Parsing resume with Claude...');
    const parsedData = await resumeParser.parseResume(resumeText);

    // Optionally clean up uploaded file
    // await fs.unlink(req.file.path);

    return res.json({
      success: true,
      parsedData,
      resumeUrl: req.file.path
    });
  } catch (error: any) {
    logger.error('Resume upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse resume'
    });
  }
});

export default router;
