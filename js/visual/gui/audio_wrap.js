// Rant time:
// Tt turns out, arrow functions are actually *not* equivalent to the pre-ES6 anonymous function syntax.
// Specifically, the `this` keyword is lexically scoped.
// That means it takes its context from the surrounding code, not the arrow function itself.
// This is one of the stupidest fucking nuances I've dealt with in a while tbh.
// I mean, is it really that unreasonable to assume the semantics should be the same?
// Shit like this is the reason JS gets such a bad rap, and rightfully so.
let AudioWrap = new function() {

    let body;
    let audio_player;
    let play_button;
    let progressBar;
    let time;
    let mute_button;
    let volume_bar;
    let player;

    let lastVolume;
    
    this.getTime = function(t) {
        let m = ~~(t / 60), s = ~~(t % 60);
        return (m < 10 ? ("0" + m) : m) + ":" + (s < 10 ? ("0" + s) : s);
    }

    this.setUp = function() {
        body = $("body");
        audio_player = $("#audio-player");
        play_button = $("#play");
        progressBar = document.getElementById("progressbar");
        time = document.getElementById("time");
        mute_button = $("#mute");
        volume_bar = $("#volume");
        player = document.getElementById("audio");

        this.lastVolume = Util.getCookie("lastVol");
        if (this.lastVolume !== undefined) {
            this.setVolume(0, true);
            mute_button.toggleClass("fa-volume-off", true);
        } else {
            let vol = Util.getCookie("volume");
            if (vol !== undefined) {
                this.setVolume(vol);
            }
        }

        play_button.click(this.togglePlaying);

        IoHandler.addDragListener($("#progressbar"), val => {
            player.currentTime = val * player.duration;
            if (!this.isPlaying()) {
                this.updateProgress();
            }
        });

        IoHandler.addDragListener(volume_bar, val => {
            let res = this.setVolume(val);
            Util.setCookie("volume", res);
        });
 
        mute_button.click(function() {
            AudioWrap.setVolume(AudioWrap.lastVolume !== undefined ? AudioWrap.lastVolume : 0);
        });

        Callbacks.addCallback(this.updateProgress);    
    }

    this.updateProgress = function() {
        let currentTime = player.currentTime;
        let duration = player.duration;
        let progression = (currentTime + .25) / duration * 100;
        progressBar.value = progression;
        time.innerHTML = AudioWrap.getTime(player.currentTime);
    }

    this.togglePlaying = function() {
        player[AudioWrap.isPlaying() ? "play" : "pause"]();
        play_button.toggleClass("fa-play", player.paused);
        play_button.toggleClass("fa-pause", !player.paused);
    }

    this.setVolume = function(val, skipCookies = false) {
        let res = Util.clamp(val, 0, 1);
        volume_bar.val(res * 100);
        let prev = Nodes.getVolume();
        Nodes.setVolume(res);
        mute_button.toggleClass("fa-volume-up", res >= 0.5);
        mute_button.toggleClass("fa-volume-down", res > 0 && res < 0.5);
        mute_button.toggleClass("fa-volume-off", res == 0);
        if (res == 0) {
            if (!skipCookies) {
                this.lastVolume = prev;
                Util.setCookie("lastVol", this.lastVolume);
            }
        } else {
            this.lastVolume = undefined;
            Util.deleteCookie("lastVol");
        }
        return res;
    }

    this.isPlaying = function() {
        return player !== undefined ? player.paused : false;
    }
    
}