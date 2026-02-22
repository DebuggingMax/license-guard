/**
 * License Guard - Programmatic API
 * 
 * @example
 * import { scan, checkCompliance } from 'license-guard';
 * 
 * const results = await scan('./my-project');
 * const compliance = checkCompliance(results.dependencies, {
 *   projectLicense: 'MIT'
 * });
 * 
 * if (compliance.violations.length > 0) {
 *   console.log('License violations found!');
 * }
 */

export { scan, scanNpmProject, scanPythonProject, scanGoProject, scanCargoProject } from './scanner.js';
export { checkCompliance, getLicenseCategory, PERMISSIVE_LICENSES, COPYLEFT_LICENSES, WEAK_COPYLEFT_LICENSES, PROBLEMATIC_LICENSES } from './compliance.js';
export { formatTable, formatJson, formatSummary } from './formatters.js';

/**
 * Quick check function for CI integration
 */
export async function quickCheck(projectPath, projectLicense = 'MIT') {
  const { scan } = await import('./scanner.js');
  const { checkCompliance } = await import('./compliance.js');
  
  const results = await scan(projectPath);
  const compliance = checkCompliance(results.dependencies, { projectLicense });
  
  return {
    ok: compliance.violations.length === 0,
    violations: compliance.violations,
    warnings: compliance.warnings,
    total: results.dependencies.length
  };
}
