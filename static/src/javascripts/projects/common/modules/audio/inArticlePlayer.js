// @flow

import fastdom from 'fastdom';
import pauseBtn from 'svgs/journalism/in-article-audio-player/btn-pause.svg';
import playBtn from 'svgs/journalism/in-article-audio-player/btn-play.svg';
import { sendToOphan, formatTime } from './utils';
import { monitorPercentPlayed, playerObserved } from './inArticleDataEvents';

// STYLING FUNCTIONS
const setPlayButton = el => {
    el.innerHTML = `<span>${playBtn.markup}</span>`;
};

const setPauseButton = el => {
    el.innerHTML = `<span>${pauseBtn.markup}</span>`;
};

// design hack to give immediate feedback on the progress bar for a play event
const showStarterBlockOnFirstPlay = () => {
    const scrubberBar: ?HTMLElement = document.querySelector(
        '.inline-audio_content_progress-bar'
    );
    if (scrubberBar) scrubberBar.classList.add('started');
};

// PLAYER ACTION FUNCTIONS

const updateTime = (el: HTMLElement, player, progressBar: HTMLElement) => {
    let prevTime = 0;
    player.addEventListener('timeupdate', () => {
        el.textContent = formatTime(Math.round(player.currentTime));
        const percentPlayed = (player.currentTime / player.duration) * 100;
        // throttle updates to once a second
        if (Math.round(player.currentTime) !== Math.round(prevTime)) {
            fastdom.write(() => {
                progressBar.style.width = `${percentPlayed}%`;
            });
            prevTime = player.currentTime;
        }
    });
};

const activateAudioControls = (el, player, id) => {
    el.addEventListener('click', () => {
        if (player.paused) {
            sendToOphan(id, 'play');
            player.play();
            setPauseButton(el);
            showStarterBlockOnFirstPlay();
        } else {
            player.pause();
            setPlayButton(el);
        }
    });
};

const activateScrubber = (el, player) => {
    const w = el.offsetWidth;
    const d = player.duration;

    el.addEventListener('click', (e: MouseEvent | Touch) => {
        const leftOffset = el.getBoundingClientRect().left;
        const clickX = e.clientX - leftOffset;
        const ratio = clickX / w;
        player.currentTime = Math.round(ratio * d);
    });
};

const setDuration = (el, player) => {
    const duration = player.duration;
    el.textContent = formatTime(Math.round(duration));

    player.addEventListener('loadedstate', function metaDataReady(e) {
        if (player.readyState >= 1) {
            el.textContent = formatTime(Math.round(duration));
            player.removeEventListener(e.type, metaDataReady);
        }
    });
};

// INITIALISER

const init = () => {
    const player = document.querySelector('audio.inline-audio-player-element');

    if (player && !(player instanceof HTMLMediaElement)) return;

    const container: ?HTMLElement = document.querySelector(
        '.inline-audio_container'
    );

    const mediaId: ?string =
        player && player.hasAttribute('data-media-id')
            ? player.getAttribute('data-media-id')
            : '';
    const buttonDiv: ?HTMLElement = document.querySelector(
        '.inline-audio_button'
    );
    const scrubberBar: ?HTMLElement = document.querySelector(
        '.inline-audio_content_progress-bar'
    );
    const progressBar: ?HTMLElement = document.querySelector(
        '.inline-audio_content_progress-bar .played'
    );
    const timePlayedSpan: ?HTMLElement = document.querySelector(
        '#inline-audio_time-played'
    );
    const durationSpan: ?HTMLElement = document.querySelector(
        '#inline-audio_duration'
    );

    if (
        player &&
        mediaId &&
        buttonDiv &&
        scrubberBar &&
        progressBar &&
        timePlayedSpan &&
        durationSpan
    ) {
        playerObserved(container, mediaId);
        setDuration(durationSpan, player);
        activateAudioControls(buttonDiv, player, mediaId);
        updateTime(timePlayedSpan, player, progressBar);
        activateScrubber(scrubberBar, player);

        monitorPercentPlayed(player, 25, mediaId);
        monitorPercentPlayed(player, 50, mediaId);
        monitorPercentPlayed(player, 75, mediaId);
        monitorPercentPlayed(player, 99, mediaId);
    }
};

export { init };
