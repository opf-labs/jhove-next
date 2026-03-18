# JHOVE Desktop

> A modern, cross-platform desktop application for validating and characterizing digital files using JHOVE (JSTOR/Harvard Object Validation Environment).

Built with **Tauri 2.10** for native performance, **Next.js 16** for a modern UI, and **React 19** for a responsive user experience. No web server required – it's a true desktop app that runs entirely on your local machine.

---

## Features

### Core Functionality
- **Single File & Batch Validation** – Validate individual files or entire folder hierarchies recursively
- **Smart Format Detection** – Automatically detect file formats or choose specific JHOVE modules
- **Comprehensive Reports** – Get detailed validation results with technical metadata and format-specific properties
- **Built-in SHA-1 Checksums** – Generate and verify file checksums on-demand
- **Export to JSON** – Save validation reports with native file dialogs for archiving or further processing

### User Experience
- **Scan History** – Track and revisit previous validations with an intuitive sidebar
- **Rescan on Demand** – Quickly re-validate files with different modules to compare results
- **Native Desktop UI** – True desktop application with native file dialogs and performance
- **Clean Interface** – Tailored for technical users who need quick access to validation details

### Supported Formats
JPEG, PNG, GIF, PDF, TIFF, HTML, XML, UTF-8, ASCII, WAVE, AIFF, EPUB, and more via JHOVE's extensible module system.

---

## Quick Start

### For End Users

1. **Download** the latest release for your platform:
   - [macOS](https://github.com/darrendignam/jhove-next/releases) (`.dmg` for Intel or Apple Silicon)
   - [Windows](https://github.com/darrendignam/jhove-next/releases) (`.msi` installer)
   - [Linux](https://github.com/darrendignam/jhove-next/releases) (`.AppImage` or `.deb`)

2. **Install JHOVE** if you haven't already:
   - Download from [JHOVE's official site](https://jhove.openpreservation.org/)
   - Or install via your package manager (e.g., `brew install jhove` on macOS)

3. **Launch** the app and configure the JHOVE executable path in **Settings** on first run

4. **Start validating!** Drop files or folders to analyze them

---

## Development Setup

### Prerequisites

You'll need these installed on your system:

- **Node.js** 18+ (20 or 21 recommended) – [Download](https://nodejs.org/)
- **Rust** 1.77.2+ (latest stable recommended) – [Install](https://www.rust-lang.org/)
- **JHOVE** – [Get it here](https://jhove.openpreservation.org/)

Platform-specific dependencies:
- **Linux**: `webkit2gtk`, `libssl`, `libayatana-appindicator` (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))
- **macOS**: Xcode Command Line Tools
- **Windows**: Visual Studio Build Tools with C++ support

### Getting Started

```bash
# Clone the repository
git clone https://github.com/darrendignam/jhove-next.git
cd jhove-next

# Install JavaScript dependencies
npm install

# Start development mode (hot-reload enabled)
npm run tauri:dev

# Build for production
npm run tauri:build
```

The dev server will launch both the Next.js frontend and Tauri backend with hot-reload. Production builds are output to `src-tauri/target/release/bundle/`.

### Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Desktop Framework** | [Tauri](https://tauri.app/) | 2.10.3 |
| **Frontend Framework** | [Next.js](https://nextjs.org/) | 16.1.6 |
| **UI Library** | [React](https://react.dev/) | 19.0.0 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 4.x |
| **Backend Language** | Rust | 1.77.2+ |
| **Build Mode** | Static Export (`output: 'export'`) | – |

### Project Structure

```
jhove-next/
├── src/                          # Next.js frontend
│   ├── app/                      # App router pages
│   ├── components/               # React components
│   │   ├── AnalyseSection.tsx    # Validation results display
│   │   ├── HistorySidebar.tsx    # Scan history UI
│   │   └── SettingsSection.tsx   # JHOVE path configuration
│   └── lib/                      # Utilities and API wrappers
├── src-tauri/                    # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   ├── lib.rs                # Command handlers
│   │   ├── jhove.rs              # JHOVE CLI integration
│   │   └── settings.rs           # Configuration management
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
└── public/                       # Static assets
```

---

## Building with Docker (Optional)

Want a reproducible build environment? Use Docker to isolate the build process.

### For Linux Builds

```dockerfile
FROM rust:latest

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Tauri dependencies
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

WORKDIR /app
COPY . .

RUN npm install
RUN npm run tauri:build
```

### Build and Extract

```bash
# Build the Docker image
docker build -t jhove-desktop-builder .

# Extract the built artifacts
docker create --name jhove-builder jhove-desktop-builder
docker cp jhove-builder:/app/src-tauri/target/release/bundle ./dist
docker rm jhove-builder
```

**Note:** Docker builds work well for Linux. For macOS and Windows, native builds or CI/CD are recommended.

---

## Creating a Release

Releases are automated via GitHub Actions:

1. **Update versions** in:
   - `src-tauri/Cargo.toml` → `version = "0.1.1"`
   - `package.json` → `"version": "0.1.1"`
   - `src/components/AboutSection.tsx` → `<strong>Version:</strong> 0.1.1`

2. **Update** `CHANGELOG.md` with release notes

3. **Commit and tag**:
   ```bash
   git commit -am "Release v0.1.1"
   git tag v0.1.1
   git push origin v0.1.1
   ```

4. **Watch GitHub Actions** build for macOS (Intel + ARM), Windows, and Linux, then automatically publish a release with all binaries 

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server (frontend only) |
| `npm run build` | Build Next.js static export to `out/` |
| `npm run lint` | Run ESLint on the codebase |
| `npm run tauri` | Run Tauri CLI directly |
| `npm run tauri:dev` | Start Tauri dev mode with hot-reload |
| `npm run tauri:build` | Build production app for your platform |

---

## License

This project is licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **[JHOVE](https://jhove.openpreservation.org/)** – The powerful validation engine that makes this all possible
- **[Open Preservation Foundation](https://openpreservation.org/)** – For maintaining and advancing JHOVE
- **[Tauri](https://tauri.app/)** – For enabling lightweight, secure desktop apps with web technologies
- **[Next.js](https://nextjs.org/)** & **[React](https://react.dev/)** – For the modern frontend experience

---

## Issues & Support

Found a bug or have a question?
- 🐛 [Open an issue](https://github.com/darrendignam/jhove-next/issues)
- 💬 Check existing issues for known problems
- 📖 Review the [JHOVE documentation](https://jhove.openpreservation.org/documentation/)

---



