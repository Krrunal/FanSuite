## FanSuite Setup Guides

FanSuite is an Expo / React Native application using Expo Router. 
This document explains how to install, configure, run, and test the project locally.

### Requirements
Before starting, Please verify the versions or install the packages:
-  Node.js LTS - v22.11.0
-  npm - v10.9.0
-  VS Code or another code editor
-  Expo Go for physical-device testing, or Android Studio / Xcode for local native builds

### Verify the installation:
`node -v` & `npm -v`

### Clone the project
Clone the repository: 
`git clone <REPOSITORY_URL>`

Enter the project: `cd FanSuite`

### Install dependencies
This project uses npm. Install dependencies from the committed lockfile by using  `npm install`

Do not delete or regenerate `package-lock.json` unless dependencies are intentionally being changed.

### Start the application
-  Start the Expo development server: `npx expo start`
-  For a clean Metro cache: `npx expo start -c`
-  Expo's normal development workflow uses `npx expo start`.

### Run on Android By Physical Android device
- Install Expo Go Latest version on the Android device.
- Start the development server: `npx expo start`
- Scan the displayed QR code with Expo Go Application.

### Run the Tests
- `npm test`
