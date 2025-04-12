const { execSync } = require('child_process')
const path = require('path')

exports.default = function (context) {
  // Only run for macOS builds
  if (context.electronPlatformName !== 'darwin') {
    return
  }

  const adbPath = path.join(context.appOutDir, 'Reverb.app/Contents/Resources/extraResources/adb')

  console.log(`Setting executable permissions for: ${adbPath}`)
  execSync(`chmod +x "${adbPath}"`)
}
