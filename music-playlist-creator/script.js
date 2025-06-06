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

        for (let i = 0; i < playlistName.length; i++) {
            if (playlists[i]) {
                playlistName[i].innerText = playlists[i].playlist_name;
                playlistAuthor[i].innerText = playlists[i].playlist_author;
            }
        }

        for (let i = 0; i < playlistCard.length; i++) {
            playlistCard[i].addEventListener('click', () => {
                console.log('Card clicked:', playlists[i].playlist_name);
                modalOverlay.style.display = 'flex';
                modal_title.innerText = playlists[i].playlist_name;
                modal_author.innerText = playlists[i].playlist_author;

                songsContainer.innerHTML = '';

                playlists[i].songs.forEach(song => {
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

            let likeCount = parseInt(likeCountElement.innerText);

            container.addEventListener('click', (event) => {
                event.stopPropagation();
                isLiked = !isLiked;
                heart.classList.toggle('active');
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
