const cameraPageButton = document.getElementById("camera-page-button");
const imgInputDiv = document.getElementById("img-input-div");
const imageInput = document.getElementById("image-input");
const userUploadedImg = document.getElementById("user-uploaded-img");
const imageClearButton = document.getElementById("image-clear");
const imageDetectButton = document.getElementById("image-detect");
const imageDownloadButton = document.getElementById("image-download");

function setimageDetectButton(status) {
    imageDetectButton.disabled = status;
}

export { cameraPageButton, imgInputDiv, imageInput, userUploadedImg, imageClearButton, imageDetectButton, imageDownloadButton, setimageDetectButton };