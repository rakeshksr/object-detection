use std::collections::HashMap;
use std::sync::Mutex;

use base64::prelude::*;
use image::{self, DynamicImage, ImageFormat};
use once_cell::sync::Lazy;
use tract_onnx::prelude::*;
// use tract_onnx::tract_core::ndarray::{self, ArrayBase, OwnedRepr};
use tract_onnx::tract_hir::infer::InferenceOp;

use object_detection_core;

static MODEL: Lazy<
    Mutex<
        Option<
            SimplePlan<
                InferenceFact,
                Box<dyn InferenceOp>,
                Graph<InferenceFact, Box<dyn InferenceOp>>,
            >,
        >,
    >,
> = Lazy::new(|| Mutex::new(None));
static LABELS: Lazy<Mutex<Option<Vec<String>>>> = Lazy::new(|| Mutex::new(None));

#[tauri::command(rename_all = "snake_case")]
fn load_model(model_path: &str) {
    let m = object_detection_core::load_model(model_path);
    let mut model = MODEL.lock().unwrap();
    *model = Some(m);
}

#[tauri::command(rename_all = "snake_case")]
fn load_labels(labels_path: &str) {
    let classes = object_detection_core::load_labels(labels_path);
    let mut labels = LABELS.lock().unwrap();
    *labels = Some(classes);
}

#[tauri::command(rename_all = "snake_case")]
fn get_labels() -> Option<Vec<String>> {
    let labels = LABELS.lock().unwrap();
    // return labels.clone();
    return labels.to_owned();
}

#[tauri::command(rename_all = "snake_case")]
fn clear_ai_content() {
    let mut model = MODEL.lock().unwrap();
    *model = None;
    let mut labels = LABELS.lock().unwrap();
    *labels = None;
}

fn decode_dataurl_image(dataurl_image: &str) -> (DynamicImage, String) {
    let dlm = "base64,";
    let (_mime_header, base64_string) = dataurl_image.split_once(dlm).unwrap();
    let bytes_image = BASE64_STANDARD
        .decode(base64_string)
        .expect("Image not decoded successfully");
    let img = image::load_from_memory(&bytes_image).expect("Image not loaded successfully");
    let mime_header = format!("{_mime_header}{dlm}");
    return (img, mime_header);
}

#[tauri::command(rename_all = "snake_case")]
fn detect(dataurl_image: &str) -> Vec<f32> {
    let (img, _) = decode_dataurl_image(dataurl_image);
    let model = MODEL.lock().unwrap();
    let predictions = object_detection_core::detect(model.clone().expect(""), img.into());
    return predictions.into_raw_vec();
}

#[tauri::command(rename_all = "snake_case")]
fn detect_draw(dataurl_image: &str) -> String {
    let (img, mime_header) = decode_dataurl_image(dataurl_image);
    let format_map = HashMap::from([
        (String::from("data:image/jpeg;base64,"), ImageFormat::Jpeg),
        (String::from("data:image/png;base64,"), ImageFormat::Png),
    ]);

    let model = MODEL.lock().unwrap();
    let predictions = object_detection_core::detect(model.clone().expect(""), img.clone().into());
    let _labels = LABELS.lock().unwrap();
    // let classes = _labels.to_owned().unwrap();
    let classes = _labels.clone().unwrap();
    let img_res: image::ImageBuffer<image::Rgb<u8>, Vec<u8>> =
        object_detection_core::draw_predictions(img.into(), predictions, classes);
    let mut buf: Vec<u8> = Vec::new();
    img_res
        .write_to(
            &mut std::io::Cursor::new(&mut buf),
            *format_map.get(&mime_header).unwrap(),
        )
        .unwrap();
    let res_base64 = BASE64_STANDARD.encode(&buf);
    let res_dataurl_image = format!("{mime_header}{res_base64}");
    return res_dataurl_image;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            load_model,
            load_labels,
            get_labels,
            clear_ai_content,
            detect,
            detect_draw
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
