// グローバル変数
let isAdmin = localStorage.getItem("isAdmin") === "true";
const spotsPerPage = 5;
let currentPage = 1;
let spotsData = JSON.parse(localStorage.getItem('spots')) || [];
let nextId = spotsData.length > 0 ? Math.max(...spotsData.map(s => s.id)) + 1 : 1;
let galleryData = JSON.parse(localStorage.getItem("galleryItems")) || [];
let galleryNextId = galleryData.length > 0 ? Math.max(...galleryData.map(g => g.id)) + 1 : 1;

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
    if (!spotList) return;
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

    const pageNumber = document.getElementById('page-number');
    if (pageNumber) {
        pageNumber.textContent = currentPage;
        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = currentPage === totalPages;
        document.getElementById('footer-prev').classList.toggle('disabled', currentPage === 1);
        document.getElementById('footer-next').classList.toggle('disabled', currentPage === totalPages);
    }
}

window.changePage = function(delta) {
    const totalPages = Math.ceil(spotsData.length / spotsPerPage) || 1;
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    updateSpots();
};

window.closeAdminModal = function() {
    const modal = document.getElementById('admin-modal') || document.getElementById('admin-mode');
    if (modal) {
        modal.style.display = 'none';
        const preview = document.getElementById('image-preview');
        if (preview) preview.style.display = 'none';
    }
};

window.closeEditModal = function() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('edit-image-preview').style.display = 'none';
    }
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
    if (!adminList) return;
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

// ギャラリー管理
function renderGallery() {
    const gallery = document.getElementById('gallery');
    const slideshow = document.getElementById('slideshow');
    if (!gallery || !slideshow) return;

    gallery.innerHTML = '';
    slideshow.innerHTML = '';

    galleryData.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-id', item.id);
        galleryItem.innerHTML = `
            <img src="${item.src}" alt="${item.caption}">
            <p>${item.caption}</p>
        `;
        gallery.appendChild(galleryItem);

        const slide = document.createElement('img');
        slide.src = item.src;
        slide.alt = item.caption;
        slide.className = 'slide';
        slide.setAttribute('data-id', item.id);
        slideshow.appendChild(slide);
    });

    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        slides[0].classList.add('active');
        let slideIndex = 0;
        setInterval(() => {
            slides[slideIndex].classList.remove('active');
            slideIndex = (slideIndex + 1) % slides.length;
            slides[slideIndex].classList.add('active');
        }, 5000);
    }
}

window.addGalleryItem = function() {
    const fileInput = document.getElementById('image-upload');
    const captionInput = document.getElementById('caption-input');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgSrc = e.target.result;
            const caption = captionInput.value || "新しい冒険";
            const id = galleryNextId++;

            const newItem = { id, src: imgSrc, caption };
            galleryData.push(newItem);
            try {
                localStorage.setItem('galleryItems', JSON.stringify(galleryData));
                renderGallery();
                fileInput.value = '';
                captionInput.value = '';
                document.getElementById('preview-image').style.display = 'none';
            } catch (e) {
                alert("ストレージ容量を超えました。");
                galleryData.pop();
            }
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert("画像を選択してください");
    }
};

// 管理者モードの切り替え
function toggleAdminMode(enable) {
    const adminElements = document.querySelectorAll(".admin-only");
    const exitBtn = document.getElementById("exit-admin");
    adminElements.forEach(el => el.style.display = enable ? "block" : "none");
    if (exitBtn) exitBtn.style.display = enable ? "inline-block" : "none";

    if (document.getElementById('spot-list')) updateAdminSpotList();
    if (document.getElementById('gallery')) renderGallery();
}

// イベントリスナー
document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateTime, 5000);
    updateTime();
    adjustElementsForMobile();

    const pageTracks = {
        'index.html': [{ src: "assets/Flow.mp3", name: "Flow" }],
        'profile-nebelfee.html': [
            { src: "assets/忘却の此方.mp3", name: "忘却の此方" },
            { src: "assets/Scream ～万魔殿パンデモニウム：煉獄編～.mp3", name: "慟哭" }
        ],
        'profile-schattenfee.html': [
            { src: "assets/月下彼岸花 ～蛮神ツクヨミ討滅戦～.mp3", name: "月華彼岸花" },
            { src: "assets/天つ風 ～白虎征魂戦～.mp3", name: "天つ風" }
        ],
        'story.html': [{ src: "assets/Endwalker - Footfalls.mp3", name: "Endwalker" }],
        'gallery.html': [
            { src: "assets/White Stone Black ～万魔殿パンデモニウム：煉獄編～.mp3", name: "White Stone Black" },
            { src: "assets/Flow.mp3", name: "Flow" }
        ],
        'raid.html': [{ src: "assets/Athena the Tireless One.mp3", name: "不屈のアテナ" }],
        'gear.html': [{ src: "assets/Revolutions.mp3", name: "革命の唄" }],
        'diary.html': [
            { src: "assets/Flow.mp3", name: "Flow" },
            { src: "assets/Close in the Distance.mp3", name: "Close in the Distance" }
        ],
        'recruit.html': [{ src: "assets/Dawntrail.mp3", name: "DawnTrail" }],
        'links.html': [{ src: "assets/二人の路.mp3", name: "二つの路" }],
        'spots.html': [
            { src: "assets/Dawntrail.mp3", name: "DawnTrail" },
            { src: "assets/Endwalker - Footfalls.mp3", name: "Endwalker" }
        ]
    };

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    setupBGM(pageTracks[currentPage] || [{ src: "assets/Flow.mp3", name: "Flow" }]);

    toggleAdminMode(isAdmin);

    let keyBuffer = '';
    let adminTrigger = false;
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            adminTrigger = true;
            keyBuffer = '';
            setTimeout(() => adminTrigger = false, 5000); // 5秒以内にnebelfeeを入力
        }
        if (adminTrigger) {
            keyBuffer += e.key.toLowerCase();
            if (keyBuffer === 'nebelfee' && !isAdmin) {
                isAdmin = true;
                localStorage.setItem("isAdmin", "true");
                toggleAdminMode(true);
                adminTrigger = false;
            }
        }
    });

    document.getElementById("exit-admin").addEventListener("click", () => {
        isAdmin = false;
        localStorage.setItem("isAdmin", "false");
        toggleAdminMode(false);
    });

    if (document.getElementById('spot-image-file')) {
        document.getElementById('spot-image-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                compressImage(file, (compressedData) => {
                    document.getElementById('image-preview').src = compressedData;
                    document.getElementById('image-preview').style.display = 'block';
                });
            }
        });
    }

    if (document.getElementById('image-upload')) {
        document.getElementById('image-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('preview-image').src = e.target.result;
                    document.getElementById('preview-image').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    renderSpots();
    renderGallery();

    document.querySelectorAll('.spot-image').forEach(image => {
        image.addEventListener('click', () => {
            image.classList.toggle('enlarged');
            image.style.transform = image.classList.contains('enlarged') ? 'scale(1.5)' : 'scale(1)';
            image.style.boxShadow = image.classList.contains('enlarged') ? '0 0 20px rgba(52, 152, 219, 1)' : '0 0 15px rgba(52, 152, 219, 0.8)';
            image.style.zIndex = image.classList.contains('enlarged') ? '1000' : 'auto';
        });
    });
});

window.addEventListener('resize', adjustElementsForMobile);
window.addEventListener('resize', () => {
    document.body.style.zoom = 'reset';
    document.body.style.transform = 'none';
});
window.addEventListener('scroll', () => document.body.style.zoom = 'reset');