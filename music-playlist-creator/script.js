fetch("data/data.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Unable to connect to data.json file.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Data fetched:', data);
        const playlists = data.playlists;
        const playlistName = document.getElementsByClassName("playlist-title");
        const playlistAuthor = document.getElementsByClassName("playlist-creator");
        const playlistCard = document.getElementsByClassName("playlist-card");
        const modalOverlay = document.querySelector('.modal-overlay');
        const closeButton = document.querySelector('.close-button');
        const modal_title = document.getElementById("modal-title");
        const modal_author = document.getElementById("modal-author");
        const songsContainer = document.getElementById("songs-container");
        const shuffle_button = document.querySelector('.shuffle')

        for (let i = 0; i < playlistName.length; i++) {
            if (playlists[i]) {
                playlistName[i].innerText = playlists[i].playlist_name;
                playlistAuthor[i].innerText = playlists[i].playlist_author;
            }
        }

        let currentPlaylistIndex = null;

        for (let i = 0; i < playlistCard.length; i++) {
            playlistCard[i].addEventListener('click', () => {
                currentPlaylistIndex = i;
                console.log('Card clicked:', playlists[i].playlist_name);
                modalOverlay.style.display = 'flex';
                modal_title.innerText = playlists[i].playlist_name;
                modal_author.innerText = playlists[i].playlist_author;

                songsContainer.innerHTML = '';

                // Get the songs object and convert its values to an array
                const songsArray = Object.values(playlists[i].songs);

                // Iterate through the songs array
                songsArray.forEach(song => {
                    const songRow = document.createElement('div');
                    songRow.className = 'song-row';
                    songRow.innerHTML = `
                        <div class="grid-col-1">
                            <div class="image-holder-1">
                                <img src="${song.album_art}" alt="">
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
                    songsContainer.appendChild(songRow);
                });
            });
        }
        shuffle_button.addEventListener('click', () => {
            console.log("Shuffle Button Working!")
            songsContainer.innerHTML = '';
            temp_playlist = playlists[currentPlaylistIndex]
            const index_array = []
            const songKeys = Object.keys(temp_playlist.songs);
            for (let k = 0; k < songKeys.length; k++) {
                const songID = songKeys[k];
                console.log(songID);
                index_array.push(songID)
            }
            for (let i = index_array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [index_array[i], index_array[j]] = [index_array[j], index_array[i]];
            }
            console.log(index_array)
            for (let index of index_array) {
                const song = temp_playlist.songs[index];
                const songRow = document.createElement('div');
                songRow.className = 'song-row';
                songRow.innerHTML = `
                    <div class="grid-col-1">
                        <div class="image-holder-1">
                            <img src="${song.album_art}" alt="">
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
                songsContainer.appendChild(songRow);
            }
        })

        closeButton.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });

        const likeContainers = document.querySelectorAll('.like-count');

        likeContainers.forEach(container => {
            const heart = container.querySelector('.heart');
            const likeCountElement = container.querySelector('.num');
            let isLiked = false;

            min = Math.ceil(1);
            max = Math.floor(5000);
            likeCountElement.innerText = Math.floor(Math.random() * (max - min + 1)) + min;

            container.addEventListener('click', (event) => {
                event.stopPropagation();
                isLiked = !isLiked;
                heart.classList.toggle('active');
                likeCount =likeCountElement.innerText;
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
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
