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

function startBGM() {
    var bgm = document.getElementById("bgm");
    bgm.play().catch(error => {
        console.log("再生エラー:", error);
        alert("BGMの再生にはタップが必要です。");
    });
}

function adjustVolume() {
    var bgm = document.getElementById("bgm");
    var volume = document.getElementById("volume").value;
    bgm.volume = volume;
}

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

window.addEventListener('resize', function() {
    document.body.style.zoom = 'reset';
    document.body.style.transform = 'none';
});

window.addEventListener('scroll', function() {
    document.body.style.zoom = 'reset';
});

function adjustElementsForMobile() {
    if (window.innerWidth <= 767) {
        var musicPlayer = document.querySelector('.music-player');
        if (musicPlayer) {
            musicPlayer.style.position = 'static';
            musicPlayer.style.width = '100%';
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateTime, 5000);
    updateTime();
    adjustElementsForMobile();
});

window.addEventListener('resize', adjustElementsForMobile);