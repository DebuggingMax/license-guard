import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Scan a project directory for dependencies and their licenses
 */
export async function scan(projectPath) {
  const absPath = resolve(projectPath);
  const results = {
    projectPath: absPath,
    scannedAt: new Date().toISOString(),
    packageManager: null,
    dependencies: []
  };

  // Check for package.json (npm/yarn)
  const packageJsonPath = join(absPath, 'package.json');
  if (existsSync(packageJsonPath)) {
    results.packageManager = 'npm';
    const npmDeps = await scanNpmProject(absPath);
    results.dependencies.push(...npmDeps);
  }

  // Check for requirements.txt (Python)
  const requirementsPath = join(absPath, 'requirements.txt');
  if (existsSync(requirementsPath)) {
    results.packageManager = results.packageManager ? 'multiple' : 'pip';
    const pipDeps = await scanPythonProject(absPath);
    results.dependencies.push(...pipDeps);
  }

  // Check for go.mod (Go)
  const goModPath = join(absPath, 'go.mod');
  if (existsSync(goModPath)) {
    results.packageManager = results.packageManager ? 'multiple' : 'go';
    const goDeps = await scanGoProject(absPath);
    results.dependencies.push(...goDeps);
  }

  // Check for Cargo.toml (Rust)
  const cargoPath = join(absPath, 'Cargo.toml');
  if (existsSync(cargoPath)) {
    results.packageManager = results.packageManager ? 'multiple' : 'cargo';
    const cargoDeps = await scanCargoProject(absPath);
    results.dependencies.push(...cargoDeps);
  }

  return results;
}

/**
 * Scan npm/yarn project
 */
async function scanNpmProject(projectPath) {
  const dependencies = [];
  const nodeModulesPath = join(projectPath, 'node_modules');
  
  if (!existsSync(nodeModulesPath)) {
    // Try reading from package.json directly
    const packageJsonPath = join(projectPath, 'package.json');
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    for (const [name, version] of Object.entries(allDeps)) {
      dependencies.push({
        name,
        version: version.replace(/[\^~>=<]/g, ''),
        license: 'UNKNOWN (run npm install)',
        source: 'npm',
        installed: false
      });
    }
    
    return dependencies;
  }

  // Scan node_modules for actual license info
  const packages = readdirSync(nodeModulesPath, { withFileTypes: true });
  
  for (const entry of packages) {
    if (!entry.isDirectory()) continue;
    
    // Handle scoped packages
    if (entry.name.startsWith('@')) {
      const scopedPath = join(nodeModulesPath, entry.name);
      const scopedPackages = readdirSync(scopedPath, { withFileTypes: true });
      
      for (const scopedEntry of scopedPackages) {
        if (!scopedEntry.isDirectory()) continue;
        const fullName = `${entry.name}/${scopedEntry.name}`;
        const pkgInfo = getPackageInfo(join(scopedPath, scopedEntry.name));
        if (pkgInfo) {
          dependencies.push({ ...pkgInfo, name: fullName, source: 'npm', installed: true });
        }
      }
    } else {
      const pkgInfo = getPackageInfo(join(nodeModulesPath, entry.name));
      if (pkgInfo) {
        dependencies.push({ ...pkgInfo, source: 'npm', installed: true });
      }
    }
  }

  return dependencies;
}

/**
 * Get package info from a node_modules directory
 */
function getPackageInfo(pkgPath) {
  const packageJsonPath = join(pkgPath, 'package.json');
  
  if (!existsSync(packageJsonPath)) return null;
  
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    let license = 'UNKNOWN';
    
    if (typeof pkg.license === 'string') {
      license = pkg.license;
    } else if (typeof pkg.license === 'object' && pkg.license.type) {
      license = pkg.license.type;
    } else if (Array.isArray(pkg.licenses)) {
      license = pkg.licenses.map(l => l.type || l).join(' OR ');
    }
    
    // Check for LICENSE file if unknown
    if (license === 'UNKNOWN') {
      const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE'];
      for (const lf of licenseFiles) {
        if (existsSync(join(pkgPath, lf))) {
          license = 'See LICENSE file';
          break;
        }
      }
    }

    return {
      name: pkg.name,
      version: pkg.version,
      license,
      repository: pkg.repository?.url || pkg.repository || null,
      author: typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || null
    };
  } catch (e) {
    return null;
  }
}

/**
 * Scan Python requirements.txt
 */
async function scanPythonProject(projectPath) {
  const dependencies = [];
  const requirementsPath = join(projectPath, 'requirements.txt');
  
  const content = readFileSync(requirementsPath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
    
    // Parse package==version or package>=version etc.
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)([<>=!]+)?(.+)?$/);
    if (match) {
      dependencies.push({
        name: match[1],
        version: match[3] || '*',
        license: 'UNKNOWN (use pip-licenses for details)',
        source: 'pip',
        installed: false
      });
    }
  }
  
  return dependencies;
}

/**
 * Scan Go modules
 */
async function scanGoProject(projectPath) {
  const dependencies = [];
  const goModPath = join(projectPath, 'go.mod');
  
  const content = readFileSync(goModPath, 'utf8');
  const lines = content.split('\n');
  
  let inRequire = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'require (') {
      inRequire = true;
      continue;
    }
    if (trimmed === ')') {
      inRequire = false;
      continue;
    }
    
    if (inRequire || trimmed.startsWith('require ')) {
      const match = trimmed.match(/^(?:require\s+)?([^\s]+)\s+([^\s]+)/);
      if (match) {
        dependencies.push({
          name: match[1],
          version: match[2],
          license: 'UNKNOWN (Go module)',
          source: 'go',
          installed: false
        });
      }
    }
  }
  
  return dependencies;
}

/**
 * Scan Cargo.toml (Rust)
 */
async function scanCargoProject(projectPath) {
  const dependencies = [];
  const cargoPath = join(projectPath, 'Cargo.toml');
  
  const content = readFileSync(cargoPath, 'utf8');
  const lines = content.split('\n');
  
  let inDeps = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.match(/^\[.*dependencies.*\]$/)) {
      inDeps = true;
      continue;
    }
    if (trimmed.startsWith('[')) {
      inDeps = false;
      continue;
    }
    
    if (inDeps) {
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"?([^"]+)"?/);
      if (match) {
        dependencies.push({
          name: match[1],
          version: match[2],
          license: 'UNKNOWN (Cargo crate)',
          source: 'cargo',
          installed: false
        });
      }
    }
  }
  
  return dependencies;
}

export { scanNpmProject, scanPythonProject, scanGoProject, scanCargoProject };
