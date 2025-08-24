// Minimal Music Player — Vanilla JS
document.addEventListener("DOMContentLoaded", () => {
  // ===== Playlist (replace with your own files) =====
  // ===== Playlist (your 5 real files) =====
  const playlist = [
    {
      title: "Emotional Ambient Piece",
      artist: "Pixabay",
      src: "assets/audio/emotional-ambient-piece-with-slow-cinematic-textures-370144.mp3",
      cover: "assets/images/alien-6782778.jpg",
    },
    {
      title: "Future Design",
      artist: "Pixabay",
      src: "assets/audio/future-design-344320.mp3",
      cover: "assets/images/poster-2899102.jpg",
    },
    {
      title: "Gardens Stylish Chill",
      artist: "Pixabay",
      src: "assets/audio/gardens-stylish-chill-303261.mp3",
      cover: "assets/images/mimosa-7910067.jpg",
    },
    {
      title: "Lost in Thoughts (Piano)",
      artist: "Pixabay",
      src: "assets/audio/lost-in-thoughts-short-piano-piece-180230.mp3",
      cover: "assets/images/love-6578476.jpg",
    },
    {
      title: "Retro Lounge",
      artist: "Pixabay",
      src: "assets/audio/retro-lounge-389644.mp3",
      cover: "assets/images/water-7456116.jpg",
    },
  ];

  // ===== Elements =====
  const audio = document.getElementById("audio");
  const cover = document.getElementById("cover");
  const titleEl = document.getElementById("title");
  const artistEl = document.getElementById("artist");
  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const repeatBtn = document.getElementById("repeat");
  const progress = document.getElementById("progress");
  const currentTimeEl = document.getElementById("current");
  const durationEl = document.getElementById("duration");
  const muteBtn = document.getElementById("mute");
  const volIcon = document.getElementById("volIcon");
  const volume = document.getElementById("volume");

  // ===== State =====
  let index = 0;
  let isPlaying = false;
  let isRepeat = false;
  let wasMutedByUser = false;

  // ===== Helpers =====
  function formatTime(sec) {
    if (isNaN(sec) || sec === Infinity) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function updatePlayIcon() {
    playBtn.innerHTML = `<i class="fa-solid ${
      isPlaying ? "fa-pause" : "fa-play"
    }"></i>`;
  }

  function updateVolumeIcon(v) {
    if (audio.muted || v === 0) {
      volIcon.className = "fa-solid fa-volume-xmark";
    } else if (v < 0.5) {
      volIcon.className = "fa-solid fa-volume-low";
    } else {
      volIcon.className = "fa-solid fa-volume-high";
    }
  }

  function loadTrack(i) {
    const track = playlist[i];
    if (!track) return;
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    cover.src = track.cover;
    cover.alt = `${track.title} cover`;
    audio.src = track.src;
    audio.load();
    // Reset UI
    progress.value = 0;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
  }

  async function play() {
    try {
      await audio.play();
      isPlaying = true;
      updatePlayIcon();
    } catch (err) {
      // Autoplay might be blocked until user gesture; ignore
      console.warn("Playback failed:", err);
    }
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    updatePlayIcon();
  }

  function togglePlay() {
    isPlaying ? pause() : play();
  }

  function next() {
    index = (index + 1) % playlist.length;
    loadTrack(index);
    play();
  }

  function prev() {
    index = (index - 1 + playlist.length) % playlist.length;
    loadTrack(index);
    play();
  }

  // ===== Events =====
  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.style.opacity = isRepeat ? "1" : "0.6";
  });

  // Time & Progress
  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    progress.value = pct;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  progress.addEventListener("input", () => {
    const t = (progress.value / 100) * (audio.duration || 0);
    audio.currentTime = t;
  });

  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      play();
    } else {
      next();
    }
  });

  // Volume & Mute
  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    audio.muted = audio.volume === 0;
    updateVolumeIcon(audio.volume);
  });

  muteBtn.addEventListener("click", () => {
    if (audio.muted || audio.volume === 0) {
      // Unmute
      audio.muted = false;
      volume.value = wasMutedByUser ? volume.value || 0.5 : volume.value || 0.5;
      audio.volume = Number(volume.value);
      updateVolumeIcon(audio.volume);
      wasMutedByUser = false;
    } else {
      // Mute
      wasMutedByUser = true;
      audio.muted = true;
      updateVolumeIcon(0);
    }
  });

  // Keyboard shortcuts
  // Space: play/pause, Left/Right: -/+5s, Up/Down: volume
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
    if (e.code === "ArrowRight")
      audio.currentTime = Math.min(
        (audio.currentTime || 0) + 5,
        audio.duration || 0
      );
    if (e.code === "ArrowLeft")
      audio.currentTime = Math.max((audio.currentTime || 0) - 5, 0);
    if (e.code === "ArrowUp") {
      const v = Math.min((audio.volume || 0) + 0.05, 1);
      audio.volume = v;
      volume.value = v;
      audio.muted = v === 0;
      updateVolumeIcon(v);
    }
    if (e.code === "ArrowDown") {
      const v = Math.max((audio.volume || 0) - 0.05, 0);
      audio.volume = v;
      volume.value = v;
      audio.muted = v === 0;
      updateVolumeIcon(v);
    }
  });

  // ===== Init =====
  loadTrack(index);
  updatePlayIcon();
  updateVolumeIcon(audio.volume);
});

audio.addEventListener("error", () => {
  console.error("Audio failed to load:", audio.currentSrc || audio.src);
});
cover.addEventListener("error", () => {
  console.error("Image failed to load:", cover.currentSrc || cover.src);
});
