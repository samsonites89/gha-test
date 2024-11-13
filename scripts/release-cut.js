import fs from 'fs/promises'

const SDK_VERSION_HEADER = '3';

/**
 * @param {string} filePath
 * @returns {Promise<Record<string, any>}
 */
async function loadPackage (filePath) {
  const str = await fs.readFile(filePath, {encoding: 'utf-8'})
  return JSON.parse(str)
}

/**
 * @param {string} version
 * @param {boolean} major
 */
function bumpVersion (version, major) {
  const numbers = version.split('.')
  numbers[0] = SDK_VERSION_HEADER; // for SDK, all version should start with 3
  let index = major ? 1 : 2
  numbers[index] = (Number(numbers[index]) + 1).toString()
  if (major) {
    numbers[2] = '0'
  }
  return numbers.join('.')
}

/**
 * @param {string} filePath
 * @param {string} version
 */
async function updateVersion (filePath, version) {
  const pkg = await loadPackage(filePath)
  pkg.version = version
  const data = JSON.stringify(pkg, null, 2) + '\n'
  return fs.writeFile(filePath, data)
}

/**
 * @param {boolean} major
 */
async function updatePackages (major, version) {
  const pkg = await loadPackage('./package.json')
  const version = bumpVersion(version ? version : pkg.version, major)
  console.log('Bump version:', version)
  await updateVersion('./package.json', version)

  if (major) {
    await updateVersion('./packages/headless/package.json', version)
    await updateVersion('./packages/widget/package.json', version)
  }
}

updatePackages(process.argv[2] === 'main', process.argv[3])