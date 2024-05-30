import { invoke } from "@tauri-apps/api/core";

import { pageHandler } from "./page-handler";
import {
	videoPageButton,
	startCameraButton,
	stopCameraButton,
	videoDetectButton,
	videoStream,
	videoStreamCanvas,
} from "./video-page-components";
import {
	setvideoCameraOnStatus,
	changeVideoDetectButtonStatus,
} from "./load-status";

videoPageButton.addEventListener("click", (event) => {
	pageHandler(event, "video-page");
});
startCameraButton.addEventListener("click", startCamera);
stopCameraButton.addEventListener("click", stopCamera);
videoDetectButton.addEventListener("click", videoDetect);

async function startCamera() {
	const stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false,
	});
	videoStream.classList.remove("d-none");
	videoStream.srcObject = stream;
	window.localStream = stream;
	startCameraButton.classList.add("d-none");
	stopCameraButton.classList.remove("d-none");
	setvideoCameraOnStatus(true);
	changeVideoDetectButtonStatus();
}

function stopCamera() {
	localStream.getVideoTracks()[0].stop();
	videoStream.src = "";
	videoStream.classList.add("d-none");
	startCameraButton.classList.remove("d-none");
	stopCameraButton.classList.add("d-none");
	setvideoCameraOnStatus(false);
	changeVideoDetectButtonStatus();
}

async function videoDetect() {
	videoStreamCanvas
		.getContext("2d")
		.drawImage(
			videoStream,
			0,
			0,
			videoStreamCanvas.width,
			videoStreamCanvas.height,
		);
	const image_data_url = videoStreamCanvas.toDataURL("image/jpeg");
	await invoke("detect", { dataurl_image: image_data_url }).then(
		(predictions) => {
			console.log(predictions);
		},
	);
}
