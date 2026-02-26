const discoverSidebarBtn = document.querySelector(".discover-wrapper .discover");
const discoverModal = document.querySelector(".discover-modal");
const discoverModalWrapper = document.querySelector(".discover-modal-wrapper");
const discoverModalServersDiv = document.querySelector(".discover-modal-servers");
const discoverModalClose = document.querySelector(".discover-modal-close");

let allServersBack   = [];

let serverIconSelected = false;
let serverBannerSelected = false;

let selectedServerIcon;
let selectedServerBanner;

const createServer2 = document.querySelector(".create-server-2");
const serverTagInput = document.querySelector(".server-tag-input");
const serverTagPreview = document.querySelector(".server-tag-preview h1");

const serverIconsDiv = document.querySelector(".server-icons");
const allServerIconButtons = serverIconsDiv.querySelectorAll("button")

const serverBannersDiv = document.querySelector(".server-banners");
const allServerBannerButtons = serverBannersDiv.querySelectorAll("button")

const settingsModal = document.querySelector(".settings-modal");
const settingsModalWrapper = document.querySelector(".settings-modal-wrapper");
const settingsClose = document.querySelector(".settings-close");

const settingsButton = document.querySelector(".user-settings");

const serversStat = document.querySelector(".servers-stat");
const serversStatMocker = document.querySelector(".servers-stat-mocker");

const messagesStat = document.querySelector(".messages-stat");
const messagesStatMocker = document.querySelector(".messages-stat-mocker");

const reactionsStat = document.querySelector(".reactions-stat");
const reactionsStatMocker = document.querySelector(".reactions-stat-mocker");

const friendsStat = document.querySelector(".friends-stat");
const friendsStatMocker = document.querySelector(".friends-stat-mocker");

const onlineStat = document.querySelector(".online-stat");
const onlineStatMocker = document.querySelector(".online-stat-mocker");

const averageStat = document.querySelector(".average-stat");
const averageStatMocker = document.querySelector(".average-stat-mocker");

const logOutButton = document.querySelector(".log-out");
const deleteAccountButton = document.querySelector(".delete-account");
const deleteAccountButtonFinal = document.querySelector(".delete-account-final");

const settingsProfilePicture = document.querySelector(".settings-profile");
const settingsProfileBadge = document.querySelector(".settings-badge");
const settingsGreeting = document.querySelector(".settings-greeting");

const deletionModal = document.querySelector(".deletion-modal");
const deletionModalWrapper = document.querySelector(".deletion-modal-wrapper");

const deletionClose = document.querySelector(".deletion-modal-close");
const deletionUsernameDisplay = deletionModal.querySelector("h2");
const deletionCloseServerList = deletionModal.querySelector(".server-list");

const editProfileModal = document.querySelector(".edit-profile-modal");
const editProfileClose = document.querySelector(".close-edit-profile");
const settingsEditProfile = document.querySelector(".edit-profile");

const editProfileDiv = document.querySelector(".edit-profile-preview");
const editProfilePreviewBanner = document.querySelector(".preview-user-banner");
const userBannerBadge1 = document.querySelector(".user-banner-badge-1");
const userBannerBadge2 = document.querySelector(".user-banner-badge-2");
const userBannerBadge3 = document.querySelector(".user-banner-badge-3");
const editProfilePreviewProfile = document.querySelector(".preview-user-profile");
const editProfilePreviewBadge = document.querySelector(".preview-user-badge");
const editProfilePreviewUsername = document.querySelector(".preview-user-username");
const editProfilePreviewUserID = document.querySelector(".preview-user-userid");
const editProfilePreviewBio = document.querySelector(".preview-user-bio");
const editProfileLinksDiv = document.querySelector(".preview-user-links");
const editProfileUsername = document.querySelector(".preview-user-username");

const changesIndicator = document.querySelector(".changes-indicator");

const editProfilePicturesDiv = document.querySelector(".edit-profile-pictures");
const allEditProfilePictures = editProfilePicturesDiv.querySelectorAll("button");

const editProfileBadgesDiv = document.querySelector(".edit-profile-badges");
const allEditProfileBadges = editProfileBadgesDiv.querySelectorAll("button");

const editBannerColorDiv = document.querySelector(".banner-color");
const allBannerColors = editBannerColorDiv.querySelectorAll("button");

const editBadge1Div = document.querySelector(".badge-holder-1");
const allBadge1Buttons = editBadge1Div.querySelectorAll("button");

const editBadge2Div = document.querySelector(".badge-holder-2");
const allBadge2Buttons = editBadge2Div.querySelectorAll("button");

const editBadge3Div = document.querySelector(".badge-holder-3");
const allBadge3Buttons = editBadge3Div.querySelectorAll("button");

const editProfileThemeDiv = document.querySelector(".profile-theme-holder");
const allProfileThemes = editProfileThemeDiv.querySelectorAll("button");

const usernameUpdate = document.querySelector(".username-update");
const setUsername = document.querySelector(".set-username");

const oldPassword = document.querySelector(".password-old");
const newPassword = document.querySelector(".password-new");
const bioUpdate = document.querySelector(".bio-updater");

const saveChanges = document.querySelector(".save-changes");

let dataChanged = false;

let tempSelectedPassword;
let tempSelectedBio;

saveChanges.addEventListener('click', () => {
    if (!dataChanged) {
        showToast("what do you wanna save? your emotional state? nuh uh");
        return;
    }

    fetch('/api/user/profile/update', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            "userID": userID,
            "username": username,
            "profile": tempSelectedProfile,
            "badge": tempSelectedBadge,
            "banner": tempSelectedBanner,
            "badge1": tempSelectedBadge1,
            "badge2": tempSelectedBadge2,
            "badge3": tempSelectedBadge3,
            "profileTheme": tempSelectedProfileTheme
        }) 
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "profile updated") {
            showToast("changes saved.")
            
            username = tempSelectedUsername;
            selectedProfile = tempSelectedProfile;
            selectedBadge = tempSelectedBadge;
            selectedBanner = tempSelectedBanner;
            selectedBadge1 = tempSelectedBadge1;
            selectedBadge2 = tempSelectedBadge2;
            selectedBadge3 = tempSelectedBadge3;
            selectedProfileTheme = tempSelectedProfileTheme;

            localStorage.setItem("pfp", JSON.stringify(selectedProfile));
            localStorage.setItem("badge", JSON.stringify(selectedBadge));
            localStorage.setItem("username", JSON.stringify(username));
            localStorage.setItem("userID", JSON.stringify(userID));
            
            setProfilePicture(selectedProfile, selectedBadge);
            checkIfDataChanged();
        }
    })
});

usernameUpdate.addEventListener('input', () => {
    if (usernameUpdate.value.length > USERNAME_LIMIT) {
        usernameUpdate.value = usernameUpdate.value.slice(0, USERNAME_LIMIT);
    }
    
    tempSelectedUsername = usernameUpdate.value.trim();
    editProfileUsername.textContent = tempSelectedUsername;

    editProfileUsername.classList.toggle("FULL", tempSelectedUsername.length >= USERNAME_LIMIT);

    checkIfDataChanged();
});

setUsername.addEventListener('click', () => {
    if (tempSelectedUsername == username) {
        showToast("change your username to.. your own username? 120 iq");
        return;
    }

    if (!tempSelectedUsername) {
        showToast("enter a username first");
        return;
    }

    fetch('/api/user/username/check', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "username": tempSelectedUsername }) 
    })
    .then(response => response.json())
    .then(data => {
        const message = data.message;

        if (message === "username valid fr fr") {
            fetch('/api/user/username/change', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    "username": tempSelectedUsername, 
                    "userID": userID,
                    "oldUsername": username  // ← ADD THIS
                }) 
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === "username changed") {
                    showToast("updated username. enjoy"); 
                    
                    // ↓ ADD ALL OF THIS
                    username = tempSelectedUsername;
                    localStorage.setItem('username', JSON.stringify(username));
                    greetUser(username); // Update header greeting
                    usernameDisplay.textContent = `Hi, ${username}!`; // Update anywhere else username shows
                    
                    checkIfDataChanged();
                }
            })
        }
        else if (message === "username taken my guy") {
            showToast("username is taken rip");
            return;
        }
        else if (message === "account deleted 💀") {
            showToast("username is taken rip");
            return;
        }
    });
});

function changeChangeIndicator() {
    if (dataChanged) {
        changesIndicator.className = "changes-indicator";
        changesIndicator.classList.add("unsaved");
        changesIndicator.textContent = "Changes unsaved.";
    }
    else {
        changesIndicator.className = "changes-indicator";
        changesIndicator.classList.add("saved");
        changesIndicator.textContent = "All changes saved.";
    }
}

function checkIfDataChanged() {
    dataChanged =
        tempSelectedUsername !== username ||
        tempSelectedProfile !== selectedProfile ||
        tempSelectedBadge !== selectedBadge ||
        tempSelectedBanner !== selectedBanner ||
        tempSelectedBadge1 !== selectedBadge1 ||
        tempSelectedBadge2 !== selectedBadge2 ||
        tempSelectedBadge3 !== selectedBadge3 || 
        tempSelectedProfileTheme !== selectedProfileTheme;
    changeChangeIndicator();
}

allProfileThemes.forEach(button => {
    button.addEventListener('click', () => {
        editProfileDiv.className = "edit-profile-preview";
        editProfileDiv.classList.add(button.classList[1]);

        tempSelectedProfileTheme = button.classList[1];
        
        checkIfDataChanged()
    });
});

allBadge1Buttons.forEach(button => {
    button.addEventListener('click', () => {
        userBannerBadge1.textContent = button.textContent;

        tempSelectedBadge1 = button.textContent;
        
        checkIfDataChanged()
    });
});

allBadge2Buttons.forEach(button => {
    button.addEventListener('click', () => {
        userBannerBadge2.textContent = button.textContent;

        tempSelectedBadge2 = button.textContent;
        
        checkIfDataChanged()
    });
});

allBadge3Buttons.forEach(button => {
    button.addEventListener('click', () => {
        userBannerBadge3.textContent = button.textContent;

        tempSelectedBadge3 = button.textContent;
        
        checkIfDataChanged()
    });
});

allBannerColors.forEach(button => {
    button.addEventListener('click', () => {
        editProfilePreviewBanner.className = "preview-user-banner";
        editProfilePreviewBanner.classList.add(button.classList[0]);

        tempSelectedBanner = button.classList[0];
        
        checkIfDataChanged()
    });
});

allEditProfilePictures.forEach(button => {
    button.addEventListener('click', () => {
        editProfilePreviewProfile.className = "preview-user-profile";
        editProfilePreviewProfile.classList.add(button.classList[0]);

        tempSelectedProfile = button.classList[0];
        
        checkIfDataChanged()
    });
});

allEditProfileBadges.forEach(button => {
    button.addEventListener('click', () => {
        editProfilePreviewBadge.textContent = button.textContent;

        tempSelectedBadge = button.textContent;
        
        checkIfDataChanged()
    });
});

function toggleEditProfile() {
    editProfileModal.classList.toggle('hidden');
}

const editPasswordConfirmationClose = document.querySelector(".close-password-input-modal");
const editPasswordModal = document.querySelector(".password-input-modal");

const editPasswordModalButton = document.querySelector(".password-confirmation-button")
const editPasswordModalInput = document.querySelector(".password-confirmation-input")

function togglePasswordConf() {
    editPasswordModal.classList.toggle('hidden')
}

editPasswordConfirmationClose.addEventListener('click', () => {
    togglePasswordConf();
    toggleSettings();
});

function confirmPasswordDisplayContent() {
    const enteredPassword = editPasswordModalInput.value;
    if (!enteredPassword) { showToast("enter a password toaster brain"); return; }

    fetch('/api/users/details', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID })
    })
    .then(r => r.json())
    .then(data => {
        const u = data.userData;
        password = u.password;

        if (enteredPassword !== password) {
            showToast("wrong password bud");
            return;
        }

        // seed temps
        tempSelectedProfile      = u.profile;
        tempSelectedBadge        = u.badge;
        tempSelectedBanner       = u.banner;
        tempSelectedBadge1       = u.badge1;
        tempSelectedBadge2       = u.badge2;
        tempSelectedBadge3       = u.badge3;
        tempSelectedProfileTheme = u.profileTheme;
        tempSelectedUsername     = u.username;
        bio                      = u.bio;

        // populate UI
        editProfilePreviewBanner.className = "preview-user-banner";
        editProfilePreviewBanner.classList.add(u.banner);
        userBannerBadge1.textContent = u.badge1;
        userBannerBadge2.textContent = u.badge2;
        userBannerBadge3.textContent = u.badge3;
        editProfilePreviewProfile.className = "preview-user-profile";
        editProfilePreviewProfile.classList.add(u.profile);
        editProfilePreviewBadge.textContent = u.badge;
        editProfileDiv.className = "edit-profile-preview";
        editProfileDiv.classList.add(u.profileTheme);
        editProfilePreviewUsername.textContent = u.username;
        editProfilePreviewUserID.textContent = `#${u.userid}`;
        editProfilePreviewBio.textContent = u.bio;
        usernameUpdate.value = u.username;
        bioUpdate.value = u.bio;

        editPasswordModalInput.value = '';

        editProfileLinksDiv.innerHTML = '';
        (u.links ?? []).forEach(link => {
            let url = "empty-logo.png";
            if (link.includes("youtube.com")) url = "youtube-logo.png";
            else if (link.includes("discord.com")) url = "discord-logo.png";
            else if (link.includes("twitch.tv")) url = "twitch-logo.png";
            editProfileLinksDiv.innerHTML += `
                <a class="user-link" target="_blank" href="${link}">
                    <img alt="logo" src="link-icons/${url}">
                    ${link}
                </a>`;
        });

        showToast("you remembered your password? impressive");
        togglePasswordConf();
        toggleEditProfile();
    });
}

editPasswordModalInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        confirmPasswordDisplayContent();
    }
});

settingsEditProfile.addEventListener("click", () => {
    toggleSettings();
    togglePasswordConf();
});

editPasswordModalButton.addEventListener('click', () => {
    confirmPasswordDisplayContent();
});

editProfileClose.addEventListener("click", () => {
    toggleEditProfile();
    toggleSettings();
});

const reaction1 = document.querySelector(".reaction-1"); 
const reaction2 = document.querySelector(".reaction-2");
const reaction3 = document.querySelector(".reaction-3");
const reaction4 = document.querySelector(".reaction-4");
const reaction5 = document.querySelector(".reaction-5");

const allReactionButtons = document.querySelectorAll(".reaction");

allReactionButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (messageSelected) {
            const messageID = selectedMessage.dataset.messageId;
            socket.emit('react', {
                messageID,
                emoji: button.textContent,
                userID: userID,
                serverID: GlobalSelectedServerID,
                channelName: GlobalSelectedChannelName
            });
        }
    });
});

function renderServers(serversToDraw) {
    discoverModalServersDiv.innerHTML = ""; // Clear the old ones

    serversToDraw.forEach(server => {
        const div = document.createElement('div');
        div.classList.add("discover-modal-server");

        div.innerHTML = 
        `
        <div class="server-icon ${server.icon}">
            <img src="icons/${server.icon}.svg" class="server-banner-img">
        </div>
        <div class="discover-modal-server-details-holder">
            <p class="discover-modal-server-name">${server.serverName}</p>
            <p class="discover-modal-server-about">"${server.about}"</p>
            <div class="discover-modal-server-details">
                <p class="discover-modal-server-channels">Channels: ${server.channelsno}</p>
                <p class="discover-modal-server-members">Members: ${server.memberids.length}</p>
            </div>
        </div>
        `;

        const btn = document.createElement('button');
        btn.classList.add('server-join');
        btn.textContent = "Join";
        
        btn.addEventListener('click', () => {
            fetch('/api/server/join', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "userID": userID, "username": username, "serverid": server.serverid }) 
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === "server joined, fr fr") {
                    toggleDiscover();
                    toggleTransparent();
                    showToast("server joined, fr fr");
                    displayServers(userID);
                }
            })
        });

        div.appendChild(btn);
        discoverModalServersDiv.appendChild(div);
    });
}

discoverSidebarBtn.addEventListener('click', () => {
    discoverModalWrapper.classList.remove("hidden");
    discoverModal.classList.remove("hidden");
    
    toggleTransparent();

    fetch('/api/public/servers', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "userID": userID }) 
    })


    .then(response => response.json())
    .then(data => {
        allServersBackup = data.publicServers;
        renderServers(allServersBackup);
    })
    .catch(err => {
        console.error("Error:", err);
        discoverModalServersDiv.innerHTML = "<p>Server error, fr fr.</p>";
    });
});

const discoverModalInput = document.querySelector(".discover-modal-input");

discoverModalInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    
    const matched = allServersBackup.filter(s => 
        s.serverName.toLowerCase().includes(term)
    );

    renderServers(matched); 
});

discoverModalClose.addEventListener('click', () => {
    toggleTransparent();
    toggleDiscover();

});

function toggleSettings() {
    settingsModal.classList.toggle("hidden");
    settingsModalWrapper.classList.toggle("hidden");

    settingsProfilePicture.classList = "settings-profile";
    settingsProfilePicture.classList.add(selectedProfile);

    settingsProfileBadge.textContent = selectedBadge;

    settingsGreeting.textContent = `Hi, ${username}!`;

    fetch('/api/users/stats', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "userID": userID }) 
    })
    .then(response => response.json())
    .then(data => {
        const userStats = data.userStats;

        serversStat.textContent = `${userStats.serversJoined} servers joined`
        messagesStat.textContent = `${userStats.messagesSent} messages sent`
        reactionsStat.textContent = `${userStats.reactionsSent} reactions sent`
        friendsStat.textContent = `${userStats.friendsAdded} friends added`
        onlineStat.textContent = `${userStats.minutesOnline} minutes online`
        averageStat.textContent = `${userStats.averageSession}m average session`
        
        if (userStats.serversJoined <= 5) {
            serversStatMocker.textContent = "join more servers dude"
        } else if (userStats.serversJoined > 5 && userStats.serversJoined < 10) {
            serversStatMocker.textContent = "lots of servers"
        } else {
            serversStatMocker.textContent = "that's alot of servers"
        }

        if (userStats.messagesSent <= 20) {
            messagesStatMocker.textContent = "quiet boy eh?"
        } else if (userStats.messagesSent < 200) {
            messagesStatMocker.textContent = "actually talks, shocking"
        } else {
            messagesStatMocker.textContent = "please go outside"
        }

        if (userStats.reactionsSent <= 10) {
            reactionsStatMocker.textContent = "emotionally unavailable"
        } else if (userStats.reactionsSent < 100) {
            reactionsStatMocker.textContent = "reacting like a normal human"
        } else {
            reactionsStatMocker.textContent = "god what is wrong with you"
        }

        if (userStats.friendsAdded <= 3) {
            friendsStatMocker.textContent = "small circle arc"
        } else if (userStats.friendsAdded < 15) {
            friendsStatMocker.textContent = "socially functional"
        } else {
            friendsStatMocker.textContent = "networking demon"
        }

        if (userStats.minutesOnline <= 300) {
            onlineStatMocker.textContent = "barely exists here"
        } else if (userStats.minutesOnline < 3000) {
            onlineStatMocker.textContent = "time spent outside: -2 hours"
        } else {
            onlineStatMocker.textContent = "log off. please"
        }

        if (userStats.averageSession <= 5) {
            averageStatMocker.textContent = "commitment issues"
        } else if (userStats.averageSession < 30) {
            averageStatMocker.textContent = "reasonable attention span"
        } else {
            averageStatMocker.textContent = "time blindness detected"
        }
    });
}

function toggleDeletion() {
    deletionModalWrapper.classList.toggle("hidden");
    deletionModal.classList.toggle("hidden");
}

function logout() {
    localStorage.removeItem("userID");
    localStorage.removeItem("username");
    localStorage.removeItem("pfp");
    localStorage.removeItem("badge");

    userID = null;
    username = null;

    GlobalSelectedServerID = null;
    GlobalSelectedChannelName = null;

    globalUnreadStatus = {};
    globalServerData = [];

    socket.disconnect();

    serverNameHeading.textContent = "";
    channelHeader.textContent = "";
    usernameDisplay.textContent = "";

    headerProfilePicture.className = "header-profile";
    headerProfileBadge.textContent = "";
}

logOutButton.addEventListener('click', () => {
    toggleSettings();
    toggleEntry();
    
    logout();
});

deleteAccountButton.addEventListener('click', () => {
    toggleSettings();
    toggleDeletion();

    deletionUsernameDisplay.textContent = "Are you sure, " + username + "?";

    fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID })
    })
    .then(response => response.json())
    .then(data => {
        deletionCloseServerList.innerHTML = '';

        const servers = data.userServerObjects;

        servers.forEach(server => {
            deletionCloseServerList.innerHTML += 
            `
            <div class="deletion-server">
                <div class="server-icon deletion-server-pfp ${server.icon}">
                    <img alt="Server Icon" src="icons/${server.icon}.svg" class="server-icon-img">
                </div>
                <div class="deletion-server-details-holder">
                    <p class="deletion-server-name">${server.serverName}</p>
                    <p class="deletion-server-about">"${server.about}"</p>
                    <div class="deletion-server-details">
                        <p class="deletion-server-members">Channels: ${server.channels.length}</p>
                        <p class="deletion-server-members">Members: ${server.members}</p>
                    </div>
                </div>
            </div>
            `
        });
    });
});

deleteAccountButtonFinal.addEventListener('click', () => {
    fetch("/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "user deleted") {
            toggleDeletion();
            toggleEntry();
            logout();
        };
    });
});


deletionClose.addEventListener('click', () => {
    toggleDeletion();
    toggleSettings();
});

settingsClose.addEventListener('click', () => {
    toggleTransparent();
    toggleSettings();
});

settingsButton.addEventListener('click', () => {
    toggleTransparent();
    toggleSettings();
});

let serverName;
let serverTopic;
let channels;

createServer.addEventListener('click', () => {
    serverName = serverNameInput.value.trim();
    serverTopic = serverTopicInput.value.trim();

    if (!serverName) {
        showToast("oopsie, you forgot a server name");
        return;
    }

    if (!serverTopic) {
        showToast("oopsie, you forgot a server topic");
        return;
    }

    let channelServersElements = document.querySelectorAll(".temp-channel");
    
    if (channelServersElements.length === 0) {
        showToast("no channels?");
        return;
    }

    channels = [];
    
    channelServersElements.forEach(channel => {
        channels.push({ "name": channel.querySelector('p').textContent.slice(1), "messages": []})
    });

    toggleCreate();
    toggleServerCustom();
});

const allServerIcons = document.querySelectorAll(".server-icon");

allServerIconButtons.forEach(button => {
    button.addEventListener('click', () => {
        serverIconSelected = true;
        selectedServerIcon = button.classList[1];
        allServerIcons.forEach(subButton => {
            subButton.classList.remove('selected');
        });
        button.classList.add('selected');
    });
});

const allServerBannerImgs = document.querySelectorAll(".server-banner-img");

allServerBannerButtons.forEach(button => {
    button.addEventListener('click', () => {
        serverBannerSelected = true;
        selectedServerBanner = button.classList[1];
        allServerBannerImgs.forEach(img => {
            img.classList = 'server-banner-img'
        });
        const selectedServerBannerImg = button.querySelector("img");
        selectedServerBannerImg.classList.add('selected');
    });
});

serverTagInput.addEventListener('input', () => {
    serverTagPreview.textContent = `[${serverTagInput.value.trim().slice(0, 5)}]`;
    if (serverTagInput.value.length > 5) {
        serverTagInput.value = serverTagInput.value.slice(0, 5)
    }
});

createServer2.addEventListener('click', () => {
    let serverTag = serverTagPreview.textContent;

    if (!serverTag || !serverTagInput.value.trim()) {
        showToast("enter a server tag");
        return;
    }

    if (!serverIconSelected) {
        showToast("select a server icon");
        return;
    }

    if (!serverBannerSelected) {
        showToast("select a server banner");
        return;
    }

    console.log({
        "serverName": serverName, 
        "public": isPublic,
        "userID": userID, 
        "members": 1, 
        "about": serverTopic,
        "memberids": [userID], 
        "memberNames": [username], 
        "channels": channels,
        "channelsno": channels.length,
        "icon": selectedServerIcon,
        "banner": selectedServerBanner,
        "tag": serverTag
    })

    fetch("/api/server/create", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "serverName": serverName, 
            "public": isPublic,
            "userID": userID, 
            "members": 1, 
            "about": serverTopic,
            "memberids": [userID], 
            "memberNames": [username], 
            "channels": channels,
            "channelsno": channels.length,
            "icon": selectedServerIcon,
            "banner": selectedServerBanner,
            "tag": serverTag
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "honeybun, your server is ready") {
            showToast("server created. try not to break it");
            displayServers(userID);
            toggleTransparent();
            toggleServerCustom();

            serverNameInput.value = '';
            serverTopicInput.value = '';
            createFakeChannelInput.value = '';
            tempChannelDiv.innerHTML = '';
            serverNameCount.textContent = `0/${NAME_LIMIT}`;
            serverTopicCount.textContent = `0/${TOPIC_LIMIT}`;
            serverVisibilityTag.textContent = ``;

            serverName = ``;
            serverTopic = ``;
            
            selectedServerIcon = null;
            selectedServerBanner = null;
            
            serverIconSelected = false;
            serverBannerSelected = false;

            channels = [];
            isPublic = true;
        };
    });
});

const isTouchDevice =
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0;

if (isTouchDevice) {
    let pressTimer = null;

    const LONG_PRESS_TIME = 500; // ms

    element.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
        showContextMenu(e);
    }, LONG_PRESS_TIME);
    });

    element.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
    });

    element.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
    });
}

const notifButton = document.querySelector(".notifications");
const notifPanel = document.querySelector(".notif-panel");
const notifList = document.querySelector(".notif-list");

function toggleNotif() {
    notifPanel.classList.toggle('visible');
}

function formatTimestamp(ts) {
    const date = new Date(ts);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const datePart = date.toLocaleDateString('en-US', options);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${datePart} | ${hours.toString().padStart(2,'0')}:${minutes} ${ampm}`;
}

function handleNotifToggle(e) {
    e.preventDefault(); // Prevent any default touch behavior
    e.stopPropagation(); // Stop event bubbling
    
    toggleNotif();
    
    // Your existing fetch code
    fetch("/api/user/notifications", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "userID": userID
        })
    })
    .then(response => response.json())
    .then(data => {
        notifList.innerHTML = '';

        const notifObject = data.userNotifications;

        for (const notif of notifObject) {
            if (notif.type === "friend-request") {
                fetch("/api/users/details", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "userID": notif.senderid
                    })
                })
                .then(response => response.json())
                .then(userData => {
                    const time = formatTimestamp(notif.timestamp)

                    notifList.innerHTML += 
                    `
                    <div class="notification friend-request">
                        <div class="friend-request-profile-picture ${userData.userData.profile}">
                            <span class="friend-request-profile-badge">${userData.userData.badge}</span>
                        </div>
                        <div class="notification-holder">
                            <p class="notification-content">${userData.userData.username} sent you a friend request.</p>
                            <p class="notification-date">${time}</p>
                        </div>
                        <div class="notification-cta">
                            <button class="accept-friend-request">Accept</button>
                            <button class="decline-friend-request">Decline</button>
                        </div>
                        ${notif.isRead ? '' : '<div class="unread"></div>'}
                    </div>
                    `
                });
            }
            if (notif.type === "mention") {
                fetch("/api/users/details", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "userID": notif.context.senderid
                    })
                })
                .then(response => response.json())
                .then(userData => {
                            const time = formatTimestamp(notif.timestamp)

                    notifList.innerHTML += 
                    `
                    <div class="notification friend-request">
                        <div class="friend-request-profile-picture ${userData.userData.profile}">
                            <span class="friend-request-profile-badge">${userData.userData.badge}</span>
                        </div>
                        <div class="notification-holder">
                            <p class="notification-content">${userData.userData.username} mentioned you in #${notif.context.channelName}, ${notif.context.serverName}</p>
                            <p class="notification-date">${time}</p>
                        </div>
                        <div class="notification-cta">
                            <button class="view-mention">View</button>
                        </div>
                        ${notif.isRead ? '' : '<div class="unread"></div>'}
                    </div>
                    `
                });
            };
        }
    });
};

notifButton.addEventListener('click', handleNotifToggle);
notifButton.addEventListener('touchend', handleNotifToggle);

// Also handle touchstart to prevent default
notifButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
});