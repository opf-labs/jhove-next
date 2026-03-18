use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub jhove_path: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            jhove_path: None,
        }
    }
}

/// Get the settings file path based on the platform
fn get_settings_path() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?;
    Ok(config_dir.join("jhove-desktop").join("config.json"))
}

/// Load settings from disk
pub fn load_settings() -> Settings {
    match get_settings_path() {
        Ok(settings_path) => {
            if settings_path.exists() {
                if let Ok(contents) = fs::read_to_string(&settings_path) {
                    if let Ok(settings) = serde_json::from_str(&contents) {
                        return settings;
                    }
                }
            }
            Settings::default()
        }
        Err(_) => {
            // If we can't get the config directory, just use defaults
            Settings::default()
        }
    }
}

/// Save settings to disk
pub fn save_settings(settings: &Settings) -> Result<(), String> {
    let settings_path = get_settings_path()?;
    
    // Create directory if it doesn't exist
    if let Some(parent) = settings_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    let json = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(&settings_path, json)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    
    Ok(())
}

/// Get the current JHOVE path from settings or detect default
pub fn get_jhove_path() -> Option<String> {
    let settings = load_settings();
    
    if let Some(path) = settings.jhove_path {
        if std::path::Path::new(&path).exists() {
            return Some(path);
        }
    }
    
    // Try to detect default locations
    detect_jhove_path()
}

/// Attempt to detect JHOVE installation
fn detect_jhove_path() -> Option<String> {
    let home = std::env::var("HOME").unwrap_or_default();
    let possible_paths = vec![
        "/usr/local/bin/jhove".to_string(),
        "/usr/bin/jhove".to_string(),
        format!("{}/jhove/jhove", home),
        format!("{}/bin/jhove", home),
    ];
    
    for path in possible_paths {
        if std::path::Path::new(&path).exists() {
            return Some(path);
        }
    }
    
    None
}
