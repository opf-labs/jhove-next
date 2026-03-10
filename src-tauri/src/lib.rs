mod jhove;
mod settings;

#[tauri::command]
async fn validate_file(file_path: String, module: String) -> Result<String, String> {
    let jhove_path = settings::get_jhove_path()
        .ok_or_else(|| "JHOVE not configured. Please set the JHOVE path in Settings.".to_string())?;
    
    let module_arg = if module == "AUTO" || module.is_empty() {
        None
    } else {
        Some(module.as_str())
    };
    
    jhove::execute_jhove(&jhove_path, &file_path, module_arg)
}

#[tauri::command]
async fn get_jhove_modules() -> Result<Vec<String>, String> {
    Ok(jhove::get_available_modules())
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
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
        validate_file,
        get_jhove_modules,
        get_jhove_path,
        set_jhove_path,
        validate_jhove_path,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

