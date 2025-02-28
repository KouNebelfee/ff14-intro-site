// script.js

// BGMの再生/一時停止を切り替え
function toggleBGM() {
    var bgm = document.getElementById("bgm");
    if (bgm.paused) {
        bgm.play().catch(error => console.log("再生エラー:", error));
    } else {
        bgm.pause();
    }
}

// BGMを開始（手動用）
function startBGM() {
    var bgm = document.getElementById("bgm");
    bgm.play().catch(error => console.log("再生エラー:", error));
}

// ボリューム調整
function adjustVolume() {
    var bgm = document.getElementById("bgm");
    var volume = document.getElementById("volume").value;
    bgm.volume = volume;
}

// 時間更新
function updateTime() {
    var now = new Date();
    var realTime = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    var realTimeElements = document.querySelectorAll("#real-time");
    realTimeElements.forEach(element => element.textContent = realTime);

    var eorzeaTimeMs = now.getTime() * (3600 / 175) / 1000;
    var eorzeaHours = Math.floor(eorzeaTimeMs / 3600) % 24;
    var eorzeaMinutes = Math.floor((eorzeaTimeMs % 3600) / 60);
    var eorzeaTime = `${String(eorzeaHours).padStart(2, "0")}:${String(eorzeaMinutes).padStart(2, "0")}`;
    var eorzeaTimeElements = document.querySelectorAll("#eorzea-time");
    eorzeaTimeElements.forEach(element => element.textContent = eorzeaTime);
}

// ページ読み込み時に時間更新を開始（音楽関連は削除）
document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateTime, 1000); // 時間更新を継続
    updateTime(); // 即時更新
});