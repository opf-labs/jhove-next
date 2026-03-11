# JHOVE Desktop

A modern desktop application for file validation and characterization using JHOVE (JSTOR/Harvard Object Validation Environment).

## Features

- **Desktop Application**: Built with [Tauri](https://tauri.app/) and [Next.js](https://nextjs.org/) for a native desktop experience
- **File & Folder Validation**: Validate single files or entire folders recursively
- **Format Support**: JPEG, PNG, PDF, TIFF, WAV, AIFF, HTML, XML, EPUB, and more
- **Auto-Detection**: Automatically detect file formats or choose specific modules
- **Scan History**: Track and revisit previous validation results
- **Export Reports**: Save validation reports as JSON files
- **Cross-Platform**: Runs on macOS, Windows, and Linux

## Installation

### Download Pre-built Binaries

Download the latest release from the [Releases](https://github.com/darrendignam/jhove-next/releases) page:

- **macOS**: Download the `.dmg` file for your architecture (Intel or Apple Silicon)
- **Windows**: Download the `.msi` installer
- **Linux**: Download the `.AppImage` or `.deb` file

### Requirements

- JHOVE must be installed on your system
- On first launch, configure the path to your JHOVE executable in Settings

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [Rust](https://www.rust-lang.org/) (latest stable version)
- [JHOVE](https://jhove.openpreservation.org/) installed on your system

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/darrendignam/jhove-next.git
   cd jhove-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run tauri:dev
   ```
   This will start both the Next.js frontend and the Tauri backend.

4. Build for production:
   ```bash
   npm run tauri:build
   ```
   The built application will be in `src-tauri/target/release/bundle/`

## Creating a Release

To create a new release that triggers automated builds:

1. Update the version in `src-tauri/Cargo.toml`
2. Update `CHANGELOG.md` with release notes
3. Commit your changes:
   ```bash
   git commit -am "Release v1.0.0"
   ```
4. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

GitHub Actions will automatically build the application for macOS (Intel & Apple Silicon), Windows, and Linux, then create a GitHub release with all the binaries.

## Acknowledgments

- [JHOVE](https://jhove.openpreservation.org/) for providing the API used in this project.


