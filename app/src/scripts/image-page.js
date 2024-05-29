import { invoke } from "@tauri-apps/api/core";

import { pageHandler } from "./page-handler";
import { cameraPageButton, imgInputDiv, imageInput, userUploadedImg, imageClearButton, imageDetectButton, imageResetButton, imageDownloadButton, setimageDetectButton } from "./image-page-components";
import { setimageLoadStatus, changeImageDetectButtonStatus } from "./load-status";

cameraPageButton.addEventListener("click", (event) => {
    pageHandler(event, "camera-page");
});
imageInput.addEventListener("change", userImageInput);
imageClearButton.addEventListener("click", clearImage);
imageDetectButton.addEventListener("click", imageDetect);
imageResetButton.addEventListener("click", imageReset);
imageDownloadButton.addEventListener("click", downloadDetectImage);

let originalImage = "";

function userImageInput(event) {
    if (event.target.files) {
        let file = event.target?.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            userUploadedImg.src = reader.result;
            originalImage = reader.result;
            imgInputDiv.classList.add("d-none");
            userUploadedImg.classList.remove("d-none");
            imageClearButton.classList.remove("d-none");
            imageDetectButton.classList.remove("d-none");
            setimageLoadStatus(true);
            changeImageDetectButtonStatus();
        };

        reader.onerror = function () {
            console.log(reader.error);
        };

    }
}

function clearImage() {
    userUploadedImg.src = "";
    imageInput.value = "";
    imgInputDiv.classList.remove("d-none");
    userUploadedImg.classList.add("d-none");
    imageClearButton.classList.add("d-none");
    imageDetectButton.classList.add("d-none");
    imageResetButton.classList.add("d-none");
    imageDownloadButton.classList.add("d-none");
    setimageLoadStatus(false);
    changeImageDetectButtonStatus();
}

async function imageDetect() {
    const image_data_url = userUploadedImg.src;
    await invoke("detect_draw", { dataurl_image: image_data_url }).then(res_image_data_url => userUploadedImg.src = res_image_data_url);
    setimageDetectButton(true);
    imageResetButton.classList.remove("d-none");
    imageDownloadButton.classList.remove("d-none");
}

function imageReset() {
    if (originalImage) {
        userUploadedImg.src = originalImage;
        imageResetButton.classList.add("d-none");
        imageDownloadButton.classList.add("d-none");
        setimageDetectButton(false);
    }
}

function getCurrentTimeString() {
    const utcTime = new Date();
    const currentTime = new Date(utcTime.getTime() - (utcTime.getTimezoneOffset() * 60000));
    const currentTimeString = currentTime.toISOString().slice(0, -1).replaceAll(/[-T:\.]/g, "_");
    return currentTimeString;
}

function downloadDetectImage() {
    const base64Image = userUploadedImg.src;
    const pattern = /data:image\/([a-zA-Z]{3,4});/;
    let ext = base64Image.match(pattern)[1]
    if (ext == "jpeg") {
        ext = "jpg";
    }
    const fileName = "detected_image_" + getCurrentTimeString() + "." + ext;
    downloadBase64File(base64Image, fileName);
}

function downloadBase64File(base64file, fileName) {
    const downloadLink = document.createElement("a");
    downloadLink.href = base64file;
    downloadLink.download = fileName;
    downloadLink.click();
}