class Player {
  constructor() {
    this.audio = null;

    this.playlist = [];
    this.currentIndex = -1;
    this.currentPodcast = null;

    // UI
    this.artwork = null;
    this.title = null;
    this.meta = null;

    this.playPauseButton = null;
    this.previousButton = null;
    this.nextButton = null;

    this.progressBar = null;
    this.currentTime = null;
    this.duration = null;

    this.volumeSlider = null;
    this.muteButton = null;
  }

  initialize() {
    this.audio = document.getElementById("audioPlayer");

    this.artwork = document.getElementById("playerArtwork");
    this.title = document.getElementById("playerEpisodeTitle");
    this.meta = document.getElementById("playerEpisodeMeta");

    this.playPauseButton = document.getElementById("playPauseButton");
    this.previousButton = document.getElementById("previousButton");
    this.nextButton = document.getElementById("nextButton");

    this.progressBar = document.getElementById("progressBar");

    this.currentTime = document.getElementById("currentTime");
    this.duration = document.getElementById("duration");

    this.volumeSlider = document.getElementById("volumeSlider");
    this.muteButton = document.getElementById("muteButton");

    if (!this.audio) {
      console.error("Audio element not found.");
      return;
    }

    this.registerEvents();

    console.log("Player Ready");
  }

  registerEvents() {
    this.audio.addEventListener("loadedmetadata", () => {
      this.progressBar.max = Math.floor(this.audio.duration);
      this.progressBar.value = 0;

      this.duration.textContent = this.formatTime(this.audio.duration);
    });

    // 👇 ADD THIS HERE
    this.audio.addEventListener("timeupdate", () => {
      this.updateProgress();
    });

    this.audio.addEventListener("play", () => {
      this.updatePlayButton(true);
    });

    this.audio.addEventListener("pause", () => {
      this.updatePlayButton(false);
    });

    this.audio.addEventListener("ended", () => {
      this.next();
    });

    // Buttons...
    this.playPauseButton.addEventListener("click", () => {
      this.toggle();
    });

    this.previousButton.addEventListener("click", () => {
      this.previous();
    });

    this.nextButton.addEventListener("click", () => {
      this.next();
    });

    this.progressBar.addEventListener("input", () => {
      if (!this.audio.duration) return;

      this.audio.currentTime = Number(this.progressBar.value);
    });

    this.volumeSlider.addEventListener("input", () => {
      this.audio.volume = this.volumeSlider.value / 100;
    });

    this.muteButton.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
    });
  }

  /*=========================================
PLAYLIST
=========================================*/

  setPlaylist(podcasts) {
    this.playlist = podcasts || [];
  }

  /*=========================================
PLAY
=========================================*/

  async play(podcast) {
    if (!podcast || !this.audio) return;

    this.currentPodcast = podcast;

    this.currentIndex = this.playlist.findIndex(
      (x) => x.podcastId === podcast.podcastId,
    );

    // Update UI
    if (this.artwork) {
      this.artwork.src = podcast.artworkUrl;
      this.artwork.alt = podcast.title;
    }

    if (this.title) {
      this.title.textContent = podcast.title;
    }

    if (this.meta) {
      this.meta.textContent = `Episode #${podcast.episodeNumber}`;
    }

    this.audio.src = podcast.audioUrl;
    console.log(this.audio.src);

    this.audio.load();

    try {
      await this.audio.play();
    } catch (error) {
      console.error(error);
    }
  }

  /*=========================================
PLAYBACK
=========================================*/

  pause() {
    this.audio.pause();
  }

  resume() {
    this.audio.play();
  }

  toggle() {
    if (this.audio.paused) this.resume();
    else this.pause();
  }

  stop() {
    this.audio.pause();

    this.audio.currentTime = 0;
  }

  /*=========================================
NEXT / PREVIOUS
=========================================*/

  previous() {
    if (!this.playlist.length) return;

    if (this.currentIndex <= 0) this.currentIndex = this.playlist.length - 1;
    else this.currentIndex--;

    this.play(this.playlist[this.currentIndex]);
  }

  next() {
    debugger;
    if (!this.playlist.length) return;

    if (this.currentIndex >= this.playlist.length - 1) this.currentIndex = 0;
    else this.currentIndex++;

    this.play(this.playlist[this.currentIndex]);
  }

  updateProgress() {
    if (!this.audio || !this.audio.duration) return;

    const current = this.audio.currentTime;
    const duration = this.audio.duration;
    const percent = (current / duration) * 100;

    this.progressBar.max = duration;
    this.progressBar.value = current;

    this.progressBar.style.setProperty("--progress", percent + "%");

    this.currentTime.textContent = this.formatTime(current);
    this.duration.textContent = this.formatTime(duration);
  }
  updatePlayButton(isPlaying) {
    if (!this.playPauseButton) return;

    this.playPauseButton.innerHTML = isPlaying
      ? '<i data-lucide="pause"></i>'
      : '<i data-lucide="play"></i>';

    lucide.createIcons();
  }

  /*=========================================
TIME FORMAT
=========================================*/

  formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  /*=========================================
GETTERS
=========================================*/

  getCurrentTime() {
    return this.audio.currentTime;
  }

  getDuration() {
    return this.audio.duration;
  }

  isPlaying() {
    return !this.audio.paused;
  }
}

let player;

document.addEventListener("DOMContentLoaded", () => {
  player = new Player();

  player.initialize();
});
