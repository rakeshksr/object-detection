const aimodelButton = document.getElementById("aimodel");
const ailabelsButton = document.getElementById("ailabels");
const aiclearButton = document.getElementById("aiclear");

function setAiClearButton(status) {
    aiclearButton.disabled = status;
    if (status) {
        aiclearButton.children[0].classList.remove("symbol-danger");
    } else {
        aiclearButton.children[0].classList.add("symbol-danger");
    }
}


export { aimodelButton, ailabelsButton, aiclearButton, setAiClearButton };