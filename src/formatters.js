import Table from 'cli-table3';
import chalk from 'chalk';
import { getLicenseCategory } from './compliance.js';

/**
 * Format results as a table
 */
export function formatTable(dependencies, compliance) {
  const table = new Table({
    head: [
      chalk.bold('Package'),
      chalk.bold('Version'),
      chalk.bold('License'),
      chalk.bold('Status')
    ],
    style: {
      head: [],
      border: []
    },
    colWidths: [35, 12, 20, 25]
  });

  // Create lookup maps
  const violationMap = new Map(compliance.violations.map(v => [v.package, v]));
  const warningMap = new Map(compliance.warnings.map(w => [w.package, w]));
  const unknownMap = new Map(compliance.unknown.map(u => [u.package, u]));

  for (const dep of dependencies) {
    const license = dep.license || 'UNKNOWN';
    const category = getLicenseCategory(license);
    
    let status = chalk.green('✓ OK');
    let licenseDisplay = license;
    
    // Color license based on category
    switch (category) {
      case 'permissive':
        licenseDisplay = chalk.green(license);
        break;
      case 'weak-copyleft':
        licenseDisplay = chalk.yellow(license);
        break;
      case 'copyleft':
        licenseDisplay = chalk.red(license);
        break;
      case 'problematic':
        licenseDisplay = chalk.red.bold(license);
        break;
      case 'unknown':
        licenseDisplay = chalk.dim(license);
        break;
      default:
        licenseDisplay = chalk.cyan(license);
    }
    
    // Check status
    if (violationMap.has(dep.name)) {
      const v = violationMap.get(dep.name);
      status = chalk.red(`✗ ${truncate(v.reason, 20)}`);
    } else if (warningMap.has(dep.name)) {
      const w = warningMap.get(dep.name);
      status = chalk.yellow(`⚠ ${truncate(w.reason, 20)}`);
    } else if (unknownMap.has(dep.name)) {
      status = chalk.dim('? Unknown');
    }
    
    table.push([
      truncate(dep.name, 33),
      dep.version || '-',
      licenseDisplay,
      status
    ]);
  }

  return table.toString();
}

/**
 * Format results as JSON
 */
export function formatJson(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Format a summary report
 */
export function formatSummary(compliance) {
  const lines = [];
  
  lines.push('');
  lines.push(chalk.bold('📊 License Compliance Summary'));
  lines.push('═'.repeat(40));
  
  lines.push(`   ${chalk.green('✓')} Compliant:  ${compliance.compliant.length}`);
  lines.push(`   ${chalk.yellow('⚠')} Warnings:   ${compliance.warnings.length}`);
  lines.push(`   ${chalk.red('✗')} Violations: ${compliance.violations.length}`);
  lines.push(`   ${chalk.dim('?')} Unknown:    ${compliance.unknown.length}`);
  
  if (compliance.violations.length > 0) {
    lines.push('');
    lines.push(chalk.red.bold('License Violations:'));
    for (const v of compliance.violations) {
      lines.push(chalk.red(`  ✗ ${v.package}@${v.version}: ${v.license}`));
      lines.push(chalk.red(`    ${v.reason}`));
    }
  }
  
  if (compliance.warnings.length > 0) {
    lines.push('');
    lines.push(chalk.yellow.bold('Warnings:'));
    for (const w of compliance.warnings) {
      lines.push(chalk.yellow(`  ⚠ ${w.package}@${w.version}: ${w.license}`));
      lines.push(chalk.yellow(`    ${w.reason}`));
    }
  }
  
  return lines.join('\n');
}

/**
 * Truncate string with ellipsis
 */
function truncate(str, len) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.substring(0, len - 1) + '…';
}

export { truncate };
