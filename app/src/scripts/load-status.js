import { setAiClearButton } from "./ai-components";
import { setimageDetectButton } from "./image-page-components";
import { setVideoDetectButton } from "./video-page-components";

let modelLoadStatus = false;
let labelsLoadStatus = false;
let imageLoadStatus = false;
// let imageDetectStatus = false;
let videoCameraOnStatus = false;

function setModelLoadStatus(status) {
	modelLoadStatus = status;
}

function setLabelsLoadStatus(status) {
	labelsLoadStatus = status;
}

function changeAiClearButtonStatus() {
	const status = modelLoadStatus && labelsLoadStatus;
	setAiClearButton(status);
}

function setimageLoadStatus(status) {
	imageLoadStatus = status;
}

function changeImageDetectButtonStatus() {
	const status = !(modelLoadStatus && labelsLoadStatus && imageLoadStatus);
	setimageDetectButton(status);
}

// function setimageDetectStatus(status) {
//     imageDetectStatus = status;
// }

function setvideoCameraOnStatus(status) {
	videoCameraOnStatus = status;
}

function changeVideoDetectButtonStatus() {
	const status = !(modelLoadStatus && labelsLoadStatus && videoCameraOnStatus);
	setVideoDetectButton(status);
}

export {
	setModelLoadStatus,
	setLabelsLoadStatus,
	changeAiClearButtonStatus,
	setimageLoadStatus,
	changeImageDetectButtonStatus,
	setvideoCameraOnStatus,
	changeVideoDetectButtonStatus,
};
