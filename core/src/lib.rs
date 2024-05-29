use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};

use image::{imageops::FilterType, ImageBuffer, Rgb};

use imageproc::drawing::{draw_hollow_rect_mut, draw_text_mut};
use imageproc::rect::Rect;

use ab_glyph::{FontRef, PxScale};
use bracket_color::prelude::*;

use tract_onnx::prelude::*;
use tract_onnx::tract_core::ndarray::{self, ArrayBase, OwnedRepr};
use tract_onnx::tract_hir::infer::InferenceOp;
use tract_onnx::tract_hir::tract_ndarray::{array, s, Array, Axis};

fn rgb_colors(n: usize) -> Vec<Rgb<u8>> {
    let mut rgb_clrs: Vec<Rgb<u8>> = Array::linspace(0., 1., n + 1)
        .iter()
        .map(|x| {
            let rgb = HSV::from_f32(*x, 1.0, 1.0).to_rgb();
            Rgb([
                (255.0 * rgb.r) as u8,
                (255.0 * rgb.g) as u8,
                (255.0 * rgb.b) as u8,
            ])
        })
        .collect();
    rgb_clrs.pop();
    return rgb_clrs;
}

pub fn load_model(
    filepath_onnx: &str,
) -> SimplePlan<InferenceFact, Box<dyn InferenceOp>, Graph<InferenceFact, Box<dyn InferenceOp>>> {
    // Deep learning Model(ONNX)
    // load the model
    let model = tract_onnx::onnx()
        .model_for_path(filepath_onnx)
        .unwrap()
        // .with_input_fact(0, f32::fact(&[1, 3, 640, 640]).into())
        // .unwrap()
        // .into_optimized()
        // .unwrap()
        .into_runnable()
        .unwrap();
    return model;
}

pub fn load_image(filepath_image: &str) -> ImageBuffer<Rgb<u8>, Vec<u8>> {
    let img: ImageBuffer<Rgb<u8>, Vec<u8>> = image::open(filepath_image).unwrap().to_rgb8();
    return img;
}

pub fn load_labels(classes_path: &str) -> Vec<String> {
    // Onnx Classes
    let file: File = File::open(classes_path).unwrap();
    let classes: Vec<String> = BufReader::new(file)
        .lines()
        .map(|x| x.unwrap())
        .collect::<Vec<_>>();
    return classes;
}

pub fn detect(
    model: SimplePlan<
        InferenceFact,
        Box<dyn InferenceOp>,
        Graph<InferenceFact, Box<dyn InferenceOp>>,
    >,
    img: ImageBuffer<Rgb<u8>, Vec<u8>>,
) -> Option<ArrayBase<OwnedRepr<f32>, ndarray::Dim<[usize; 2]>>> {
    // Preprocessing
    let imgrsz: ImageBuffer<Rgb<u8>, Vec<u8>> =
        image::imageops::resize(&img, 640, 640, FilterType::Triangle);
    let inimg: Tensor = tract_ndarray::Array4::from_shape_fn((1, 3, 640, 640), |(_, c, y, x)| {
        // let mean = [0.485, 0.456, 0.406][c];
        // let std = [0.229, 0.224, 0.225][c];
        // (resized[(x as _, y as _)][c] as f32 / 255.0 - mean) / std
        imgrsz[(x as _, y as _)][c] as f32 / 255.0
    })
    .into();

    // Model Prediction
    let predictions = match model.run(tvec!(inimg.into())) {
        Ok(scrs) => {
            let scores = scrs[0].to_array_view::<f32>().unwrap();
            Some(scores.slice(s![.., 1..]).to_owned())
        }
        Err(_) => None,
    };
    return predictions;
}

pub fn draw_predictions(
    img: ImageBuffer<Rgb<u8>, Vec<u8>>,
    predictions: ArrayBase<OwnedRepr<f32>, ndarray::Dim<[usize; 2]>>,
    classes: Vec<String>,
) -> ImageBuffer<Rgb<u8>, Vec<u8>> {
    let (image_width, image_height) = img.dimensions();
    let x_factor: f32 = image_width as f32 / 640.0;
    let y_factor: f32 = image_height as f32 / 640.0;

    let mut result = predictions;
    let factor = array![[x_factor, y_factor, x_factor, y_factor]];
    let s = result.slice(s![.., ..4]).to_owned();
    result.slice_mut(s![.., ..4]).assign(&(s * factor));
    result.slice_mut(s![.., 5]).mapv_inplace(|a| a * 100.0);

    let l: usize = classes.len();
    let rgb_clrs: Vec<Rgb<u8>> = rgb_colors(l);
    let clrs: HashMap<&String, &Rgb<u8>> = classes
        .iter()
        .zip(rgb_clrs.iter())
        .collect::<HashMap<_, _>>();

    // Final Result
    let mut img_res: ImageBuffer<Rgb<u8>, Vec<u8>> = img.clone();
    for res in result.axis_iter(Axis(0)) {
        let x: f32 = res[[0]];
        let y: f32 = res[[1]];
        let w: f32 = res[[2]] - x;
        let h: f32 = res[[3]] - y;
        let text_x: f32 = (res[[2]] + x) / 2.0;
        // let text_y = y;
        let cls: &String = &classes[res[4] as usize];
        let clr: Rgb<u8> = *clrs[&cls];
        draw_hollow_rect_mut(
            &mut img_res,
            Rect::at(x as i32, y as i32).of_size(w as u32, h as u32),
            clr,
        );
        let scale: PxScale = PxScale { x: 30.0, y: 30.0 };
        let font: FontRef =
            FontRef::try_from_slice(include_bytes!("../resources/arial.ttf")).unwrap();
        let text: String = format!("{} {:.2}%", classes[res[4] as usize], res[5]);
        draw_text_mut(
            &mut img_res,
            clr,
            text_x as i32,
            y as i32,
            scale,
            &font,
            &text,
        );
    }

    return img_res;
}
