/**
 * License compliance checking logic
 */

// Categorized licenses
const PERMISSIVE_LICENSES = [
  'MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 
  'Unlicense', '0BSD', 'CC0-1.0', 'WTFPL', 'Zlib', 'X11',
  'Public Domain', 'CC-BY-4.0', 'CC-BY-3.0', 'BlueOak-1.0.0'
];

const COPYLEFT_LICENSES = [
  'GPL-2.0', 'GPL-2.0-only', 'GPL-2.0-or-later',
  'GPL-3.0', 'GPL-3.0-only', 'GPL-3.0-or-later',
  'AGPL-3.0', 'AGPL-3.0-only', 'AGPL-3.0-or-later'
];

const WEAK_COPYLEFT_LICENSES = [
  'LGPL-2.0', 'LGPL-2.1', 'LGPL-3.0', 
  'MPL-2.0', 'EPL-1.0', 'EPL-2.0',
  'OSL-3.0', 'CDDL-1.0', 'CDDL-1.1'
];

const PROBLEMATIC_LICENSES = [
  'AGPL-3.0', 'AGPL-3.0-only', 'AGPL-3.0-or-later', // Network copyleft
  'SSPL-1.0', // Server Side Public License (controversial)
  'CC-BY-NC-4.0', 'CC-BY-NC-SA-4.0', // Non-commercial
  'CC-BY-ND-4.0', // No derivatives
  'Prosperity-3.0.0', // Non-commercial
  'BSL-1.0', // Business Source License (time-delayed)
];

// License compatibility matrix (simplified)
const COMPATIBILITY = {
  'MIT': ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'Unlicense', '0BSD', 'CC0-1.0', 'Zlib'],
  'Apache-2.0': ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'Unlicense', '0BSD', 'CC0-1.0', 'Zlib'],
  'BSD-3-Clause': ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'Unlicense', '0BSD', 'Zlib'],
  'GPL-3.0': ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'GPL-3.0', 'GPL-3.0-only', 'GPL-3.0-or-later', 'LGPL-3.0', 'Unlicense'],
  'LGPL-3.0': ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'LGPL-3.0', 'Unlicense'],
};

/**
 * Check license compliance for a list of dependencies
 */
export function checkCompliance(dependencies, options = {}) {
  const {
    projectLicense = 'MIT',
    allowList = [],
    denyList = []
  } = options;

  const result = {
    projectLicense,
    compliant: [],
    warnings: [],
    violations: [],
    unknown: []
  };

  const allowed = new Set([...PERMISSIVE_LICENSES, ...allowList]);
  const denied = new Set(denyList);

  for (const dep of dependencies) {
    const license = normalizeLicense(dep.license);
    
    // Skip unknown licenses
    if (license === 'UNKNOWN' || license.includes('UNKNOWN')) {
      result.unknown.push({
        package: dep.name,
        version: dep.version,
        license: dep.license,
        reason: 'License could not be determined'
      });
      continue;
    }

    // Check deny list first
    if (denied.has(license)) {
      result.violations.push({
        package: dep.name,
        version: dep.version,
        license,
        reason: 'License is explicitly denied'
      });
      continue;
    }

    // Check allow list
    if (allowed.has(license) || allowList.includes(license)) {
      result.compliant.push({
        package: dep.name,
        version: dep.version,
        license
      });
      continue;
    }

    // Check for problematic licenses
    if (PROBLEMATIC_LICENSES.includes(license)) {
      result.violations.push({
        package: dep.name,
        version: dep.version,
        license,
        reason: getProblematicReason(license)
      });
      continue;
    }

    // Check copyleft compatibility
    if (COPYLEFT_LICENSES.includes(license)) {
      if (isPermissive(projectLicense)) {
        result.violations.push({
          package: dep.name,
          version: dep.version,
          license,
          reason: `Copyleft license incompatible with ${projectLicense} project`
        });
      } else {
        result.warnings.push({
          package: dep.name,
          version: dep.version,
          license,
          reason: 'Copyleft license - check distribution requirements'
        });
      }
      continue;
    }

    // Check weak copyleft
    if (WEAK_COPYLEFT_LICENSES.includes(license)) {
      result.warnings.push({
        package: dep.name,
        version: dep.version,
        license,
        reason: 'Weak copyleft - may require source disclosure for modifications'
      });
      continue;
    }

    // Default: warning for unrecognized license
    result.warnings.push({
      package: dep.name,
      version: dep.version,
      license,
      reason: 'Unrecognized license - manual review recommended'
    });
  }

  return result;
}

/**
 * Normalize license identifier
 */
function normalizeLicense(license) {
  if (!license) return 'UNKNOWN';
  
  let normalized = license.trim();
  
  // Handle SPDX expressions
  if (normalized.includes(' OR ')) {
    // Take the most permissive option
    const options = normalized.split(' OR ').map(l => l.trim());
    const permissive = options.find(l => PERMISSIVE_LICENSES.includes(l));
    if (permissive) return permissive;
    return options[0];
  }
  
  // Handle common variations
  const mappings = {
    'Apache 2.0': 'Apache-2.0',
    'Apache License 2.0': 'Apache-2.0',
    'Apache-2': 'Apache-2.0',
    'BSD': 'BSD-3-Clause',
    'GPL': 'GPL-3.0',
    'GPLv3': 'GPL-3.0',
    'GPLv2': 'GPL-2.0',
    'LGPL': 'LGPL-3.0',
    'MIT License': 'MIT',
    '(MIT)': 'MIT',
  };
  
  return mappings[normalized] || normalized;
}

/**
 * Check if a license is permissive
 */
function isPermissive(license) {
  return PERMISSIVE_LICENSES.includes(normalizeLicense(license));
}

/**
 * Get reason for problematic license
 */
function getProblematicReason(license) {
  const reasons = {
    'AGPL-3.0': 'Network copyleft - requires source disclosure for SaaS',
    'AGPL-3.0-only': 'Network copyleft - requires source disclosure for SaaS',
    'AGPL-3.0-or-later': 'Network copyleft - requires source disclosure for SaaS',
    'SSPL-1.0': 'Server Side Public License - very restrictive for services',
    'CC-BY-NC-4.0': 'Non-commercial use only',
    'CC-BY-NC-SA-4.0': 'Non-commercial use only',
    'CC-BY-ND-4.0': 'No derivatives allowed',
    'Prosperity-3.0.0': 'Non-commercial use only',
    'BSL-1.0': 'Business Source License - commercial restrictions'
  };
  
  return reasons[license] || 'License has usage restrictions';
}

/**
 * Get license category
 */
export function getLicenseCategory(license) {
  const normalized = normalizeLicense(license);
  
  if (normalized === 'UNKNOWN' || normalized.includes('UNKNOWN')) return 'unknown';
  if (PROBLEMATIC_LICENSES.includes(normalized)) return 'problematic';
  if (PERMISSIVE_LICENSES.includes(normalized)) return 'permissive';
  if (COPYLEFT_LICENSES.includes(normalized)) return 'copyleft';
  if (WEAK_COPYLEFT_LICENSES.includes(normalized)) return 'weak-copyleft';
  
  return 'other';
}

export { PERMISSIVE_LICENSES, COPYLEFT_LICENSES, WEAK_COPYLEFT_LICENSES, PROBLEMATIC_LICENSES };
