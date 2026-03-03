import {toISOString, formatDate} from './filters/dates.js';
import {markdownFormat} from './filters/markdown-format.js';
import {sortAlphabetically} from './filters/sort-alphabetic.js';
import {splitlines} from './filters/splitlines.js';
import {striptags} from './filters/striptags.js';
import {slugifyString} from './filters/slugify.js';
import {fileExists} from './filters/fileExists.js';
import {split} from './filters/split.js';
export default {
  toISOString,
  formatDate,
  markdownFormat,
  splitlines,
  striptags,
  sortAlphabetically,
  fileExists,
  slugifyString,
  split
};  