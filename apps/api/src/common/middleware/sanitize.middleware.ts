import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('');
const purify = DOMPurify(window as any);

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }
    next();
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const key of Object.keys(obj)) {
        sanitizedObj[key] = this.sanitizeObject(obj[key]);
      }
      return sanitizedObj;
    }
    
    if (typeof obj === 'string') {
      return purify.sanitize(obj);
    }
    
    return obj;
  }
}
