/**
 * Centralised label definitions for regions, remote policies, technologies, and company sizes.
 * This is the single source of truth — used by both JS (via import from companyHelpers.js)
 * and Nunjucks templates (via the global data cascade as `labels.*`).
 */
export default function () {
  return {
    region: {
      'worldwide': 'Worldwide',
      'americas': 'Americas',
      'europe': 'Europe',
      'americas-europe': 'Americas & Europe',
      'asia-pacific': 'Asia Pacific',
      'other': 'Other'
    },
    remotePolicy: {
      'fully-remote': 'Fully Remote',
      'remote-first': 'Remote First',
      'hybrid': 'Hybrid',
      'remote-friendly': 'Remote Friendly'
    },
    companySize: {
      'tiny': '1-10 employees',
      'small': '11-50 employees',
      'medium': '51-200 employees',
      'large': '201-1000 employees',
      'enterprise': '1000+ employees'
    },
    tech: {
      'javascript': 'JavaScript',
      'python': 'Python',
      'ruby': 'Ruby',
      'go': 'Go',
      'java': 'Java',
      'php': 'PHP',
      'rust': 'Rust',
      'dotnet': '.NET',
      'elixir': 'Elixir',
      'scala': 'Scala',
      'cloud': 'Cloud',
      'devops': 'DevOps',
      'mobile': 'Mobile',
      'data': 'Data',
      'ml': 'ML/AI',
      'sql': 'SQL',
      'nosql': 'NoSQL',
      'search': 'Search'
    }
  };
}
