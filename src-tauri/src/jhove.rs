use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct JhoveResult {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
}

/// Execute JHOVE CLI and return JSON output
pub fn execute_jhove(
    jhove_path: &str,
    file_path: &str,
    module: Option<&str>,
) -> Result<String, String> {
    let mut cmd = Command::new(jhove_path);
    
    // Add module if specified
    if let Some(m) = module {
        if !m.is_empty() && m != "AUTO" {
            cmd.arg("-m").arg(m);
        }
    }
    
    // Always use JSON output handler
    cmd.arg("-h").arg("JSON");
    
    // Add the file path
    cmd.arg(file_path);
    
    // Execute and capture output
    let output = cmd.output().map_err(|e| format!("Failed to execute JHOVE: {}", e))?;
    
    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(stdout)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("JHOVE execution failed: {}", stderr))
    }
}

/// Validate that JHOVE is installed at the given path
pub fn validate_jhove_installation(jhove_path: &str) -> bool {
    Command::new(jhove_path)
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

/// Get list of available JHOVE modules
pub fn get_available_modules() -> Vec<String> {
    vec![
        "AUTO".to_string(),
        "BYTESTREAM".to_string(),
        "AIFF-hul".to_string(),
        "ASCII-hul".to_string(),
        "EPUB-ptc".to_string(),
        "GIF-hul".to_string(),
        "GZIP-kb".to_string(),
        "HTML-hul".to_string(),
        "JPEG-hul".to_string(),
        "JPEG2000-hul".to_string(),
        "PDF-hul".to_string(),
        "PNG-gdm".to_string(),
        "TIFF-hul".to_string(),
        "UTF8-hul".to_string(),
        "WARC-kb".to_string(),
        "WAVE-hul".to_string(),
        "XML-hul".to_string(),
    ]
}
