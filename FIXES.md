# JHOVE Next.js App - Fixed Issues

## Issues Fixed:

### 1. ✅ Hydration Error (Script Placement)
**Problem:** `<Script>` tag was outside `<head>` causing React hydration errors
**Fix:** Moved `<Script src="/env-config.js">` inside `<head>` in `layout.tsx`

### 2. ✅ API Configuration
**Problem:** `env-config.js` pointed to `http://localhost:3304` (not running)
**Fix:** Updated to `https://jhove-rs.openpreservation.org`

## Working External API

The app now uses the **JHOVE REST API** at:
- **Base URL:** https://jhove-rs.openpreservation.org
- **Swagger Docs:** https://jhove-rs.openpreservation.org/api/swagger
- **Validation Endpoint:** `POST /api/jhove/validate`

### API Details:
- **Method:** POST multipart/form-data
- **Parameters:** 
  - `file` - The file to validate
  - `module` - The JHOVE module to use (e.g., "JPEG-hul", "PDF-hul")

## Testing the App

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Test file validation:**
   - Select a module from dropdown (e.g., "JPEG-hul" for JPG files)
   - Drag & drop or click to upload a file
   - View validation results in the "Analyse" section

## Available JHOVE Modules

The dropdown modules are correct and match the API:
- AIFF-hul (Audio)
- ASCII-hul (Text)
- BYTESTREAM (Generic)
- EPUB-ptc (EPUB books)
- GIF-hul (GIF images)
- GZIP-kb (Compressed files)
- HTML-hul (HTML files)
- JPEG-hul (JPEG images)
- JPEG2000-hul (JPEG2000 images)
- PDF-hul (PDF documents)
- PNG-gdm (PNG images)
- TIFF-hul (TIFF images)
- UTF8-hul (UTF-8 text)
- WARC-kb (Web archives)
- WAVE-hul (Audio)
- XML-hul (XML files)

## Test API Script

Run `./test-api.sh` to verify API connectivity independently.

## Next Steps

Now that the demo works with the external API, you can:

1. **Keep using external API** (current setup)
2. **Build local API routes** to run JHOVE on your server
3. **Create Electron app** for standalone desktop application

See `ARCHITECTURE.md` for implementation details on each approach.
