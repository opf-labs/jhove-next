mod jhove;
mod settings;

use sha1::{Digest, Sha1};
use std::fs::File;
use std::io::Read;

#[tauri::command]
async fn calculate_sha1(file_path: String) -> Result<String, String> {
    let mut file = File::open(&file_path)
        .map_err(|e| format!("Failed to open file: {}", e))?;
    
    let mut hasher = Sha1::new();
    let mut buffer = vec![0; 8192]; // 8KB buffer
    
    loop {
        let bytes_read = file.read(&mut buffer)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        if bytes_read == 0 {
            break;
        }
        
        hasher.update(&buffer[..bytes_read]);
    }
    
    let result = hasher.finalize();
    Ok(format!("{:x}", result))
}

#[tauri::command]
async fn validate_file(file_path: String, module: String) -> Result<String, String> {
    let jhove_path = settings::get_jhove_path()
        .ok_or_else(|| "JHOVE not configured. Please set the JHOVE path in Settings.".to_string())?;
    
    // If module is empty, AUTO, or not specified, let JHOVE auto-detect (no -m flag)
    let module_arg = if module.is_empty() || module == "AUTO" {
        None
    } else {
        Some(module.as_str())
    };
    
    jhove::execute_jhove(&jhove_path, &file_path, module_arg)
}

#[tauri::command]
async fn validate_folder(folder_path: String, module: String) -> Result<String, String> {
    let jhove_path = settings::get_jhove_path()
        .ok_or_else(|| "JHOVE not configured. Please set the JHOVE path in Settings.".to_string())?;
    
    // If module is empty, AUTO, or not specified, let JHOVE auto-detect (no -m flag)
    let module_arg = if module.is_empty() || module == "AUTO" {
        None
    } else {
        Some(module.as_str())
    };
    
    jhove::execute_jhove_folder(&jhove_path, &folder_path, module_arg)
}

#[tauri::command]
async fn get_jhove_modules() -> Result<Vec<String>, String> {
    let jhove_path = settings::get_jhove_path()
        .ok_or_else(|| "JHOVE not configured. Please set the JHOVE path in Settings.".to_string())?;
    
    jhove::get_available_modules(&jhove_path)
}

#[tauri::command]
async fn get_jhove_path() -> Result<Option<String>, String> {
    Ok(settings::get_jhove_path())
}

#[tauri::command]
async fn set_jhove_path(path: String) -> Result<bool, String> {
    // Validate the path exists
    if !std::path::Path::new(&path).exists() {
        return Err("JHOVE executable not found at the specified path".to_string());
    }
    
    // Validate it's actually JHOVE
    if !jhove::validate_jhove_installation(&path) {
        return Err("The specified file is not a valid JHOVE installation".to_string());
    }
    
    let mut settings = settings::load_settings();
    settings.jhove_path = Some(path);
    settings::save_settings(&settings)?;
    
    Ok(true)
}

#[tauri::command]
async fn validate_jhove_path(path: String) -> Result<bool, String> {
    if !std::path::Path::new(&path).exists() {
        return Ok(false);
    }
    Ok(jhove::validate_jhove_installation(&path))
}

#[tauri::command]
async fn save_file(file_path: String, content: String) -> Result<(), String> {
    use std::path::Path;
    
    // Validate the file path is not empty
    if file_path.is_empty() {
        return Err("File path cannot be empty".to_string());
    }
    
    let path = Path::new(&file_path);
    
    // Ensure the file has a .json extension (since this is only used for JSON reports)
    if path.extension().and_then(|s| s.to_str()) != Some("json") {
        return Err("Only .json files are allowed".to_string());
    }
    
    // Ensure parent directory exists or can be created
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }
    
    // Write the file
    std::fs::write(&file_path, content)
        .map_err(|e| format!("Failed to save file: {}", e))?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        calculate_sha1,
        validate_file,
        validate_folder,
        get_jhove_modules,
        get_jhove_path,
        set_jhove_path,
        validate_jhove_path,
        save_file,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

