import { test, describe } from 'node:test';
import assert from 'node:assert';
import { checkCompliance, getLicenseCategory } from './compliance.js';

describe('checkCompliance', () => {
  test('should mark MIT license as compliant', () => {
    const deps = [
      { name: 'test-pkg', version: '1.0.0', license: 'MIT' }
    ];
    
    const result = checkCompliance(deps, { projectLicense: 'MIT' });
    
    assert.strictEqual(result.compliant.length, 1);
    assert.strictEqual(result.violations.length, 0);
    assert.strictEqual(result.warnings.length, 0);
  });

  test('should flag GPL in MIT project as violation', () => {
    const deps = [
      { name: 'gpl-pkg', version: '1.0.0', license: 'GPL-3.0' }
    ];
    
    const result = checkCompliance(deps, { projectLicense: 'MIT' });
    
    assert.strictEqual(result.violations.length, 1);
    assert.strictEqual(result.violations[0].package, 'gpl-pkg');
  });

  test('should handle custom allow list', () => {
    const deps = [
      { name: 'lgpl-pkg', version: '1.0.0', license: 'LGPL-3.0' }
    ];
    
    const result = checkCompliance(deps, {
      projectLicense: 'MIT',
      allowList: ['LGPL-3.0']
    });
    
    assert.strictEqual(result.compliant.length, 1);
    assert.strictEqual(result.warnings.length, 0);
  });

  test('should handle custom deny list', () => {
    const deps = [
      { name: 'test-pkg', version: '1.0.0', license: 'Apache-2.0' }
    ];
    
    const result = checkCompliance(deps, {
      projectLicense: 'MIT',
      denyList: ['Apache-2.0']
    });
    
    assert.strictEqual(result.violations.length, 1);
  });

  test('should mark unknown licenses', () => {
    const deps = [
      { name: 'mystery-pkg', version: '1.0.0', license: 'UNKNOWN' }
    ];
    
    const result = checkCompliance(deps, { projectLicense: 'MIT' });
    
    assert.strictEqual(result.unknown.length, 1);
  });

  test('should flag AGPL as problematic', () => {
    const deps = [
      { name: 'agpl-pkg', version: '1.0.0', license: 'AGPL-3.0' }
    ];
    
    const result = checkCompliance(deps, { projectLicense: 'MIT' });
    
    assert.strictEqual(result.violations.length, 1);
    assert.ok(result.violations[0].reason.includes('Network copyleft'));
  });
});

describe('getLicenseCategory', () => {
  test('should categorize MIT as permissive', () => {
    assert.strictEqual(getLicenseCategory('MIT'), 'permissive');
  });

  test('should categorize GPL-3.0 as copyleft', () => {
    assert.strictEqual(getLicenseCategory('GPL-3.0'), 'copyleft');
  });

  test('should categorize LGPL-3.0 as weak-copyleft', () => {
    assert.strictEqual(getLicenseCategory('LGPL-3.0'), 'weak-copyleft');
  });

  test('should categorize AGPL-3.0 as problematic', () => {
    assert.strictEqual(getLicenseCategory('AGPL-3.0'), 'problematic');
  });

  test('should categorize UNKNOWN as unknown', () => {
    assert.strictEqual(getLicenseCategory('UNKNOWN'), 'unknown');
  });
});
