const aimodelButton = document.getElementById("aimodel");
const ailabelsButton = document.getElementById("ailabels");
const aiclearButton = document.getElementById("aiclear");

function setAiClearButton(status) {
    aiclearButton.disabled = status;
}


export { aimodelButton, ailabelsButton, aiclearButton, setAiClearButton };