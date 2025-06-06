const addButton = document.querySelector('.add-button');
const addOverlay = document.querySelector('.add-overlay');

let globalPlaylistsData = null;

document.addEventListener('DOMContentLoaded', () => {
    const basePath = '/music-playlist-creator/'
    const relativePath = window.location.pathname.startsWith(basePath)
        ? window.location.pathname.slice(basePath.length)
        : window.location.pathname;
    const isIndexPage = relativePath === '' || relativePath === 'index.html';
    const isFeaturedPage = relativePath === 'featured.html';
    fetchPlaylistData()
    .then(data => {
        globalPlaylistsData = data;
        const playlists = data.playlists;
        if (isIndexPage) {
        initializeIndexPage(playlists);
        fetchPlaylistData()
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

const playlistLikeCounts = {};

function getLikeCount(playlistId) {
    if (!playlistLikeCounts[playlistId]) {
        playlistLikeCounts[playlistId] = Math.floor(Math.random() * 1000);
    }
    return playlistLikeCounts[playlistId];
}

function filterPlaylists(playlists, query) {
    if (!query) return playlists;

    query = query.toLowerCase();
    return playlists.filter(playlist =>
        playlist.playlist_name.toLowerCase().includes(query) ||
        playlist.playlist_author.toLowerCase().includes(query)
    );
}

function sortPlaylists(playlists, sortOption) {
    const sortedPlaylists = [...playlists];

    switch (sortOption) {
        case 'name-asc':
            sortedPlaylists.sort((a, b) => a.playlist_name.localeCompare(b.playlist_name));
            break;
        case 'name-desc':
            sortedPlaylists.sort((a, b) => b.playlist_name.localeCompare(a.playlist_name));
            break;
        case 'songs-asc':
            sortedPlaylists.sort((a, b) => Object.keys(a.songs).length - Object.keys(b.songs).length);
            break;
        case 'songs-desc':
            sortedPlaylists.sort((a, b) => Object.keys(b.songs).length - Object.keys(a.songs).length);
            break;
        default:
            // Default sorting (no change)
            break;
    }

    return sortedPlaylists;
}

function updatePlaylistsUI(playlists) {
    const playlistContainer = document.querySelector('.playlistcards');

    while (playlistContainer.firstChild) {
        playlistContainer.removeChild(playlistContainer.firstChild);
    }

    playlists.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.dataset.playlistId = playlist.playlistID;

        const likeCount = getLikeCount(playlist.playlistID);

        card.innerHTML = `
            <div class="playlist-image">
                <img src="${playlist.playlist_art}" alt="">
            </div>
            <div class="playlist-info">
                <h2 class="playlist-title">${playlist.playlist_name}</h2>
                <p class="playlist-creator">${playlist.playlist_author}</p>
                <div class="like-count">
                    <img src="assets/img/heart.png" alt="" class="heart">
                    <p class="num">${likeCount}</p>
                </div>
            </div>
            <button class="delete-playlist-button" title="Delete Playlist">×</button>
            <button class="edit-playlist-button" title="Edit Playlist">✎</button>
        `;

        card.addEventListener('click', () => {
            const modalOverlay = document.querySelector('.modal-overlay');
            const modalTitle = document.getElementById("modal-title");
            const modalAuthor = document.getElementById("modal-author");
            const songsContainer = document.getElementById("songs-container");

            modalOverlay.style.display = 'flex';
            modalTitle.innerText = playlist.playlist_name;
            modalAuthor.innerText = playlist.playlist_author;

            displaySongs(playlist.songs, songsContainer);
        });

        const heart = card.querySelector('.heart');
        const likeCountElement = card.querySelector('.num');
        let isLiked = false;

        heart.addEventListener('mouseenter', () => {
            heart.src = "assets/img/heart_red.png";
        });

        heart.addEventListener('mouseleave', () => {
            if (!isLiked) {
                heart.src = "assets/img/heart.png";
            }
        });

        card.querySelector('.like-count').addEventListener('click', (event) => {
            event.stopPropagation();
            isLiked = !isLiked;

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

        const deleteButton = card.querySelector('.delete-playlist-button');
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();

            if (confirm(`Are you sure you want to delete "${playlist.playlist_name}"?`)) {
                card.remove();

                if (globalPlaylistsData) {
                    const index = globalPlaylistsData.playlists.findIndex(p => p.playlistID === playlist.playlistID);
                    if (index !== -1) {
                        globalPlaylistsData.playlists.splice(index, 1);
                    }
                }
            }
        });

        const editButton = card.querySelector('.edit-playlist-button');
        editButton.addEventListener('click', (event) => {
            event.stopPropagation();
            openEditPlaylistOverlay(playlist);
        });

        playlistContainer.appendChild(card);
    });
}

function initializeIndexPage(playlists) {
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeButton = document.querySelector('.modal-overlay .close-button');
    const shuffleButton = document.querySelector('.shuffle');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sortSelect = document.getElementById('sort-select');
    const songsContainer = document.getElementById("songs-container");

    updatePlaylistsUI(playlists);

    let currentSearchQuery = '';

    searchInput.addEventListener('input', () => {
        currentSearchQuery = searchInput.value.trim();
        const filteredPlaylists = filterPlaylists(playlists, currentSearchQuery);
        const sortOption = sortSelect.value;
        const sortedPlaylists = sortPlaylists(filteredPlaylists, sortOption);
        updatePlaylistsUI(sortedPlaylists);
    });

    searchButton.addEventListener('click', () => {
        currentSearchQuery = searchInput.value.trim();
        const filteredPlaylists = filterPlaylists(playlists, currentSearchQuery);
        const sortOption = sortSelect.value;
        const sortedPlaylists = sortPlaylists(filteredPlaylists, sortOption);
        updatePlaylistsUI(sortedPlaylists);
    });

    sortSelect.addEventListener('change', () => {
        const sortOption = sortSelect.value;
        const filteredPlaylists = filterPlaylists(playlists, currentSearchQuery);
        const sortedPlaylists = sortPlaylists(filteredPlaylists, sortOption);
        updatePlaylistsUI(sortedPlaylists);
    });

    let currentPlaylist = null;

    if (shuffleButton) {
        shuffleButton.addEventListener('click', () => {
            console.log("Shuffle button clicked!");

            if (currentPlaylist) {
                displayShuffledSongs(currentPlaylist.songs, songsContainer);
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
    }

    document.addEventListener('click', (event) => {
        const playlistCard = event.target.closest('.playlist-card');

        if (playlistCard) {
            if (
                event.target.classList.contains('delete-playlist-button') ||
                event.target.classList.contains('edit-playlist-button') ||
                event.target.closest('.like-count')
            ) {
                return;
            }

            const playlistId = playlistCard.dataset.playlistId;
            const playlist = playlists.find(p => p.playlistID === playlistId);

            if (playlist) {
                currentPlaylist = playlist;

                modalOverlay.style.display = 'flex';
                document.getElementById("modal-title").innerText = playlist.playlist_name;
                document.getElementById("modal-author").innerText = playlist.playlist_author;

                displaySongs(playlist.songs, songsContainer);
            }
        }
    });
}

function initializeFeaturedPage(playlists) {
    const featuredName = document.getElementById('featured-name');
    const featuredAuthor = document.getElementById('featured-creator');
    const featuredImage = document.getElementById('image');
    const songContent = document.getElementById('song-list');

    if (!featuredName || !featuredAuthor || !songContent || !featuredImage) {
        console.error('Required DOM elements not found for featured page');
        return;
    }

    const min = 0;
    const max = playlists.length - 1;
    const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomPlaylist = playlists[randomIndex];

    featuredName.innerText = randomPlaylist.playlist_name;
    featuredAuthor.innerText = randomPlaylist.playlist_author;
    featuredImage.src = randomPlaylist.playlist_art;

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
            event.stopPropagation();
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
if (addButton) {
    addButton.addEventListener('click', () => {
        console.log("Add button clicked!");
        addOverlay.style.display = 'flex';
    });
}

const addOverlayCloseButton = document.querySelector('.add-overlay .close-button');
if (addOverlayCloseButton) {
    addOverlayCloseButton.addEventListener('click', () => {
        addOverlay.style.display = 'none';
    });
}

document.getElementById('add-song-button').addEventListener('click', function() {
    const songCount = document.querySelectorAll('.song-entry').length + 1;
    const songEntry = document.createElement('div');
    songEntry.classList.add('song-entry');
    songEntry.innerHTML = `
        <div class="form-group">
            <label for="song-title-${songCount}">Song Title:</label>
            <input type="text" id="song-title-${songCount}" name="song-title-${songCount}" required>
        </div>
        <div class="form-group">
            <label for="song-artist-${songCount}">Artist:</label>
            <input type="text" id="song-artist-${songCount}" name="song-artist-${songCount}" required>
        </div>
        <div class="form-group">
            <label for="song-album-${songCount}">Album:</label>
            <input type="text" id="song-album-${songCount}" name="song-album-${songCount}" required>
        </div>
        <div class="form-group">
            <label for="song-duration-${songCount}">Duration:</label>
            <input type="text" id="song-duration-${songCount}" name="song-duration-${songCount}" required>
        </div>
        <button type="button" class="delete-song-button">Delete Song</button>
    `;
    document.getElementById('songs-section').appendChild(songEntry);

    const deleteButton = songEntry.querySelector('.delete-song-button');
    deleteButton.addEventListener('click', function() {
        songEntry.remove();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const firstSongEntry = document.querySelector('.song-entry');
    if (firstSongEntry) {
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-song-button';
        deleteButton.textContent = 'Delete Song';
        deleteButton.addEventListener('click', function() {
            if (document.querySelectorAll('.song-entry').length > 1) {
                firstSongEntry.remove();
            } else {
                alert('You must have at least one song in the playlist.');
            }
        });
        firstSongEntry.appendChild(deleteButton);
    }
});


document.getElementById('create-playlist-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const playlistName = document.getElementById('playlist-name').value;
    const playlistAuthor = document.getElementById('playlist-author').value;

    const newPlaylist = {
        playlistID: `pl${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        playlist_name: playlistName,
        playlist_author: playlistAuthor,
        playlist_art: "assets/img/playlist.png",
        songs: {}
    };

    const songEntries = document.querySelectorAll('.song-entry');
    songEntries.forEach((entry) => {
        const titleInput = entry.querySelector('input[id^="song-title-"]');
        const artistInput = entry.querySelector('input[id^="song-artist-"]');
        const albumInput = entry.querySelector('input[id^="song-album-"]');
        const durationInput = entry.querySelector('input[id^="song-duration-"]');

        if (titleInput && artistInput && albumInput && durationInput) {
            const songId = `s${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`;

            newPlaylist.songs[songId] = {
                song_name: titleInput.value,
                artist: artistInput.value,
                album: albumInput.value,
                duration: durationInput.value,
                album_art: "assets/img/song.png"
            };
        }
    });

    fetchPlaylistData()
    .then(data => {
        globalPlaylistsData = data;
        const playlists = data.playlists;
        playlists.push(newPlaylist);

        updateUIWithNewPlaylist(newPlaylist);

        document.getElementById('create-playlist-form').reset();

        const songEntries = document.querySelectorAll('.song-entry');
        for (let i = 1; i < songEntries.length; i++) {
            songEntries[i].remove();
        }

        const firstSongEntry = document.querySelector('.song-entry');
        if (firstSongEntry && !firstSongEntry.querySelector('.delete-song-button')) {
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-song-button';
            deleteButton.textContent = 'Delete Song';
            deleteButton.addEventListener('click', function() {
                if (document.querySelectorAll('.song-entry').length > 1) {
                    firstSongEntry.remove();
                } else {
                    alert('You must have at least one song in the playlist.');
                }
            });
            firstSongEntry.appendChild(deleteButton);
        }

        const firstTitleInput = document.getElementById('song-title-1');
        const firstArtistInput = document.getElementById('song-artist-1');
        const firstAlbumInput = document.getElementById('song-album-1');
        const firstDurationInput = document.getElementById('song-duration-1');
        if (firstTitleInput) firstTitleInput.value = '';
        if (firstArtistInput) firstArtistInput.value = '';
        if (firstAlbumInput) firstAlbumInput.value = '';
        if (firstDurationInput) firstDurationInput.value = '';

        addOverlay.style.display = 'none';

        console.log('New playlist added:', newPlaylist);
    })
    .catch(error => {
        console.error('Error adding playlist:', error);
    });
});

const editOverlayCloseButton = document.querySelector('.edit-overlay .close-button');
if (editOverlayCloseButton) {
    editOverlayCloseButton.addEventListener('click', () => {
        document.querySelector('.edit-overlay').style.display = 'none';
    });
}

document.getElementById('edit-add-song-button').addEventListener('click', function() {
    const songCount = document.querySelectorAll('#edit-songs-section .song-entry').length + 1;
    const songEntry = document.createElement('div');
    songEntry.classList.add('song-entry');
    songEntry.dataset.songId = `new-${Date.now()}`; // Temporary ID for new songs

    songEntry.innerHTML = `
        <div class="form-group">
            <label for="edit-song-title-${songCount}">Song Title:</label>
            <input type="text" id="edit-song-title-${songCount}" name="edit-song-title-${songCount}" required>
        </div>
        <div class="form-group">
            <label for="edit-song-artist-${songCount}">Artist:</label>
            <input type="text" id="edit-song-artist-${songCount}" name="edit-song-artist-${songCount}" required>
        </div>
        <div class="form-group">
            <label for="edit-song-album-${songCount}">Album:</label>
            <input type="text" id="edit-song-album-${songCount}" name="edit-song-album-${songCount}" required>
        </div>
        <div class="form-group">
            <label for="edit-song-duration-${songCount}">Duration:</label>
            <input type="text" id="edit-song-duration-${songCount}" name="edit-song-duration-${songCount}" required>
        </div>
        <button type="button" class="delete-song-button">Delete Song</button>
    `;

    document.getElementById('edit-songs-section').appendChild(songEntry);

    // Add event listener to the delete button
    const deleteButton = songEntry.querySelector('.delete-song-button');
    deleteButton.addEventListener('click', function() {
        songEntry.remove();
    });
});

function openEditPlaylistOverlay(playlist) {
    const editOverlay = document.querySelector('.edit-overlay');
    const editPlaylistId = document.getElementById('edit-playlist-id');
    const editPlaylistName = document.getElementById('edit-playlist-name');
    const editPlaylistAuthor = document.getElementById('edit-playlist-author');
    const editSongsSection = document.getElementById('edit-songs-section');
    const editForm = document.getElementById('edit-playlist-form');

    while (editSongsSection.children.length > 1) { // Keep the h4 heading
        editSongsSection.removeChild(editSongsSection.lastChild);
    }

    editPlaylistId.value = playlist.playlistID;
    editPlaylistName.value = playlist.playlist_name;
    editPlaylistAuthor.value = playlist.playlist_author;

    let songIndex = 0;
    for (const songId in playlist.songs) {
        const song = playlist.songs[songId];
        songIndex++;

        const songEntry = document.createElement('div');
        songEntry.classList.add('song-entry');
        songEntry.dataset.songId = songId;

        songEntry.innerHTML = `
            <div class="form-group">
                <label for="edit-song-title-${songIndex}">Song Title:</label>
                <input type="text" id="edit-song-title-${songIndex}" name="edit-song-title-${songIndex}" value="${song.song_name}" required>
            </div>
            <div class="form-group">
                <label for="edit-song-artist-${songIndex}">Artist:</label>
                <input type="text" id="edit-song-artist-${songIndex}" name="edit-song-artist-${songIndex}" value="${song.artist}" required>
            </div>
            <div class="form-group">
                <label for="edit-song-album-${songIndex}">Album:</label>
                <input type="text" id="edit-song-album-${songIndex}" name="edit-song-album-${songIndex}" value="${song.album}" required>
            </div>
            <div class="form-group">
                <label for="edit-song-duration-${songIndex}">Duration:</label>
                <input type="text" id="edit-song-duration-${songIndex}" name="edit-song-duration-${songIndex}" value="${song.duration}" required>
            </div>
            <button type="button" class="delete-song-button">Delete Song</button>
        `;

        editSongsSection.appendChild(songEntry);

        // Add event listener to the delete button
        const deleteButton = songEntry.querySelector('.delete-song-button');
        deleteButton.addEventListener('click', function() {
            if (document.querySelectorAll('#edit-songs-section .song-entry').length > 1) {
                songEntry.remove();
            } else {
                alert('You must have at least one song in the playlist.');
            }
        });
    }

    editOverlay.style.display = 'flex';

    const newForm = editForm.cloneNode(true);
    editForm.parentNode.replaceChild(newForm, editForm);

    const songEntries = document.querySelectorAll('#edit-songs-section .song-entry');
    songEntries.forEach(entry => {
        const deleteButton = entry.querySelector('.delete-song-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                if (document.querySelectorAll('#edit-songs-section .song-entry').length > 1) {
                    entry.remove();
                } else {
                    alert('You must have at least one song in the playlist.');
                }
            });
        }
    });

    const addSongButton = document.getElementById('edit-add-song-button');
    if (addSongButton) {
        addSongButton.addEventListener('click', function() {
            const songCount = document.querySelectorAll('#edit-songs-section .song-entry').length + 1;
            const songEntry = document.createElement('div');
            songEntry.classList.add('song-entry');
            songEntry.dataset.songId = `new-${Date.now()}`;

            songEntry.innerHTML = `
                <div class="form-group">
                    <label for="edit-song-title-${songCount}">Song Title:</label>
                    <input type="text" id="edit-song-title-${songCount}" name="edit-song-title-${songCount}" required>
                </div>
                <div class="form-group">
                    <label for="edit-song-artist-${songCount}">Artist:</label>
                    <input type="text" id="edit-song-artist-${songCount}" name="edit-song-artist-${songCount}" required>
                </div>
                <div class="form-group">
                    <label for="edit-song-album-${songCount}">Album:</label>
                    <input type="text" id="edit-song-album-${songCount}" name="edit-song-album-${songCount}" required>
                </div>
                <div class="form-group">
                    <label for="edit-song-duration-${songCount}">Duration:</label>
                    <input type="text" id="edit-song-duration-${songCount}" name="edit-song-duration-${songCount}" required>
                </div>
                <button type="button" class="delete-song-button">Delete Song</button>
            `;

            document.getElementById('edit-songs-section').appendChild(songEntry);

            // Add event listener to the delete button
            const deleteButton = songEntry.querySelector('.delete-song-button');
            deleteButton.addEventListener('click', function() {
                songEntry.remove();
            });
        });
    }

    const submitButton = document.querySelector('#edit-playlist-form button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', function(event) {
            event.preventDefault();

            const playlistId = document.getElementById('edit-playlist-id').value;
            const playlistName = document.getElementById('edit-playlist-name').value;
            const playlistAuthor = document.getElementById('edit-playlist-author').value;

            let playlist = null;
            let playlistIndex = -1;

            if (globalPlaylistsData) {
                playlistIndex = globalPlaylistsData.playlists.findIndex(p => p.playlistID === playlistId);
                if (playlistIndex !== -1) {
                    playlist = globalPlaylistsData.playlists[playlistIndex];
                }
            }

            if (!playlist) {
                console.error('Playlist not found:', playlistId);
                return;
            }

            playlist.playlist_name = playlistName;
            playlist.playlist_author = playlistAuthor;

            playlist.songs = {};

            const songEntries = document.querySelectorAll('#edit-songs-section .song-entry');
            songEntries.forEach((entry) => {
                const titleInput = entry.querySelector('input[id^="edit-song-title-"]');
                const artistInput = entry.querySelector('input[id^="edit-song-artist-"]');
                const albumInput = entry.querySelector('input[id^="edit-song-album-"]');
                const durationInput = entry.querySelector('input[id^="edit-song-duration-"]');

                if (titleInput && artistInput && albumInput && durationInput) {
                    const songId = entry.dataset.songId && !entry.dataset.songId.startsWith('new-')
                        ? entry.dataset.songId
                        : `s${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`;

                    playlist.songs[songId] = {
                        song_name: titleInput.value,
                        artist: artistInput.value,
                        album: albumInput.value,
                        duration: durationInput.value,
                        album_art: "assets/img/song.png"
                    };
                }
            });

            // Update UI
            const playlistCards = document.getElementsByClassName("playlist-card");
            for (let i = 0; i < playlistCards.length; i++) {
                if (playlistCards[i].dataset.playlistId === playlistId) {
                    const playlistTitle = playlistCards[i].querySelector('.playlist-title');
                    const playlistCreator = playlistCards[i].querySelector('.playlist-creator');

                    if (playlistTitle) playlistTitle.innerText = playlistName;
                    if (playlistCreator) playlistCreator.innerText = playlistAuthor;

                    const updatedPlaylist = playlist; // Reference to the updated playlist

                    const newCard = playlistCards[i].cloneNode(true);
                    playlistCards[i].parentNode.replaceChild(newCard, playlistCards[i]);

                    newCard.addEventListener('click', () => {
                        const modalOverlay = document.querySelector('.modal-overlay');
                        const modalTitle = document.getElementById("modal-title");
                        const modalAuthor = document.getElementById("modal-author");
                        const songsContainer = document.getElementById("songs-container");

                        modalOverlay.style.display = 'flex';
                        modalTitle.innerText = updatedPlaylist.playlist_name;
                        modalAuthor.innerText = updatedPlaylist.playlist_author;

                        displaySongs(updatedPlaylist.songs, songsContainer);
                    });

                    const deleteButton = newCard.querySelector('.delete-playlist-button');
                    if (deleteButton) {
                        deleteButton.addEventListener('click', (event) => {
                            event.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${updatedPlaylist.playlist_name}"?`)) {
                                newCard.remove();
                                if (globalPlaylistsData) {
                                    const index = globalPlaylistsData.playlists.findIndex(p => p.playlistID === updatedPlaylist.playlistID);
                                    if (index !== -1) {
                                        globalPlaylistsData.playlists.splice(index, 1);
                                    }
                                }
                            }
                        });
                    }

                    const editButton = newCard.querySelector('.edit-playlist-button');
                    if (editButton) {
                        editButton.addEventListener('click', (event) => {
                            event.stopPropagation();
                            openEditPlaylistOverlay(updatedPlaylist);
                        });
                    }

                    const likeContainer = newCard.querySelector('.like-count');
                    if (likeContainer) {
                        const heart = likeContainer.querySelector('.heart');
                        const likeCountElement = likeContainer.querySelector('.num');
                        let isLiked = heart.src.includes('heart_red.png');

                        likeContainer.addEventListener('click', (event) => {
                            event.stopPropagation();
                            isLiked = !isLiked;

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
                    }

                    break;
                }
            }

            document.querySelector('.edit-overlay').style.display = 'none';

            console.log('Playlist updated:', playlist);
        });
    }
}

function updateUIWithNewPlaylist(newPlaylist) {
    const playlistContainer = document.querySelector('.playlistcards');

    if (!playlistContainer) {
        console.error('Playlist container not found');
        return;
    }

    const newCard = document.createElement('div');
    newCard.className = 'playlist-card';
    newCard.dataset.playlistId = newPlaylist.playlistID;

    const likeCount = getLikeCount(newPlaylist.playlistID);

    newCard.innerHTML = `
        <div class="playlist-image">
            <img src="${newPlaylist.playlist_art}" alt="">
        </div>
        <div class="playlist-info">
            <h2 class="playlist-title">${newPlaylist.playlist_name}</h2>
            <p class="playlist-creator">${newPlaylist.playlist_author}</p>
            <div class="like-count">
                <img src="assets/img/heart.png" alt="" class="heart">
                <p class="num">${likeCount}</p>
            </div>
        </div>
        <button class="delete-playlist-button" title="Delete Playlist">×</button>
        <button class="edit-playlist-button" title="Edit Playlist">✎</button>
    `;

    newCard.addEventListener('click', () => {
        const modalOverlay = document.querySelector('.modal-overlay');
        const modalTitle = document.getElementById("modal-title");
        const modalAuthor = document.getElementById("modal-author");
        const songsContainer = document.getElementById("songs-container");

        modalOverlay.style.display = 'flex';
        modalTitle.innerText = newPlaylist.playlist_name;
        modalAuthor.innerText = newPlaylist.playlist_author;

        displaySongs(newPlaylist.songs, songsContainer);
    });

    const heart = newCard.querySelector('.heart');
    const likeCountElement = newCard.querySelector('.num');
    let isLiked = false;

    newCard.querySelector('.like-count').addEventListener('click', (event) => {
        event.stopPropagation();
        isLiked = !isLiked;

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

    const deleteButton = newCard.querySelector('.delete-playlist-button');
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering playlist card click

        if (confirm(`Are you sure you want to delete "${newPlaylist.playlist_name}"?`)) {
            newCard.remove();

            if (globalPlaylistsData) {
                const index = globalPlaylistsData.playlists.findIndex(p => p.playlistID === newPlaylist.playlistID);
                if (index !== -1) {
                    globalPlaylistsData.playlists.splice(index, 1);
                    console.log(`Playlist "${newPlaylist.playlist_name}" removed from data structure`);
                }
            }
        }
    });

    const editButton = newCard.querySelector('.edit-playlist-button');
    editButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering playlist card click
        openEditPlaylistOverlay(newPlaylist);
    });

    playlistContainer.appendChild(newCard);
}
