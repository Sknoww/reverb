```
    ____                        __
   / __ \___  _   _____  ____ _/ /_
  / /_/ / _ \| | / / _ \/ __ `/ __ \
 / _, _/  __/| |/ /  __/ /_/ / /_/ /
/_/ |_|\___/ |___/\___/\__,_/_.___/
----------------------------------------
An Electron app for managing ADB commands
```

*Streamline your ADB commands with elegance and simplicity*

## Overview

Reverb is a powerful Electron-based desktop application designed to simplify and enhance your Android Debug Bridge (ADB) workflow. With an intuitive interface and customizable command palettes, Reverb makes device management effortless for developers.

## Features

- **Command Management**: Create, organize, and execute ADB commands with a single click
- **Device Detection**: Automatically detect and manage connected Android devices
- **Command Groups**: Organize commands into logical groups for better workflow
- **Cross-Platform**: Available for Windows and macOS

## Installation

### Windows
1. Download the latest `Reverb-x.x.x-setup.exe` from the [releases page](https://github.com/yourusername/reverb/releases)
2. Run the installer and follow the on-screen instructions
3. Launch Reverb from the Start menu

### macOS
1. Download the latest `Reverb-x.x.x.dmg` from the [releases page](https://github.com/yourusername/reverb/releases)
2. Open the DMG file and drag Reverb to your Applications folder
3. Open your terminal and run the following command to grant the necessary permissions:
```bash
sudo xattr -dr com.apple.quarantine /Applications/Reverb.app
```

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/reverb.git
cd reverb

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building
```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ by Your Name
