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
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    // Check if we got valid JSON output, even if the command exited with an error
    // JHOVE sometimes outputs warnings/errors to stderr but still produces valid JSON
    if !stdout.trim().is_empty() && stdout.trim().starts_with('{') {
        // We have JSON output - use it even if there were warnings
        // Filter out XSLT warnings from stderr - they're noise
        let significant_errors: Vec<&str> = stderr
            .lines()
            .filter(|line| !line.contains("XSLT version ignored"))
            .filter(|line| !line.trim().is_empty())
            .collect();
        
        if !significant_errors.is_empty() {
            // Log errors but don't fail if we have valid JSON
            eprintln!("JHOVE warnings/errors (but produced valid output): {}", significant_errors.join("\n"));
        }
        
        Ok(stdout)
    } else if output.status.success() {
        // No JSON but command succeeded - this is unexpected
        Ok(stdout)
    } else {
        // No valid output and command failed
        Err(format!("JHOVE execution failed: {}", stderr))
    }
}

/// Execute JHOVE CLI on a folder and return JSON output
/// Note: JHOVE processes directories by default when given a directory path
pub fn execute_jhove_folder(
    jhove_path: &str,
    folder_path: &str,
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
    
    // Add the folder path - JHOVE will process all files in the directory
    cmd.arg(folder_path);
    
    // Execute and capture output
    let output = cmd.output().map_err(|e| format!("Failed to execute JHOVE: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    // Check if we got valid JSON output, even if the command exited with an error
    // JHOVE sometimes outputs warnings/errors to stderr but still produces valid JSON
    if !stdout.trim().is_empty() && stdout.trim().starts_with('{') {
        // We have JSON output - use it even if there were warnings
        // Filter out XSLT warnings from stderr - they're noise
        let significant_errors: Vec<&str> = stderr
            .lines()
            .filter(|line| !line.contains("XSLT version ignored"))
            .filter(|line| !line.trim().is_empty())
            .collect();
        
        if !significant_errors.is_empty() {
            // Log errors but don't fail if we have valid JSON
            eprintln!("JHOVE warnings/errors (but produced valid output): {}", significant_errors.join("\n"));
        }
        
        Ok(stdout)
    } else if output.status.success() {
        // No JSON but command succeeded - this is unexpected
        Ok(stdout)
    } else {
        // No valid output and command failed
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

/// Get list of available JHOVE modules from the CLI
pub fn get_available_modules(jhove_path: &str) -> Result<Vec<String>, String> {
    let output = Command::new(jhove_path)
        .arg("-l")
        .output()
        .map_err(|e| format!("Failed to execute JHOVE: {}", e))?;
    
    if !output.status.success() {
        return Err("Failed to retrieve JHOVE modules".to_string());
    }
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut modules = vec!["AUTO".to_string()];
    
    // Parse the output to extract module names
    // JHOVE -l output format includes lines like "Module: ModuleName-suffix VERSION"
    // We want to extract just the module name, not the version
    for line in stdout.lines() {
        let trimmed = line.trim();
        // Look for lines that start with "Module:" and extract the module name
        if trimmed.starts_with("Module:") {
            // Extract the module name after "Module: " and before any version number
            if let Some(after_prefix) = trimmed.strip_prefix("Module:") {
                // Split by whitespace and take the first part (module name only)
                if let Some(module_name) = after_prefix.trim().split_whitespace().next() {
                    if !module_name.is_empty() {
                        modules.push(module_name.to_string());
                    }
                }
            }
        }
    }
    
    Ok(modules)
}
