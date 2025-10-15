import fs from 'fs';
import path from 'path';

export const fileExists = (filePath) => {
  try {
    return fs.existsSync(path.resolve(process.cwd(), filePath));
  } catch (e) {
    return false;
  }
};