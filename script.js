// BGMの再生/一時停止を切り替え（スマホ対応）
function toggleBGM() {
    var bgm = document.getElementById("bgm");
    if (bgm.paused) {
        bgm.play().catch(error => {
            console.log("再生エラー:", error);
            alert("BGMの再生にはタップが必要です。ボタンを再度押してください。");
        });
    } else {
        bgm.pause();
    }
}

// BGMを開始（手動用、スマホ対応）
function startBGM() {
    var bgm = document.getElementById("bgm");
    bgm.play().catch(error => {
        console.log("再生エラー:", error);
        alert("BGMの再生にはタップが必要です。");
    });
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

// ウィンドウサイズが変更されたときやスクロール時にズームをリセット
window.addEventListener('resize', function() {
    document.body.style.zoom = 'reset';
    document.body.style.transform = 'none';
});

window.addEventListener('scroll', function() {
    document.body.style.zoom = 'reset';
});

// 音楽プレイヤーや要素をスマホで安定させる
function adjustElementsForMobile() {
    if (window.innerWidth <= 767) { // スマホサイズ（767px以下）
        var musicPlayer = document.querySelector('.music-player');
        if (musicPlayer) {
            musicPlayer.style.position = 'static';
            musicPlayer.style.width = '100%';
        }
    }
}

// ページ読み込み時とリサイズ時に調整
document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateTime, 5000); // 5秒ごとに時間更新
    updateTime(); // 即時更新
    adjustElementsForMobile(); // スマホ対応の調整
});

window.addEventListener('resize', adjustElementsForMobile);