const videoPageButton = document.getElementById("video-page-button");
const startCameraButton = document.getElementById("start-camera");
const stopCameraButton = document.getElementById("stop-camera");
const videoDetectButton = document.getElementById("video-detect");
const videoStream = document.getElementById("video-stream");
const videoStreamCanvas = document.getElementById("video-stream-canvas");

function setVideoDetectButton(status) {
	videoDetectButton.disabled = status;
}

export {
	videoPageButton,
	startCameraButton,
	stopCameraButton,
	videoDetectButton,
	videoStream,
	videoStreamCanvas,
	setVideoDetectButton,
};
