import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { downloadDir } from "@tauri-apps/api/path";

import { aimodelButton, ailabelsButton, aiclearButton } from "./ai-components";
import { setModelLoadStatus, setLabelsLoadStatus, changeAiClearButtonStatus, changeImageDetectButtonStatus, changeVideoDetectButtonStatus } from "./load-status";

aimodelButton.addEventListener("click", loadModel);
ailabelsButton.addEventListener("click", loadLabels);
aiclearButton.addEventListener("click", clearAiContent);

async function loadModel() {
    const modelOpen = await open({
        // defaultPath: await downloadDir(),
        filters: [{
            name: "Model",
            extensions: ["onnx"]
        }]
    });
    if (modelOpen !== null) {
        const modelPath = modelOpen.path;
        invoke("load_model", { model_path: modelPath });
        // modelLoadStatus = true;
        setModelLoadStatus(true);
    }
    changeAiClearButtonStatus();
    changeImageDetectButtonStatus();
    changeVideoDetectButtonStatus();
}

async function loadLabels() {
    const labelsOpen = await open({
        // defaultPath: await downloadDir(),
        filters: [{
            name: "Labels",
            extensions: ["txt"]
        }]
    });
    if (labelsOpen !== null) {
        const labelsPath = labelsOpen.path;
        invoke("load_labels", { labels_path: labelsPath });
        // labelsLoadStatus = true;
        setLabelsLoadStatus(true);
    }
    changeAiClearButtonStatus();
    changeImageDetectButtonStatus();
    changeVideoDetectButtonStatus();
}

function clearAiContent() {
    invoke("clear_ai_content");
    setModelLoadStatus(false);
    setLabelsLoadStatus(false);
    changeAiClearButtonStatus();
    changeImageDetectButtonStatus();
    changeVideoDetectButtonStatus();
}