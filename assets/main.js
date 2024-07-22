const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8-FullStack';
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const preBtn = $('.btn-prev');
const rdBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đành thôi',
            singer: 'Mr.Hung',
            path: './assets/music/DANH-THOI.mp3',
            image: './assets/img/vanlove.jpg'
        },
        {
            name: 'Chúng ta của tương lai',
            singer: 'Mr.Hung',
            path: './assets/music/CHUNG-TA-CUA-TUONG-LAI.mp3',
            image: './assets/img/chung-ta-cua-tuong-lai.jpg'
        },
        {
            name: 'Đừng làm trái tim anh đau',
            singer: 'Mr.Hung',
            path: './assets/music/DUNG-LAM-TRAI-TIM-ANH-DAU.mp3',
            image: './assets/img/dung-lam-trai-tim-anh-dau.jpg'
        },
        {
            name: 'Lao tâm khổ tứ',
            singer: 'Thanh Hưng',
            path: './assets/music/LAO-TAM-KHO-TU.mp3',
            image: './assets/img/lao-tam-kho-tu.jpg'
        },
        {
            name: 'Có hạt sương trên mi mắt em',
            singer: 'NHA X Karic',
            path: './assets/music/CO-HAT-SUONG-TREN-MI-MAT-EM.mp3',
            image: './assets/img/co-hat-suong-tren-mat-em.jpg'
        },
        {
            name: 'Em chưa bao giờ giấu anh điều gì',
            singer: 'Đạt G',
            path: './assets/music/EM-CHUA-BAO-GIO-GIAU-ANH-DIEU-GI.mp3',
            image: './assets/img/em-chua-bao-gio-giau-anh-dieu-gi.jpg'
        },
        {
            name: 'Còn gì đau đớn hơn đã từng',
            singer: 'Trung quân',
            path: './assets/music/CON-GI-DAU-HON-CHU-DA-TUNG.mp3',
            image: './assets/img/con-gi-dau-hon-da-tung.jpg'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function () {
        const _this = this;

        // Handle CD rotation
        const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Handle CD zoom in/out
        const cd = $('.cd');
        const cdWidth = cd.offsetWidth;
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
        };

        // Handle play button
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Handle song play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        };

        // Handle song pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        };

        // Update progress bar
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        };

        // Seek song
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        };

        // Next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Previous song
        preBtn.onclick = function () {
            _this.prevSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Toggle random
        rdBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            rdBtn.classList.toggle('active', _this.isRandom);
        };

        // Toggle repeat
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };

        // Handle song end
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Handle playlist click
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode) {
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                audio.play();
                _this.render();
            }
        };
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            const activeElement = $('.song.active');
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 300);
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom || false;
        this.isRepeat = this.config.isRepeat || false;
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        this.loadConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
        rdBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
};

app.start();
