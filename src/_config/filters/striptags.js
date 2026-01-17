// Using single-character replacement as recommended by CodeQL to avoid
// incomplete multi-character sanitization vulnerabilities
export const striptags = string => {
  if (!string) return '';
  return String(string).replace(/<|>/g, '');
};
