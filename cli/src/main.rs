use clap::Parser;
use object_detection_core::*;

#[derive(Parser, Default, Debug)]
#[clap(author, version, about)]
struct Arguments {
    #[clap(short, long)]
    ///ONNX file path
    onnx: String,
    #[clap(short, long)]
    ///Image file path
    image: String,
    #[clap(short, long)]
    ///Classes file path. Each class for each line
    classes: String,
    #[clap(short, long)]
    ///Result file path
    result: Option<String>,
}

fn main() {
    let args: Arguments = Arguments::parse();
    let filepath_onnx: &str = &args.onnx;
    let filepath_image: &str = &args.image;
    let classes_path: &str = &args.classes;
    let model = load_model(filepath_onnx);
    let img = load_image(filepath_image);
    let classes = load_labels(classes_path);
    let predictions = detect(model, img.clone());
    let img_res = draw_predictions(img, predictions, classes);
    let result: String = match args.result {
        Some(path) => path,
        None => "result.jpg".to_string(),
    };
    img_res.save(result).unwrap();
}
