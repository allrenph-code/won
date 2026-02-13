const MODEL_URL = "https://teachablemachine.withgoogle.com/models/Fkh7frPks/";

const imageInput = document.getElementById("image-input");
const statusText = document.getElementById("status");
const labelContainer = document.getElementById("label-container");
const topResult = document.getElementById("top-result");
const previewImage = document.getElementById("preview-image");
const previewContainer = document.getElementById("preview-container");

let model;
let labelRows = [];

imageInput.addEventListener("change", handleFileChange);
window.addEventListener("DOMContentLoaded", initModel);

async function initModel() {
    try {
        setStatus("모델을 불러오는 중입니다...");
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);

        buildLabelRows(model.getClassLabels());
        setStatus("모델 준비 완료. 사진을 선택해 주세요.");
    } catch (error) {
        console.error(error);
        setStatus("모델 로딩에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
}

async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }

    if (!model) {
        setStatus("모델이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.");
        return;
    }

    setStatus("이미지를 불러오는 중입니다...");

    try {
        const imageUrl = window.URL.createObjectURL(file);
        previewImage.src = imageUrl;

        await waitImageLoaded(previewImage);
        previewImage.hidden = false;

        const placeholder = previewContainer.querySelector(".placeholder");
        if (placeholder) {
            placeholder.hidden = true;
        }

        setStatus("분석 중입니다...");
        const predictions = await model.predict(previewImage);
        renderPredictions(predictions);
        setStatus("분석 완료");

        window.URL.revokeObjectURL(imageUrl);
    } catch (error) {
        console.error(error);
        setStatus("이미지 분석에 실패했습니다. 다른 사진으로 시도해 주세요.");
    }
}

function waitImageLoaded(imageElement) {
    return new Promise((resolve, reject) => {
        if (imageElement.complete && imageElement.naturalWidth > 0) {
            resolve();
            return;
        }

        imageElement.onload = () => resolve();
        imageElement.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    });
}

function renderPredictions(predictions) {
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
    const top = sorted[0];
    renderTopResult(top);

    predictions.forEach((prediction, index) => {
        const row = labelRows[index];
        if (!row) {
            return;
        }

        const percent = Math.round(prediction.probability * 100);
        row.value.textContent = percent + "%";
        row.fill.style.width = percent + "%";
    });
}

function buildLabelRows(classLabels) {
    labelContainer.innerHTML = "";
    labelRows = classLabels.map((label) => {
        const row = document.createElement("div");
        row.className = "label-row";

        const head = document.createElement("div");
        head.className = "label-head";

        const name = document.createElement("span");
        name.textContent = label;

        const value = document.createElement("span");
        value.textContent = "0%";

        const bar = document.createElement("div");
        bar.className = "bar";

        const fill = document.createElement("div");
        fill.className = "fill " + getTypeClass(label);

        bar.appendChild(fill);
        head.append(name, value);
        row.append(head, bar);
        labelContainer.appendChild(row);

        return { value, fill };
    });
}

function renderTopResult(prediction) {
    const percent = Math.round(prediction.probability * 100);
    const name = prediction.className;

    const textByType = {
        dog: `강아지상 ${percent}% - 밝고 친근한 인상이에요.`,
        cat: `고양이상 ${percent}% - 시크하고 세련된 분위기예요.`,
        other: `${name} ${percent}% - 독특한 매력이 보여요.`
    };

    const type = getTypeClass(name);
    topResult.textContent = textByType[type];
}

function getTypeClass(label) {
    const normalized = String(label).toLowerCase();
    if (normalized.includes("dog") || normalized.includes("강아지") || normalized.includes("개")) {
        return "dog";
    }
    if (normalized.includes("cat") || normalized.includes("고양이") || normalized.includes("냥")) {
        return "cat";
    }
    return "other";
}

function setStatus(message) {
    statusText.textContent = message;
}
