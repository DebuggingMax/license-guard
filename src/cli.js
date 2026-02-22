#!/usr/bin/env node

import { Command } from 'commander';
import { scan } from './scanner.js';
import { formatTable, formatJson } from './formatters.js';
import { checkCompliance } from './compliance.js';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('license-guard')
  .description('🛡️ License compliance checker for your projects')
  .version(pkg.version);

program
  .command('scan')
  .description('Scan project dependencies for license information')
  .argument('[path]', 'Path to project directory', '.')
  .option('-f, --format <format>', 'Output format (table|json)', 'table')
  .option('-l, --license <license>', 'Your project license (e.g., MIT, Apache-2.0)', 'MIT')
  .option('--strict', 'Exit with error on any warning', false)
  .option('--allow <licenses...>', 'Additional allowed licenses')
  .option('--deny <licenses...>', 'Explicitly denied licenses')
  .action(async (projectPath, options) => {
    try {
      console.log(chalk.blue.bold('\n🛡️  License Guard - Scanning...\n'));
      
      const results = await scan(projectPath);
      
      if (results.dependencies.length === 0) {
        console.log(chalk.yellow('No dependencies found.'));
        process.exit(0);
      }

      const compliance = checkCompliance(results.dependencies, {
        projectLicense: options.license,
        allowList: options.allow || [],
        denyList: options.deny || []
      });

      if (options.format === 'json') {
        console.log(formatJson({ ...results, compliance }));
      } else {
        console.log(formatTable(results.dependencies, compliance));
      }

      // Summary
      console.log(chalk.bold('\n📊 Summary:'));
      console.log(`   Total packages: ${results.dependencies.length}`);
      console.log(`   ${chalk.green('✓')} Compliant: ${compliance.compliant.length}`);
      console.log(`   ${chalk.yellow('⚠')} Warnings: ${compliance.warnings.length}`);
      console.log(`   ${chalk.red('✗')} Violations: ${compliance.violations.length}`);

      // Pro features hint
      if (compliance.warnings.length > 0 || compliance.violations.length > 0) {
        console.log(chalk.cyan('\n💼 Need advanced compliance features?'));
        console.log(chalk.cyan('   Check out License Guard Pro: https://github.com/DebuggingMax/license-guard#-pro-features\n'));
      }

      // Exit codes for CI
      if (compliance.violations.length > 0) {
        process.exit(2);
      }
      if (options.strict && compliance.warnings.length > 0) {
        process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('licenses')
  .description('Show commonly used license information')
  .action(() => {
    console.log(chalk.bold('\n📜 Common Open Source Licenses:\n'));
    
    const licenses = [
      { id: 'MIT', type: 'Permissive', compatible: 'Almost everything' },
      { id: 'Apache-2.0', type: 'Permissive', compatible: 'Most licenses' },
      { id: 'BSD-3-Clause', type: 'Permissive', compatible: 'Most licenses' },
      { id: 'ISC', type: 'Permissive', compatible: 'Almost everything' },
      { id: 'GPL-3.0', type: 'Copyleft', compatible: 'GPL-compatible only' },
      { id: 'LGPL-3.0', type: 'Weak copyleft', compatible: 'Dynamic linking OK' },
      { id: 'MPL-2.0', type: 'Weak copyleft', compatible: 'File-level copyleft' },
      { id: 'AGPL-3.0', type: 'Strong copyleft', compatible: 'Network copyleft!' },
    ];

    licenses.forEach(l => {
      const typeColor = l.type.includes('copyleft') ? chalk.yellow : chalk.green;
      console.log(`  ${chalk.bold(l.id.padEnd(15))} ${typeColor(l.type.padEnd(16))} ${chalk.dim(l.compatible)}`);
    });
    console.log();
  });

program
  .command('check')
  .description('Quick compliance check (CI-friendly)')
  .argument('[path]', 'Path to project directory', '.')
  .option('-l, --license <license>', 'Your project license', 'MIT')
  .action(async (projectPath, options) => {
    try {
      const results = await scan(projectPath);
      const compliance = checkCompliance(results.dependencies, {
        projectLicense: options.license,
        allowList: [],
        denyList: []
      });

      if (compliance.violations.length === 0 && compliance.warnings.length === 0) {
        console.log(chalk.green('✓ All dependencies are license-compliant'));
        process.exit(0);
      }

      if (compliance.violations.length > 0) {
        console.log(chalk.red(`✗ ${compliance.violations.length} license violation(s) found`));
        compliance.violations.forEach(v => {
          console.log(chalk.red(`  - ${v.package}: ${v.license} (${v.reason})`));
        });
        process.exit(2);
      }

      if (compliance.warnings.length > 0) {
        console.log(chalk.yellow(`⚠ ${compliance.warnings.length} license warning(s)`));
        compliance.warnings.forEach(w => {
          console.log(chalk.yellow(`  - ${w.package}: ${w.license} (${w.reason})`));
        });
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Pro feature placeholders
program
  .command('sbom')
  .description('Generate Software Bill of Materials [PRO]')
  .action(() => {
    console.log(chalk.cyan('\n💼 SBOM Generation is a Pro feature!\n'));
    console.log('   Generate SPDX and CycloneDX compliant SBOMs for your projects.');
    console.log('   Learn more: https://github.com/DebuggingMax/license-guard/blob/main/docs/ENTERPRISE.md\n');
  });

program
  .command('policy')
  .description('Manage license policies [PRO]')
  .action(() => {
    console.log(chalk.cyan('\n💼 License Policies is a Pro feature!\n'));
    console.log('   Create and enforce custom license policies across your organization.');
    console.log('   Learn more: https://github.com/DebuggingMax/license-guard/blob/main/docs/ENTERPRISE.md\n');
  });

program
  .command('report')
  .description('Generate compliance reports [PRO]')
  .action(() => {
    console.log(chalk.cyan('\n💼 Compliance Reports is a Pro feature!\n'));
    console.log('   Generate PDF/HTML reports for audits and legal review.');
    console.log('   Learn more: https://github.com/DebuggingMax/license-guard/blob/main/docs/ENTERPRISE.md\n');
  });

program.parse();
