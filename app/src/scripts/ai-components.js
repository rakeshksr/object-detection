const aimodelButton = document.getElementById("aimodel");
const ailabelsButton = document.getElementById("ailabels");
const aiclearButton = document.getElementById("aiclear");

function setAiClearButton(status) {
    if (status) {
        aiclearButton.classList.remove("d-none");
    } else {
        aiclearButton.classList.add("d-none");
    }
}


export { aimodelButton, ailabelsButton, aiclearButton, setAiClearButton };