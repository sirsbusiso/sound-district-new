class PodcastService {
  async getEpisodes() {
    try {
      const response = await fetch(`${apiBaseUrl}/podcast`);

      if (!response.ok) {
        throw new Error("Unable to load podcasts.");
      }

      return await response.json();
    } catch (error) {
      console.error("Episodes:", error);
      return [];
    }
  }

  async getEpisode(slug) {
    try {
      const response = await fetch(`${apiBaseUrl}/podcast/${slug}`);

      if (!response.ok) {
        throw new Error("Episode not found.");
      }

      return await response.json();
    } catch (error) {
      console.error("Episode:", error);
      return null;
    }
  }

  async registerPlay(podcastId) {
    try {
      await fetch(`${apiBaseUrl}/podcast/${podcastId}/play`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Register Play:", error);
    }
  }

  async registerDownload(podcastId) {
    try {
      await fetch(`${apiBaseUrl}/podcast/${podcastId}/download`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Register Download:", error);
    }
  }
}

const podcastService = new PodcastService();

let episodes = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadHomePage();
});

async function loadHomePage() {
  episodes = await podcastService.getEpisodes();

  if (!Array.isArray(episodes) || episodes.length === 0) {
    console.warn("No episodes found.");
    return;
  }

  // Give the playlist to the player
  player.setPlaylist(episodes);

  const latestEpisode = episodes[0];

  populateHeroArtwork(latestEpisode);
  populateFeaturedCard(latestEpisode);
  populatePlayerCard(latestEpisode);
  populateHeroStats(episodes);
}

async function playPodcast(podcast) {
  if (!podcast) return;

  await player.play(podcast);

  podcastService.registerPlay(podcast.podcastId);
}

function populateHeroArtwork(podcast) {
  const artworkLink = document.getElementById("heroArtworkLink");
  const artworkImage = document.getElementById("heroArtworkImage");
  const playButton = document.getElementById("heroPlayButton");

  artworkLink.href = `/podcasts/${podcast.slug}/`;

  artworkImage.src = podcast.artworkUrl;
  artworkImage.alt = podcast.title;

  playButton.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    await playPodcast(podcast);
  };
}

function populateFeaturedCard(podcast) {
  const title = document.getElementById("featuredTitle");
  const meta = document.getElementById("featuredMeta");

  title.textContent = podcast.title;

  const hours = Math.floor(podcast.durationSeconds / 3600);
  const minutes = Math.floor((podcast.durationSeconds % 3600) / 60);

  const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  meta.textContent = `Episode #${podcast.episodeNumber} • Deep House • ${duration}`;
}

function populatePlayerCard(podcast) {
  const cover = document.getElementById("playerCover");
  const title = document.getElementById("playerTitle");
  const meta = document.getElementById("playerMeta");
  const playButton = document.getElementById("playerMiniPlay");

  cover.src = podcast.artworkUrl;
  cover.alt = podcast.title;

  title.textContent = podcast.title;

  const hours = Math.floor(podcast.durationSeconds / 3600);
  const minutes = Math.floor((podcast.durationSeconds % 3600) / 60);
  const seconds = podcast.durationSeconds % 60;

  const duration =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  meta.textContent = `Episode #${podcast.episodeNumber} • ${duration}`;

  playButton.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    await playPodcast(podcast);
  };
}

function populateHeroStats(podcasts) {
  const episodesCount = document.getElementById("episodesCount");
  const artistsCount = document.getElementById("artistsCount");

  episodesCount.textContent = `${podcasts.length}+`;

  const artists = new Set();

  podcasts.forEach((podcast) => {
    const match = podcast.title.match(/Mixed by (.+)$/i);

    if (match) {
      artists.add(match[1].trim());
    }
  });

  artistsCount.textContent = `${artists.size}+`;
}
