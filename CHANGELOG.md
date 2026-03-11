# Changelog

All notable changes to JHOVE Desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Scan history sidebar for viewing previous validation results
- Save report functionality with native file dialog
- Module detection display for AUTO mode
- Lazy SHA-1 calculation for folder scans
- Rescan individual files from folder scans

### Changed
- Button text from "Download" to "Save" for desktop context
- Modal backdrop opacity for better visibility
- Folder icon for file selection

### Fixed
- Multiple history entries being highlighted for same filename
- Validation messages showing proper JHOVE status
- Error message deduplication with count badges

## Release Instructions

To create a release:

1. Update the version in `src-tauri/Cargo.toml`
2. Update this CHANGELOG with the new version and date
3. Commit the changes: `git commit -am "Release v1.0.0"`
4. Create and push a tag: `git tag v1.0.0 && git push origin v1.0.0`
5. GitHub Actions will automatically build and create a release
