# Tauri Desktop App Migration Plan

## Overview
Convert the existing Next.js JHOVE web app into a cross-platform desktop application using Tauri, replacing the REST API with direct JHOVE CLI execution.

## Architecture Changes

### Current (Web App)
```
Browser → Next.js App → REST API (jhove-rest) → JHOVE CLI
```

### Target (Desktop App)
```
Tauri WebView (React) ↔ IPC ↔ Rust Backend → JHOVE CLI (local)
```

## Phase 1: Project Setup & Configuration

### 1.1 Initialize Tauri
- [ ] Install Rust toolchain
- [ ] Add Tauri CLI and dependencies
- [ ] Create `src-tauri/` directory structure
- [ ] Configure `tauri.conf.json`

### 1.2 Convert Next.js to Static Build
- [ ] Change `next.config.js` to `output: 'export'`
- [ ] Remove API routes (will use Tauri commands)
- [ ] Update build scripts for Tauri
- [ ] Configure `distDir` to point to Next.js output

### 1.3 Dependencies
**Add:**
- `@tauri-apps/api` - Frontend IPC
- `@tauri-apps/cli` - Build tooling

**Keep:**
- React, TypeScript, Tailwind
- react-icons
- Existing components (HomeSection, AnalyseSection, AboutSection)

**Remove:**
- Docker files
- Server-side dependencies
- API-related code

## Phase 2: Rust Backend Development

### 2.1 JHOVE CLI Integration (`src-tauri/src/jhove.rs`)
```rust
// Core functionality
- execute_jhove(file_path, module) -> Result<String, String>
- list_available_modules() -> Vec<String>
- validate_jhove_installation(jhove_path) -> bool
- auto_detect_module(file_path) -> Option<String>
```

**Features:**
- Spawn JHOVE process with args: `-m MODULE -h JSON file_path`
- Parse JSON stdout from JHOVE
- Error handling for missing JHOVE, invalid files
- Cross-platform path handling (Windows/Mac/Linux)

### 2.2 File Operations (`src-tauri/src/file_ops.rs`)
```rust
- open_file_dialog() -> Option<PathBuf>
- read_file_metadata(path) -> FileMetadata
- calculate_checksum(path) -> String
```

### 2.3 Settings Management (`src-tauri/src/settings.rs`)
```rust
- get_jhove_path() -> String
- set_jhove_path(path: String) -> Result<(), String>
- load_settings() -> Settings
- save_settings(settings: Settings) -> Result<(), String>
```

**Settings File Location:**
- Linux: `~/.config/jhove-desktop/config.json`
- macOS: `~/Library/Application Support/jhove-desktop/config.json`
- Windows: `%APPDATA%\jhove-desktop\config.json`

### 2.4 Tauri Commands (`src-tauri/src/main.rs`)
Expose commands to frontend:
```rust
#[tauri::command]
async fn validate_file(file_path: String, module: String) -> Result<JhoveResult, String>

#[tauri::command]
async fn pick_file() -> Result<Option<String>, String>

#[tauri::command]
async fn get_jhove_modules() -> Result<Vec<String>, String>

#[tauri::command]
async fn configure_jhove_path(path: String) -> Result<bool, String>

#[tauri::command]
async fn get_jhove_path() -> Result<String, String>

#[tauri::command]
async fn detect_module(file_path: String) -> Result<String, String>
```

## Phase 3: Frontend Modifications

### 3.1 Remove API Client Code
- [ ] Delete `sendToApi()` function using fetch
- [ ] Remove `API_BASE_URL` environment variable usage

### 3.2 Add Tauri IPC Integration
**Create `src/lib/tauri-api.ts`:**
```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

export async function validateFile(filePath: string, module: string) {
  return invoke<JhoveResult>('validate_file', { filePath, module });
}

export async function pickFile() {
  return open({ 
    multiple: false,
    filters: [{ name: 'All Files', extensions: ['*'] }]
  });
}

export async function getJhoveModules() {
  return invoke<string[]>('get_jhove_modules');
}

export async function configureJhovePath(path: string) {
  return invoke<boolean>('configure_jhove_path', { path });
}
```

### 3.3 Update Components

**`src/components/HomeSection.tsx`:**
- Replace file input with Tauri file picker button
- Update `processFile()` to use `validateFile()` IPC call
- Add drag-and-drop using Tauri file drop API

**`src/components/AnalyseSection.tsx`:**
- No major changes (display logic stays the same)
- Update re-scan to use Tauri IPC

**`src/app/page.tsx`:**
- Replace `sendToApi()` with `validateFile()` from tauri-api
- Remove checksum calculation (do in Rust backend)

### 3.4 Add Settings Screen
**New `src/components/SettingsSection.tsx`:**
- JHOVE path configuration
- Browse button for JHOVE executable
- Validate installation button
- Save/Load preferences
- Default paths suggestions:
  - Linux: `/usr/local/bin/jhove`, `~/jhove/jhove`
  - macOS: `/usr/local/bin/jhove`, `/Applications/jhove/jhove`
  - Windows: `C:\Program Files\jhove\jhove.exe`

### 3.5 Update Navigation
Add "Settings" to menu alongside Home, Analyse, About

## Phase 4: Build & Packaging

### 4.1 Build Configuration (`tauri.conf.json`)
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:3000",
    "distDir": "../out"
  },
  "package": {
    "productName": "JHOVE Desktop",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "identifier": "org.openpreservation.jhove-desktop",
      "targets": ["deb", "appimage", "msi", "dmg"]
    }
  }
}
```

### 4.2 Platform-Specific Builds
- [ ] Linux: AppImage, .deb
- [ ] macOS: .dmg, .app bundle
- [ ] Windows: .msi, .exe installer

### 4.3 Icon & Assets
- [ ] Create app icon (512x512, 256x256, 128x128, etc.)
- [ ] Add to `src-tauri/icons/`

## Phase 5: Testing Strategy

### 5.1 Unit Tests
- Rust: Test JHOVE CLI parsing, error handling
- TypeScript: Test IPC wrapper functions

### 5.2 Integration Tests
- File validation flow end-to-end
- Settings persistence
- Module auto-detection

### 5.3 Platform Testing
- [ ] Linux (Ubuntu 20.04+, Fedora)
- [ ] macOS (11+)
- [ ] Windows (10/11)

### 5.4 Test Cases
1. Valid PDF file → expect well-formed result
2. Invalid/corrupted file → expect error messages
3. Missing JHOVE → expect clear error
4. Large file (>100MB) → performance test
5. Settings save/load → persistence check
6. All 17 modules → validate each works

## Phase 6: Documentation

### 6.1 User Documentation
- README with installation instructions
- JHOVE installation guide per platform
- Screenshots of app
- Troubleshooting section

### 6.2 Developer Documentation
- ARCHITECTURE.md update
- Rust API documentation
- Build instructions
- Contributing guide

## File Structure (Target)

```
jhove-next/
├── src/                      # React frontend (unchanged mostly)
│   ├── app/
│   │   ├── page.tsx         # Main app (updated IPC)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── HomeSection.tsx  # Updated: Tauri file picker
│   │   ├── AnalyseSection.tsx
│   │   ├── AboutSection.tsx
│   │   └── SettingsSection.tsx  # NEW
│   └── lib/
│       └── tauri-api.ts     # NEW: IPC wrapper
├── src-tauri/               # NEW: Rust backend
│   ├── src/
│   │   ├── main.rs          # Tauri commands
│   │   ├── jhove.rs         # JHOVE CLI integration
│   │   ├── file_ops.rs      # File operations
│   │   └── settings.rs      # Config management
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── icons/
├── out/                     # Next.js static export
├── next.config.js           # Updated for static export
├── package.json             # Updated scripts
└── TAURI_MIGRATION_PLAN.md  # This file
```

## Timeline Estimate

- **Phase 1 (Setup):** 1-2 hours
- **Phase 2 (Rust Backend):** 3-4 hours
- **Phase 3 (Frontend Updates):** 2-3 hours
- **Phase 4 (Build/Package):** 1-2 hours
- **Phase 5 (Testing):** 2-3 hours
- **Phase 6 (Documentation):** 1 hour

**Total:** ~10-15 hours of focused development

## Key Technical Decisions

### JHOVE Output Format
✅ **Use JSON handler (`-h JSON`)**
- Structured, easy to parse
- All data available programmatically
- Consistent cross-platform

### Module Detection
Same logic as web app:
- File extension mapping
- MIME type detection
- Fallback to BYTESTREAM

### Settings Storage
Use Tauri's `app_data_dir()` for platform-appropriate config location

### Error Handling
- Missing JHOVE: Show setup wizard
- Invalid file: Display friendly error
- CLI errors: Show full JHOVE message

## Dependencies to Install

**Development:**
```bash
# Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Tauri CLI
npm install -D @tauri-apps/cli

# Tauri API
npm install @tauri-apps/api
```

## CLI Capabilities Confirmed

✅ **Folder Processing:** `-r` flag processes directories recursively
```bash
jhove -h JSON -r /path/to/folder/
# Returns JSON array with all files processed
```

✅ **Auto-Detection:** JHOVE automatically detects format when no module specified
```bash
jhove -h JSON file.pdf  # Auto-detects PDF-hul
jhove -h JSON file.wav  # Auto-detects WAVE-hul
```

## Design Decisions

1. ✅ **App Name:** "JHOVE Desktop"
2. ✅ **JHOVE Installation:** 
   - User can browse to existing installation
   - If not found, auto-download from https://software.openpreservation.org/releases/jhove-latest.jar
   - Store preference in settings
3. ✅ **Navigation:** Home, Analyse, About, **Settings** (4 tabs)
4. ✅ **About Section:** Update to reflect desktop version

## Additional Features (Phase 7 - Future)

### Folder Processing
- [ ] Add "Pick Folder" button alongside "Pick File"
- [ ] Process all files in folder recursively with `-r` flag
- [ ] Display folder processing progress (N files processed)
- [ ] Show results in navigable tree/list view

### Auto-Detection Enhancement
- [ ] Remove client-side module detection logic
- [ ] Use JHOVE's built-in auto-detection (omit `-m` flag)
- [ ] Keep manual module selection as option for user override
- [ ] Show detected module in results

### Results Navigation (Folder View)
- [ ] Tree view of processed files
- [ ] Filter by status (Valid/Invalid/Well-formed)
- [ ] Search/filter by filename
- [ ] Export all results to single report
- [ ] Summary statistics (X valid, Y invalid, Z formats)

## Priority: Skeleton App First

**MVP Scope (Phases 1-4):**
- Single file processing only
- Manual module selection (use existing UI)
- Settings screen for JHOVE path
- Auto-download JHOVE if missing
- Basic validation display

**Later (Phase 7):**
- Folder processing
- Auto-detection
- Advanced results navigation

## Ready to Start!

Begin with Phase 1: Project setup and Tauri initialization.
