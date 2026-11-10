//! Radium Math shell. Kept thin on purpose: in later milestones it exposes
//! only the five commands in architecture Section 8 (SEC-09).

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
