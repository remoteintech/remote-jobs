/**
 * Git-based dates for company files
 * Computes addedAt and updatedAt from git history
 * Uses batch git operations for performance
 *
 * Note: Most companies were migrated to individual files on Oct 16-19, 2025.
 * For accurate "when was this company first added to the project" dates,
 * we'd need to parse the historical README.md - but file dates are still
 * useful for tracking recent additions and updates.
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';

// Fallback date for files with no git history
const FALLBACK_DATE = '2025-10-16';

/**
 * Get all file dates in a single batch git operation
 * Returns { filename: { first: date, last: date } }
 */
function batchGetGitDates(directory, pathPrefix) {
  const dates = {};

  try {
    // Get all commits with dates and file names in one command
    // Format: commit_date\n\nfile1\nfile2\n\ncommit_date\n...
    const output = execSync(
      `git log --format="%ci" --name-only -- "${directory}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 50 * 1024 * 1024 }
    );

    let currentDate = null;
    const lines = output.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if this is a date line (starts with year)
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        currentDate = trimmed.split(' ')[0];
      } else if (currentDate && trimmed.startsWith(pathPrefix)) {
        // This is a file path
        const filename = trimmed.replace(pathPrefix, '');
        if (!filename.endsWith('.md')) continue;

        if (!dates[filename]) {
          // First time seeing this file = most recent commit (last)
          dates[filename] = { first: currentDate, last: currentDate };
        } else {
          // Update first (we're going backwards in time)
          dates[filename].first = currentDate;
        }
      }
    }
  } catch (e) {
    console.warn(`Warning: Could not get git dates for ${directory}:`, e.message);
  }

  return dates;
}

export default function() {
  const companiesDir = './src/companies';
  const dates = {};

  try {
    const files = readdirSync(companiesDir).filter(f => f.endsWith('.md'));

    // Batch get all dates from src/companies/
    const gitDates = batchGetGitDates('src/companies', 'src/companies/');

    for (const file of files) {
      const slug = file.replace('.md', '');
      const fileDates = gitDates[file] || { first: null, last: null };

      dates[slug] = {
        addedAt: fileDates.first || FALLBACK_DATE,
        updatedAt: fileDates.last || fileDates.first || FALLBACK_DATE
      };
    }
  } catch (e) {
    console.warn('Warning: Could not compute git dates for companies:', e.message);
  }

  return dates;
}
