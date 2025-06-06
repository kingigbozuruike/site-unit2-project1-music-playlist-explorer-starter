document.addEventListener('DOMContentLoaded', () => {
    const isIndexPage = window.location.href.includes('index.html');
    const isFeaturedPage = window.location.href.includes('featured.html');

    fetchPlaylistData()
    .then(data => {
        const playlists = data.playlists;
        if (isIndexPage) {
        initializeIndexPage(playlists);
        }
        if (isFeaturedPage) {
        initializeFeaturedPage(playlists);
        }
    })
    .catch(error => {
    console.error('Application error:', error);
    });
});


function fetchPlaylistData() {
    return fetch("data/data.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data fetched successfully:', data);
        return data;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
    });
}

function initializeIndexPage(playlists) {
    const playlistNames = document.getElementsByClassName("playlist-title");
    const playlistAuthors = document.getElementsByClassName("playlist-creator");
    const playlistCards = document.getElementsByClassName("playlist-card");
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById("modal-title");
    const modalAuthor = document.getElementById("modal-author");
    const songsContainer = document.getElementById("songs-container");
    const shuffleButton = document.querySelector('.shuffle');

    for (let i = 0; i < playlistNames.length; i++) {
        if (playlists[i]) {
            playlistNames[i].innerText = playlists[i].playlist_name;
            playlistAuthors[i].innerText = playlists[i].playlist_author;
        }
    }

    let currentPlaylistIndex = null;

    for (let i = 0; i < playlistCards.length; i++) {
        playlistCards[i].addEventListener('click', () => {
            currentPlaylistIndex = i;
            console.log('Card clicked:', playlists[i].playlist_name);

            modalOverlay.style.display = 'flex';
            modalTitle.innerText = playlists[i].playlist_name;
            modalAuthor.innerText = playlists[i].playlist_author;

            displaySongs(playlists[i].songs, songsContainer);
        }
    )};

    if (shuffleButton) {
        shuffleButton.addEventListener('click', () => {
        console.log("Shuffle button clicked!");

        if (currentPlaylistIndex !== null) {
            const currentPlaylist = playlists[currentPlaylistIndex];
            displayShuffledSongs(currentPlaylist.songs, songsContainer);
        }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
        });
    }

    initializeLikeButtons();
}

function initializeFeaturedPage(playlists) {
    const featuredName = document.getElementById('featured-name');
    const featuredAuthor = document.getElementById('featured-creator');
    const songContent = document.getElementById('song-list');

    if (!featuredName || !featuredAuthor || !songContent) {
        console.error('Required DOM elements not found for featured page');
        return;
    }

    const min = 0;
    const max = playlists.length - 1;
    const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomPlaylist = playlists[randomIndex];

    featuredName.innerText = randomPlaylist.playlist_name;
    featuredAuthor.innerText = randomPlaylist.playlist_author;

    displaySongs(randomPlaylist.songs, songContent);
}

function displaySongs(songs, container) {
    container.innerHTML = '';

    const songsArray = Object.values(songs);

    songsArray.forEach(song => {
        const songRow = createSongRow(song);
        container.appendChild(songRow);
    });
}

function displayShuffledSongs(songs, container) {
    container.innerHTML = '';

    const songIds = Object.keys(songs);
    const shuffledIds = shuffleArray(songIds);

    shuffledIds.forEach(id => {
        const song = songs[id];
        const songRow = createSongRow(song);
        container.appendChild(songRow);
    });
}

function createSongRow(song) {
    const songRow = document.createElement('div');
    songRow.className = 'song-row';
    songRow.innerHTML = `
        <div class="grid-col-1">
        <div class="image-holder-1">
            <img src="${song.album_art}" alt="${song.song_name} album art">
        </div>
        </div>
        <div class="grid-col-2">
        <h4>${song.song_name}</h4>
        <p>${song.artist}</p>
        <p>${song.album}</p>
        </div>
        <div class="grid-col-3">
        <p>${song.duration}</p>
        </div>
    `;
    return songRow;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function initializeLikeButtons() {
    const likeContainers = document.querySelectorAll('.like-count');

    likeContainers.forEach(container => {
        const heart = container.querySelector('.heart');
        const likeCountElement = container.querySelector('.num');
        let isLiked = false;

        const minLikes = 1;
        const maxLikes = 5000;
        likeCountElement.innerText = Math.floor(Math.random() * (maxLikes - minLikes + 1)) + minLikes;

        container.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering playlist card click
            isLiked = !isLiked;
            heart.classList.toggle('active');

            let likeCount = parseInt(likeCountElement.innerText);

            if (isLiked) {
                likeCount++;
                heart.src = "assets/img/heart_red.png";
            } else {
                likeCount--;
                heart.src = "assets/img/heart.png";
            }
            likeCountElement.innerText = likeCount;
        });
    });
}
