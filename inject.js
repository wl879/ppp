let SPEED_RATE = null;
let _videos = new WeakMap();
let _playbackRate = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate");

function setSpeed(video, info, speed) {
    info.speed = speed;
    if (video.readyState !== speed) {
        _playbackRate.set.call(video, speed);
    }
    if (!video.paused) {
        chrome.runtime.sendMessage({ type: 'UPDATE_SPEED', speed: speed });
    }
}

function checkSpeed(event) {
    let video = event.target;
    let info = _videos.get(video);
    if (info && !(info.changed > 20) && info.speed > 1 && info.speed !== video.playbackRate) {
        // console.info('📽️ checkSpeed:', video.playbackRate, '=>', info.speed);
        _playbackRate.set.call(video, info.speed);
        info.changed = (info.changed || 0) + 1;
    }
}

function checkWaiting(event) {
    // console.info('📽️ checkWaiting');
    let video = event.target;
    let info = _videos.get(video);
    if (info) {
        if (video.src === video.src) {
            info.waited = (info.waited || 0) + 1;
        }
    }
}

function useSpeed(video, info, speed) {
    if (video.readyState < 1) {
        setTimeout(() => {useSpeed(video, speed)}, 500);
        return;
    }
    if (info.src !== video.src) {
        info.src = video.src;
        info.waited = 0;
        info.changed = 0;
        info.duration = video.duration;
    }
    if (speed == 1 || !video.duration || video.duration === Infinity || isNaN(video.duration)) {
        setSpeed(video, info, 1);
        return;
    }
    if (info.waited > 2 && video.duration > 60 * 60 * 4) {
        setSpeed(video, info, 1);
        return;
    }
    if (speed > 0 ) {
        setSpeed(video, info, speed);
    }
}

function playSpeed(video) {
    let info = _videos.get(video);
    if (!info) {
        info = {};
        _videos.set(video, info);
        video.addEventListener("ratechange", checkSpeed);
        video.addEventListener("waiting", checkWaiting);
    }
    if (SPEED_RATE > 0) {
        useSpeed(video, info, SPEED_RATE)
    } else {
        chrome.storage.local.get('speed', (data) => {
            SPEED_RATE = (data && data.speed > 0) ? data.speed : 1;
            useSpeed(video, info, SPEED_RATE)
        });
    }
}

window.addEventListener("playing", (e)=>{
    playSpeed(e.target);
}, {capture: true, passive: true})

// 监听速度变化消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SET_SPEED' && request.speed > 0) {
        SPEED_RATE = request.speed
        // console.info('📽️ update speed:', SPEED_RATE);
        document.querySelectorAll('video').forEach(video => {
            playSpeed(video);
        });
    }
});


