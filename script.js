// BGM関連
function toggleBGM() {
    const bgm = document.getElementById("bgm");
    if (bgm && bgm.paused) {
        bgm.play().catch(error => {
            console.log("再生エラー:", error);
            alert("BGMの再生にはタップが必要です。ボタンを再度押してください。");
        });
    } else if (bgm) {
        bgm.pause();
    }
}

function startBGM() {
    const bgm = document.getElementById("bgm");
    if (bgm) {
        bgm.play().catch(error => {
            console.log("再生エラー:", error);
            alert("BGMの再生にはタップが必要です。");
        });
    }
}

function adjustVolume() {
    const bgm = document.getElementById("bgm");
    const volume = document.getElementById("volume");
    if (bgm && volume) {
        bgm.volume = volume.value;
    }
}

function setupBGM(tracks) {
    const bgm = document.getElementById("bgm");
    const currentTrack = document.getElementById("current-track");
    if (!bgm || !currentTrack) return;

    let currentIndex = Math.floor(Math.random() * tracks.length);

    function updateTrack() {
        bgm.src = tracks[currentIndex].src;
        currentTrack.textContent = tracks[currentIndex].name;
        bgm.load();
        bgm.play().catch(error => console.log("再生エラー:", error));
    }

    updateTrack();

    bgm.addEventListener('ended', () => {
        currentIndex = (currentIndex + 1) % tracks.length;
        updateTrack();
    });

    window.prevTrack = function() {
        currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        updateTrack();
    };

    window.nextTrack = function() {
        currentIndex = (currentIndex + 1) % tracks.length;
        updateTrack();
    };
}

// 時間表示
function updateTime() {
    const now = new Date();
    const realTime = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    document.querySelectorAll("#real-time").forEach(el => el.textContent = realTime);

    const eorzeaTimeMs = now.getTime() * (3600 / 175) / 1000;
    const eorzeaHours = Math.floor(eorzeaTimeMs / 3600) % 24;
    const eorzeaMinutes = Math.floor((eorzeaTimeMs % 3600) / 60);
    const eorzeaTime = `${String(eorzeaHours).padStart(2, "0")}:${String(eorzeaMinutes).padStart(2, "0")}`;
    document.querySelectorAll("#eorzea-time").forEach(el => el.textContent = eorzeaTime);
}

// モバイル調整
function adjustElementsForMobile() {
    if (window.innerWidth <= 767) {
        const musicPlayer = document.querySelector('.music-player');
        if (musicPlayer) {
            musicPlayer.style.position = 'static';
            musicPlayer.style.width = '100%';
        }
    }
}

// スポット管理
const spotsPerPage = 5;
let currentPage = 1;
let spotsData = JSON.parse(localStorage.getItem('spots')) || [];
let nextId = spotsData.length > 0 ? Math.max(...spotsData.map(s => s.id)) + 1 : 1;

function compressImage(file, callback) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            const compressedData = canvas.toDataURL('image/jpeg', 0.7);
            callback(compressedData);
        };
    };
    reader.readAsDataURL(file);
}

function renderSpots() {
    const spotList = document.getElementById('spot-list');
    spotList.innerHTML = '';
    if (spotsData.length === 0) {
        spotList.innerHTML = '<p>まだスポットがありません。管理者モードで追加してください。</p>';
    } else {
        spotsData.forEach(spot => {
            const spotElement = document.createElement('section');
            spotElement.className = 'screenshot-spot';
            spotElement.setAttribute('data-page', spot.page);
            spotElement.setAttribute('data-id', spot.id);
            spotElement.innerHTML = `
                <h2 class="spot-title">${spot.title}</h2>
                <p>${spot.desc}</p>
                <img src="${spot.image}" alt="${spot.title}" class="spot-image">
                <div class="tips"><strong>お気に入りポイント:</strong> ${spot.tips}</div>
            `;
            spotList.appendChild(spotElement);

            const img = spotElement.querySelector('.spot-image');
            img.onload = () => {
                if (img.naturalWidth > window.innerWidth || img.naturalHeight > window.innerHeight * 0.6) {
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '60vh';
                    img.style.objectFit = 'cover';
                }
            };
        });
    }
    updateSpots();
}

function updateSpots() {
    const spots = document.querySelectorAll('.screenshot-spot');
    const totalPages = Math.ceil(spotsData.length / spotsPerPage) || 1;
    spots.forEach(spot => {
        const page = parseInt(spot.getAttribute('data-page'));
        spot.style.display = (page === currentPage) ? 'block' : 'none';
    });

    document.getElementById('page-number').textContent = currentPage;
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
    document.getElementById('footer-prev').classList.toggle('disabled', currentPage === 1);
    document.getElementById('footer-next').classList.toggle('disabled', currentPage === totalPages);
}

window.changePage = function(delta) {
    const totalPages = Math.ceil(spotsData.length / spotsPerPage) || 1;
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    updateSpots();
};

window.closeAdminModal = function() {
    document.getElementById('admin-modal').style.display = 'none';
    document.getElementById('image-preview').style.display = 'none';
};

window.closeEditModal = function() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-image-preview').style.display = 'none';
};

window.addSpot = function(event) {
    event.preventDefault();
    const title = document.getElementById('spot-title').value;
    const desc = document.getElementById('spot-desc').value;
    const fileInput = document.getElementById('spot-image-file');
    const tips = document.getElementById('spot-tips').value;

    if (!fileInput.files[0]) {
        alert("スクショを選択してください！");
        return;
    }

    const file = fileInput.files[0];
    compressImage(file, (compressedData) => {
        const newPage = Math.floor(spotsData.length / spotsPerPage) + 1;
        const newSpot = {
            id: nextId++,
            page: newPage,
            title: title,
            desc: desc,
            image: compressedData,
            tips: tips
        };

        spotsData.push(newSpot);
        try {
            localStorage.setItem('spots', JSON.stringify(spotsData));
            document.getElementById('spot-form').reset();
            document.getElementById('image-preview').style.display = 'none';
            renderSpots();
            updateAdminSpotList();
        } catch (e) {
            alert("ストレージ容量を超えました。スポットを減らすか、画像サイズを小さくしてください。");
            spotsData.pop();
        }
    });
};

function updateAdminSpotList() {
    const adminList = document.getElementById('admin-spot-list');
    adminList.innerHTML = '';
    if (spotsData.length === 0) {
        adminList.innerHTML = '<p>まだスポットがありません。</p>';
    } else {
        spotsData.forEach(spot => {
            const li = document.createElement('div');
            li.className = 'admin-spot-item';
            li.innerHTML = `
                <span>${spot.title}</span>
                <button class="edit-btn" onclick="openEditModal(${spot.id})">編集</button>
                <button class="delete-btn" onclick="deleteSpot(${spot.id})">削除</button>
            `;
            adminList.appendChild(li);
        });
    }
}

window.openEditModal = function(id) {
    const spot = spotsData.find(s => s.id === id);
    if (!spot) return;

    document.getElementById('edit-spot-id').value = spot.id;
    document.getElementById('edit-spot-title').value = spot.title;
    document.getElementById('edit-spot-desc').value = spot.desc;
    document.getElementById('edit-spot-tips').value = spot.tips;
    document.getElementById('edit-image-preview').src = spot.image;
    document.getElementById('edit-image-preview').style.display = 'block';
    document.getElementById('edit-modal').style.display = 'block';

    document.getElementById('edit-spot-image-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            compressImage(file, (compressedData) => {
                document.getElementById('edit-image-preview').src = compressedData;
            });
        }
    }, { once: true });
};

window.saveEditedSpot = function(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('edit-spot-id').value);
    const spot = spotsData.find(s => s.id === id);
    if (!spot) return;

    spot.title = document.getElementById('edit-spot-title').value;
    spot.desc = document.getElementById('edit-spot-desc').value;
    spot.tips = document.getElementById('edit-spot-tips').value;

    const fileInput = document.getElementById('edit-spot-image-file');
    if (fileInput.files[0]) {
        const file = fileInput.files[0];
        compressImage(file, (compressedData) => {
            spot.image = compressedData;
            saveSpots();
        });
    } else {
        saveSpots();
    }
};

function saveSpots() {
    try {
        localStorage.setItem('spots', JSON.stringify(spotsData));
        renderSpots();
        updateAdminSpotList();
        closeEditModal();
    } catch (e) {
        alert("ストレージ容量を超えました。スポットを減らすか、画像サイズを小さくしてください。");
    }
}

window.deleteSpot = function(id) {
    if (confirm("このスポットを削除しますか？")) {
        spotsData = spotsData.filter(s => s.id !== id);
        spotsData.forEach((spot, index) => {
            spot.page = Math.floor(index / spotsPerPage) + 1;
        });
        try {
            localStorage.setItem('spots', JSON.stringify(spotsData));
            renderSpots();
            updateAdminSpotList();
        } catch (e) {
            alert("ストレージ容量のエラーが発生しました。");
        }
    }
};

window.exportSpots = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(spotsData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "spots_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
};

window.importSpots = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            spotsData = JSON.parse(e.target.result);
            nextId = spotsData.length > 0 ? Math.max(...spotsData.map(s => s.id)) + 1 : 1;
            localStorage.setItem('spots', JSON.stringify(spotsData));
            renderSpots();
            updateAdminSpotList();
            alert("スポットがインポートされました。");
        } catch (error) {
            alert("無効なファイルです。JSON形式のスポットデータを選択してください。");
        }
    };
    reader.readAsText(file);
};

// イベントリスナー
document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateTime, 5000);
    updateTime();
    adjustElementsForMobile();

    const tracks = [
        { src: "assets/Flow.mp3", name: "Flow" },
        { src: "assets/Close in the Distance.mp3", name: "Close in the Distance" }
    ];
    setupBGM(tracks);

    let keyBuffer = '';
    document.addEventListener('keydown', (e) => {
        keyBuffer += e.key;
        if (keyBuffer.toLowerCase().includes('admin')) {
            document.getElementById('admin-modal').style.display = 'block';
            updateAdminSpotList();
            keyBuffer = '';
        }
    });

    document.getElementById('spot-image-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            compressImage(file, (compressedData) => {
                document.getElementById('image-preview').src = compressedData;
                document.getElementById('image-preview').style.display = 'block';
            });
        }
    });

    renderSpots();

    document.querySelectorAll('.spot-image').forEach(image => {
        image.addEventListener('click', () => {
            image.classList.toggle('enlarged');
            if (image.classList.contains('enlarged')) {
                image.style.transform = 'scale(1.5)';
                image.style.boxShadow = '0 0 20px rgba(52, 152, 219, 1)';
                image.style.zIndex = '1000';
            } else {
                image.style.transform = 'scale(1.05)';
                image.style.boxShadow = '0 0 15px rgba(52, 152, 219, 0.8)';
                image.style.zIndex = 'auto';
            }
        });
    });
});

window.addEventListener('resize', adjustElementsForMobile);
window.addEventListener('resize', () => {
    document.body.style.zoom = 'reset';
    document.body.style.transform = 'none';
});
window.addEventListener('scroll', () => document.body.style.zoom = 'reset');