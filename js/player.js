document.addEventListener("DOMContentLoaded", function () {
    iniciarApp();
});

function iniciarApp() {
    videoPlayer();
    setupProgressBar();
    setupVolumeControl();
    setupFastForwardRewind();
    setUpControlBar();
    setUpSettingsControl();
    sepeedVideoManagment();
}

function videoPlayer() {
    const video = document.getElementById('myVideo');
    const playPauseButton = document.getElementById('play-pause-button');
    const playPauseIcon = document.getElementById('play-pause');

    playPauseButton.addEventListener('click', function () {
        if (video.paused) {
            video.play();
            playPauseButton.style.display = 'none';
        } else {
            video.pause();
        }
    });


    video.addEventListener('ended', function () {
        playPauseButton.style.display = 'block';
        playPauseButton.className = 'fas fa-play';
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            playPauseButton.style.display = 'none';
            playPauseIcon.className = 'fas fa-pause';

            video.play();
        } else {
            playPauseButton.style.display = 'block';
            playPauseButton.className = 'fas fa-play';
            playPauseIcon.className = 'fas fa-play';

            video.pause();
        }
    });
    video.addEventListener('play', function () {
        playPauseButton.style.display = 'none';
        playPauseIcon.className = 'fas fa-pause';


    });
    playPauseIcon.addEventListener('click', function () {
        if (video.paused) {
            playPauseIcon.className = 'fas fa-pause';
            video.play();
        } else {
            playPauseIcon.className = 'fas fa-play';
            video.pause();
        }

    })
}
function formatTime(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = Math.floor(timeInSeconds % 60);
    // Añadir un 0 adelante si los segundos son menores a 10
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ':' + seconds; // Formato mm:ss
}
function setupProgressBar() {
    const video = document.getElementById('myVideo');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const totalTime = document.querySelector('.totalTime');
    const currentTime = document.querySelector('.current_time');
    const progressBar = document.getElementById('progress-bar');
    video.addEventListener('loadedmetadata', () => totalTime.textContent = formatTime(video.duration))
    video.addEventListener('timeupdate', function () {
        let progress = (video.currentTime / video.duration) * 100;
        progressBarFill.style.width = progress + '%';
        currentTime.textContent = formatTime(video.currentTime);
    });

    progressBar.addEventListener('click', function (event) {
        var rect = progressBar.getBoundingClientRect(); // Obtiene las coordenadas del elemento
        var posX = event.clientX - rect.left; // Calcula la posición X del clic dentro del elemento
        var totalWidth = rect.width; // Usa el ancho del rectángulo en lugar de clientWidth
        var progress = (posX / totalWidth) * video.duration;
        video.currentTime = progress;
    });
}

function setUpControlBar() {
    const video = document.getElementById('myVideo');
    const divFather = document.getElementById('custom-controls');
    const divControl = document.querySelector('.controls-container');
    let hideTimer;

    divFather.addEventListener('mouseover', function () {
        clearTimeout(hideTimer);
        divControl.classList.remove('hidden');

    });

    divFather.addEventListener('mouseout', function () {
        if (!video.paused) {
            hideTimer = setTimeout(function () {
                divControl.classList.add('hidden');
            }, 1000);
        }

    });
}

function setupVolumeControl() {
    var video = document.getElementById('myVideo');
    var volumeSlider = document.getElementById('volume-slider');
    var volumeIcon = document.getElementById('volume-icon');

    video.volume = 0.5;
    volumeSlider.value = 0.5;
    updateVolumeIcon(0.5, volumeIcon);
    updateBarVolume(0.5, volumeSlider);

    volumeSlider.addEventListener('input', function () {
        const volume = volumeSlider.value;
        video.volume = volume;
        updateVolumeIcon(volume, volumeIcon);
        updateBarVolume(volume, volumeSlider);
    });
    volumeIcon.addEventListener('click', function () {
        volumeSlider.value = 0;
        video.volume = 0;
        updateVolumeIcon(0, volumeIcon);
        updateBarVolume(0, volumeSlider);
    })
}

function updateVolumeIcon(volume, volumeIcon) {

    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume <= 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    }
    else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

function updateBarVolume(volume, volumeSlider) {
    const color = volume == 0 ? '#aaa' : `rgb(${255 * (1 - volume)}, ${255 * volume}, 0)`;
    volumeSlider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${volume * 100}%, #fff ${volume * 100}%, #fff 100%)`;
}

function setupFastForwardRewind() {
    const video = document.getElementById('myVideo');
    const forwardButton = document.getElementById('forward-button');
    const rewindButton = document.getElementById('rewind-button');

    forwardButton.addEventListener('click', () => video.currentTime += 5);
    rewindButton.addEventListener('click', () => video.currentTime -= 5);
}
function isOpenSelectorPopover() {
    return Array.from(document.querySelectorAll('.popover_selector_container')).some(container => {
        return !container.classList.contains('hidden');
    });
}

function setUpSettingsControl() {
    const settingsIcon = document.getElementById('setting_icon');
    const popContainer = document.querySelector('.popover_container');
    const popOverOptions = document.querySelectorAll('.popover_options');
    const arrowsLeft = document.querySelectorAll('.fa-arrow-left');
    settingsIcon.addEventListener('click', function () {

        if (popContainer.classList.contains('hidden') && isOpenSelectorPopover()) {
            document.querySelectorAll('.popover_selector_container').forEach(container => {
                container.classList.add('hidden');
            });
        }
        else if (popContainer.classList.contains('hidden')) {
            popContainer.classList.remove('hidden');

        }
        else {
            popContainer.classList.add('hidden');
        }
    })
    popOverOptions.forEach(option => {
        option.addEventListener('click', function () {
            popContainer.classList.add('hidden');
            let containerSlector = document.getElementById(this.getAttribute('data-target'))
            containerSlector.classList.remove('hidden');
        })
    });


    arrowsLeft.forEach(arrowLeft => {
        arrowLeft.addEventListener('click', function () {
            let containerSlector = document.getElementById(this.getAttribute('data-target'))
            containerSlector.classList.add('hidden');
            popContainer.classList.remove('hidden');


        })
    })
}

function sepeedVideoManagment() {
    const buttons_speed = document.querySelectorAll('.button-speed')
    const video = document.getElementById('myVideo');
    buttons_speed.forEach(button => {
        button.addEventListener('click', function () {
            video.playbackRate = parseFloat(button.value);
        })
    })
}