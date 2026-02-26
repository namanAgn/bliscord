let userID;
try {
    const rawData = localStorage.getItem('userID');
    userID = (rawData && rawData !== "undefined") ? JSON.parse(rawData) : null;
} catch (e) {
    userID = null;
}

const socket = io({
    query: { userID: userID || '' }
});


let GlobalSelectedServerID;
let GlobalSelectedChannelName;
let GlobalPermissions;

let globalServerData = [];   // To store the full server objects

const usernameInput = document.querySelector('.username-input');
const passwordInput = document.querySelector('.password-input');
const transparent = document.querySelector(".transparent");

const enterUsername = document.querySelector(".set");
const usernameDisplay = document.querySelector(".username-display");
const serversDiv = document.querySelector(".servers")

const serverNameHeading = document.querySelector(".server-name");
const serverMembersHeading = document.querySelector(".server-members");
const serverChannelsHeading = document.querySelector(".server-channels");
const channelsDiv = document.querySelector(".channels");
const membersDiv = document.querySelector(".members");

const mainContentBottomLeft = document.querySelector(".main-content-bottom-left");
const rightSidebar = document.querySelector(".right-sidebar");

const channelHeader = document.querySelector(".header-channel");
const channelMessageHolder = document.querySelector(".messages-wrapper");

const headerSpan = document.querySelector(".header-span");

const mainInput = document.querySelector(".main-input");
const sendButton = document.querySelector('.send');

const createButton = document.querySelector(".create-wrapper");
const createModal = document.querySelector(".create-modal");
const createModalWrapper = document.querySelector(".create-modal-wrapper");
const closeCreateModal = document.querySelector(".close-modal");

const createFakeChannelInput = document.querySelector(".add-channel-input");
const createFakeChannelButton = document.querySelector(".add-channel");
const tempChannelDiv = document.querySelector(".temp-channels");

const createServer = document.querySelector(".create-server");

const serverNameInput = document.querySelector(".server-name-input");
const serverTopicInput = document.querySelector(".server-topic-input");

const serverNameCount = document.querySelector(".server-name-input-indicator");
const serverTopicCount = document.querySelector(".server-topic-input-indicator");

const homeButton = document.querySelector(".homes-button");
const serverDetailsDiv = document.querySelector(".server-details");

const footer = document.querySelector('.footer');

const editMessageModal = document.querySelector(".edit-message-modal");
const editMessageModalWrapper = document.querySelector(".edit-message-modal-wrapper");

const serverVisibilityToggle = document.querySelector(".server-visible-toggle");
const serverVisibilityTag = document.querySelector(".server-visible-p");
let serverSettingsButton = document.querySelector(".header-server-settings");

const cancelMessageEdit = document.querySelector(".message-edit-cancel");
const saveMessageEdit = document.querySelector(".message-edit-save");

cancelMessageEdit.addEventListener('click', () => {
    toggleTransparent();
    toggleEditMessage();
});

serverSettingsButton.addEventListener('click', () => {
    toggleTransparent();
    toggleServerSettings();
});

let messageSelected = false;
let selectedMessage = null;

let isPublic = true;

let isTyping = false;
let typingTimeout = null;

serverVisibilityToggle.addEventListener('click', () => {
    isPublic = !isPublic;
    serverVisibilityTag.innerText = isPublic ? "public" : "private";
});

let lastMessageCount = {};

function toggleTransparent() {
    transparent.classList.toggle('hidden');
}

function toggleEditMessage() {
    editMessageModal.classList.toggle('hidden');
    editMessageModalWrapper.classList.toggle('hidden');
}

function toggleCreate() {
    createModal.classList.toggle('hidden');
    createModalWrapper.classList.toggle('hidden');
}

function toggleDiscover() {
    discoverModal.classList.toggle('hidden')
    discoverModalWrapper.classList.toggle('hidden')
}

window.addEventListener('keydown', key => {
    if (key.key === "Escape") {
        if (!createModal.classList.contains('hidden')) {
            toggleTransparent();
            toggleCreate();
        }

        if (!discoverModal.classList.contains('hidden')) {
            toggleTransparent();
            toggleDiscover();
        }
    }
});

const NAME_LIMIT = 25;
const TOPIC_LIMIT = 50;
const USERNAME_LIMIT = 15;

const quotes = [
  "it's not grooming, if they are lonelyy",
  "don't feed the pigeons, they're plotting",
  "code hard, nap harder",
  "the WiFi sees all",
  "cats judge silently, efficiently",
  "keyboard warrior in training",
  "i came. i saw. i refreshed.",
  "low-key genius, high-key tired",
  "coffee first, chaos later",
  "planets are spinning, so am I"
];

const adjectives = [
    "little", "big", "giant", "friendly", "proud", "big brain"
]

const noun = [
    "muffin", "cloud", "monkey", "dolphin", "pookie", "china"
]

socket.on('friend-request-received', (data) => {
    const nicknameFirst = adjectives[Math.floor(Math.random() * adjectives.length)]
    const nicknameSecond = noun[Math.floor(Math.random() * noun.length)]
    const nicknameThird = Math.floor(Math.random() * 100)

    const nickname = `${nicknameFirst} ${nicknameSecond} ${nicknameThird}`;

    showToast(`${data.senderName} wants to be friends! please call them ${nickname}`);
});

socket.on('friend-request-accepted', (data) => {
    showToast(`${data.accepterName} accepted your request! please dont be weird with them`);
});

socket.on('friend-request-rejected', (data) => {
    showToast(`${data.rejecterName} rejected you. rip. touch grass and move on`);
});

socket.on('friend-request-cancelled', (data) => {
    showToast(`${data.cancellerName} cancelled their request. guess they fear you?`);
});

socket.on('friend-removed', (data) => {
    showToast(`${data.removerName} removed you as their friend. guess they became dumber talking to you`);
});

homeButton.addEventListener("click", () => {
    serverNameHeading.textContent = "Home";
    channelHeader.textContent = username;

    mainContentBottomLeft.innerHTML = 
    `                        
        <div class="channel-wrapper">
            <button class="gi-boost">GIBOOST<img src="icons/lighting.svg" alt="add"></button>
            <div class="quick-actions">
                <h2>QUICK ACTIONS</h2>
            </div>
            <button class="friends-list">FRIENDS<img src="icons/friend-requests.svg" alt="friends"></button>
            <button class="friend-requests">FRIEND REQUESTS<img src="icons/add3.svg" alt="friend requests"></button>
            <button class="create-gc">CREATE GC<img src="icons/group-chat.svg" alt="create group chat"></button>
            <button class="settings">SETTINGS<img src="icons/settings3.svg" alt="settings"></button>
            
            <div class="recent-dms-holder">
                <h2>RECENT DMS</h2>
            </div>
            <div class="recent-dms"></div>
        </div>
        <div class="channel-wrapper group-chats">
            <h2>GROUP CHATS</h2> 
            <div class="group-chats"></div>
        </div>
    `

    rightSidebar.innerHTML = 
    `
    <div class="friends-wrapper">
        <div>
            <h2>PINNED</h2>
        </div>
        <div class="pinned-friends"></div>
        <div>
            <h2>ALL FRIENDS</h2>
        </div>
        <div class="friends"></div>
    </div>
    `
});

/*

<div class="friend">
    <div class="profile"></div>
    <div>
        <p class="friend-dm-name">schlonglgy</p>
        <p class="friend-dm-at">@schlong</p>
    </div>
    <div class="status"></div>
    <button class="pin">
        <img src="icons/pin.svg" alt="pin">
    </button>
</div>

<div class="friend pinned">
    <div class="profile"></div>
        <div>
            <p class="friend-dm-name">schlonglgy</p>
            <p class="friend-dm-at">@schlong</p>
        </div>
    <div class="status"></div>
    <button class="pin pinned">
        <img src="icons/pin.svg" alt="pin">
    </button>
</div>

<div class="recent-dm">
    <div class="profile"></div>
    <div>
        <p class="recent-dm-name">bob</p>
        <p class="recent-dm-quote">"i cant do it :("</p>
    </div>
    <div class="status"></div>
</div>

*/
function scrollToBottomSmooth(element) {
    if (!element) return;
    
    requestAnimationFrame(() => {
        element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
        });
    });
}

serverNameInput.addEventListener("input", () => {
    if (serverNameInput.value.length > NAME_LIMIT) {
        serverNameInput.value = serverNameInput.value.slice(0, NAME_LIMIT);
    }

    serverNameCount.textContent =
        `${serverNameInput.value.length}/${NAME_LIMIT}`;

    serverNameCount.classList.toggle(
        "FULL",
        serverNameInput.value.length === NAME_LIMIT
    );
});

serverTopicInput.addEventListener("input", () => {
    if (serverTopicInput.value.length > TOPIC_LIMIT) {
        serverTopicInput.value = serverTopicInput.value.slice(0, TOPIC_LIMIT);
    }

    serverTopicCount.textContent =
        `${serverTopicInput.value.length}/${TOPIC_LIMIT}`;

    serverTopicCount.classList.toggle(
        "FULL",
        serverTopicInput.value.length === TOPIC_LIMIT
    );
});

setInterval(() => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  footer.querySelector("p").textContent = `v0.1: beta. "${quotes[randomIndex]}"`;
}, 5000);

function createFakeChannel(channelName) {
    const channelDiv = document.createElement("div");
    channelDiv.classList.add("temp-channel");

    const nameP = document.createElement("p");
    nameP.classList.add("channel-name");
    nameP.textContent = `#${channelName}`;

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove");
    removeBtn.textContent = "X";

    removeBtn.addEventListener("click", () => {
        channelDiv.remove();
    });

    channelDiv.append(nameP, removeBtn);
    tempChannelDiv.appendChild(channelDiv);
};

function hasSpecialChars(str) {
    return /[^a-zA-Z0-9 \-]/.test(str);
}

createFakeChannelButton.addEventListener("click", () => {
    let channelName = createFakeChannelInput.value.trim();

    if (!channelName) {
        showToast("oopsie, you forgot a channel name");
        return;
    }

    if (hasSpecialChars(channelName)) {
        showToast("no special characters dumbo");
        return;
    }

    createFakeChannel(channelName);
    createFakeChannelInput.value = ''
});

createFakeChannelInput.addEventListener("keydown", key => {
    if (key.key === "Enter") {
        let channelName = createFakeChannelInput.value.trim();

        if (!channelName) {
            showToast("oopsie, you forgot a channel name");
            return;
        }

        if (hasSpecialChars(channelName)) {
            showToast("no special characters dumbo");
            return;
        }

        createFakeChannel(channelName);
        createFakeChannelInput.value = ''
    };
});

function showToast(message, duration = 5000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        ${message}
        <button class="close-btn">&times;</button>
        <div class="progress"></div>
    `;
    container.appendChild(toast);

    const progress = toast.querySelector('.progress');
    progress.style.animation = `progressAnim ${duration}ms linear forwards`;

    // enter animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // auto-hide
    const hideTimeout = setTimeout(() => hideToast(toast), duration);

    // close button
    toast.querySelector('.close-btn').addEventListener('click', () => {
        clearTimeout(hideTimeout);
        hideToast(toast);
    });
}

function hideToast(toast) {
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => toast.remove());
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes progressAnim {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
}
`;

document.head.appendChild(style);

function handleSendMessage() {
    if (isTyping) {
        clearTimeout(typingTimeout);
        socket.emit('user-typing-stop', {
            serverID: GlobalSelectedServerID,
            channelName: GlobalSelectedChannelName,
            userID
        });
        isTyping = false;
    }

    let content = mainInput.value.trim();

    if (GlobalSelectedServerID === null || GlobalSelectedServerID === undefined) {
        showToast("who do you wanna send it to? yourself? select a server");
        return;
    }
    if (GlobalSelectedChannelName === null || GlobalSelectedChannelName === undefined) {
        showToast("my munchkin, select a channel");
        return;
    }
    if (!content) {
        showToast("you wanna send empty air? write smth smh");
        return;
    }

    const messageData = {
        content: content,
        serverID: GlobalSelectedServerID,
        channelName: GlobalSelectedChannelName,
        senderName: username, // using your global 'username' variable
        senderid: userID,     // using your global 'userID' variable
    };

    socket.emit('send-chat-message', messageData);
    
    // Clear input
    mainInput.value = '';  
}

mainInput.addEventListener('input', () => {
    if (!isTyping) {
        isTyping = true;
        socket.emit('user-typing-start', {
            serverID: GlobalSelectedServerID,
            channelName: GlobalSelectedChannelName,
            userID: userID,
            username: username,
            profile: selectedProfile,
            badge: selectedBadge
        });
    }
    
    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        if (!isTyping) return;

        socket.emit('user-typing-stop', {
            serverID: GlobalSelectedServerID,
            channelName: GlobalSelectedChannelName,
            userID: userID
        });

        isTyping = false;
    }, 2000);
});

mainInput.addEventListener('blur', () => {
    if (!isTyping) return;

    clearTimeout(typingTimeout);
    socket.emit('user-typing-stop', {
        serverID: GlobalSelectedServerID,
        channelName: GlobalSelectedChannelName,
        userID
    });
    isTyping = false;
});

saveMessageEdit.addEventListener('click', () => {
    if (selectedMessage) {
        const messageEditArea = document.querySelector(".message-edit-area");

        const content = messageEditArea.value;

        if (!content) {
            showToast("enter some text dude");
            return;
        }

        const messageID = selectedMessage.dataset.messageId;
        
        socket.emit('edit', {
            messageID,
            content: content,
            userID: userID,
            serverID: GlobalSelectedServerID,
            channelName: GlobalSelectedChannelName
        });

        toggleEditMessage();
        toggleTransparent();
    }
});

const typingHolder = document.querySelector('.typing-holder');
const typingObjectContainer = document.querySelector(".typing-list");
const typingMaxed = document.querySelector(".typing-maxed");
const typingIndicator = document.querySelector(".typing-indicator");

socket.on('typing-update', (data) => {
    const typingObject = data.typingObject || {};
    const userCount = Object.keys(typingObject).length;

    typingObjectContainer.innerHTML = '';
    typingMaxed.textContent = '';

    typingIndicator.textContent = userCount > 1 ? 'are typing...' : 'is typing...';

    if (userCount > 3) {
        const maxedCount = userCount - 3;
        typingMaxed.textContent = `+${maxedCount} other${maxedCount > 1 ? 's' : ''}`;
    }
    
    if (userCount === 0) {
        typingHolder.classList.remove('visible');
        return; 
    } else {
        typingHolder.classList.add('visible');
    }

    // 4. Get the first 3 and loop correctly
    const limitedUsers = Object.values(typingObject).slice(0, 3);
        
    for (const user of limitedUsers) {
        typingObjectContainer.innerHTML += `
        <div class="typing">
            <div class="typing-profile ${user.profile}">
                <span class="typing-profile-badge">${user.badge}</span>
            </div>
        </div>
        `;
    }
});

socket.on('render-new-message', (data) => {
    // Only append if we are currently looking at the channel the message belongs to
    // (A safety check even with Rooms)
    if (data.serverID === GlobalSelectedServerID && data.channelName === GlobalSelectedChannelName) {
        appendSingleMessage(data);
    }
});

socket.on('update-message', ({ message }) => {
    const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);

    const messageWrapper = messageDiv.querySelector('.message');

    const messageContent = messageWrapper.querySelector(".message-content");
    messageContent.textContent = message.content;

    if (message.deleted) {
        messageContent.textContent = 'this message was deleted';
        messageContent.classList.add('deleted');
    } else {
        messageContent.textContent = message.content;
        messageContent.classList.remove('deleted');
    }

    if (message.edited) {
        messageWrapper.innerHTML += `
            <span class="edited-tag">EDITED</span>
        `
    }

    const reactionWrapper = messageDiv.querySelector('.reaction-wrapper');

    reactionWrapper.innerHTML = '';

    for (const [emoji, userIDs] of Object.entries(message.reactions)) {
        const count = userIDs.length;

        const holder = document.createElement('div');
        holder.classList.add('reaction-holder');

        const content = document.createElement('p');
        content.classList.add('reaction-content');
        content.textContent = emoji;

        const counter = document.createElement('p');
        counter.classList.add('reaction-count');
        counter.textContent = `x${count}`;

        holder.appendChild(content);
        holder.appendChild(counter);
        reactionWrapper.appendChild(holder);
    }
});

function setEditMessage() {
    const messageID = selectedMessage.dataset.messageId;
    const serverID = GlobalSelectedServerID;
    const channelName = GlobalSelectedChannelName;

    fetch("/api/message/details", { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageID, serverID, channelName })
    })
    .then(response => response.json())
    .then(data => {
        editMessageModal.innerHTML = 
        `
        <div class="message-wrapper user">
            <div class="message ${data.message.theme} user">
                ${!data.message.stacked ? `
                <div class="message-details">
                    <span class="sender-username">${data.message.senderName}</span>
                    <span class="timestamp">${data.message.date} | ${data.message.time}</span>
                </div>` : ''}
                <textarea class="message-edit-area ${data.message.font}" placeholder="${data.message.content}">${data.message.content}</textarea>
            </div>
            <div class="profile-picture ${data.message.profile ? data.message.profile : "profile-1"} user">
                <span class="message-profile-picture-badge">${data.message.badge ? data.message.badge : "🎀"}</span>
            </div>
        </div>
        `
    });
}

const contextMenu = document.querySelector(".context-menu");

function openMessageOverlay() {
    contextMenu.classList.remove('hidden');

    const messageID = selectedMessage.dataset.messageId;
    const serverID = GlobalSelectedServerID;
    const channelName = GlobalSelectedChannelName;

    fetch("/api/message/details", { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageID, serverID, channelName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message.deleted === true) {
            return;
        }
    });
    
    if (String(selectedMessage.dataset.senderId) === String(userID)) {
        contextMenuButtons = contextMenu.querySelector(".context-menu-buttons");
        contextMenuButtons.innerHTML = '';
        
        const deleteMessageButton = document.createElement('button');
        deleteMessageButton.classList.add("delete-message");

        deleteMessageButton.innerHTML += 
        `
        <img src="icons/trash.svg" alt="delete">
        Delete
        `

        deleteMessageButton.addEventListener('click', () => {
            if (messageSelected) {
                const messageID = selectedMessage.dataset.messageId;
                socket.emit('delete-message', {
                    messageID,
                    userID: userID,
                    serverID: GlobalSelectedServerID,
                    channelName: GlobalSelectedChannelName
                });
            }
            else {
                showToast("select a message to delete smh");
            }
        });

        contextMenuButtons.appendChild(deleteMessageButton);

        const editMessageButton = document.createElement('button');
        editMessageButton.classList.add("edit-message");

        editMessageButton.addEventListener('click', () => {
            toggleTransparent();
            toggleEditMessage();
            setEditMessage();
        });

        editMessageButton.innerHTML += 
        `
        <img src="icons/edit.svg" alt="edit">
        Edit
        `

        contextMenuButtons.appendChild(editMessageButton);
    }
    else {
        contextMenuButtons = contextMenu.querySelector(".context-menu-buttons");
        contextMenuButtons.innerHTML = '';
    }
}

function closeMessageOverlay() {
    contextMenuButtons = contextMenu.querySelector(".context-menu-buttons");
    contextMenuButtons.innerHTML = '';

    contextMenu.classList.add('hidden');
}

function moveMessageOverlay(x, y) {
    if (messageSelected) {
        contextMenu.style.left = x + "px"
        contextMenu.style.top = y + "px"
    }
}

// NEW: This builds the HTML for ONE message and sticks it at the bottom
function appendSingleMessage(data) {
    const isMe = data.message.senderid === userID;
    const isStacked = data.message.stacked;
    const isNewDay = data.message.isNewDay;

    if (isNewDay) {
        const dividerHTML = `
            <div class="date-divider">
                <span class="date-label">${data.message.date}</span>
            </div>`;
        channelMessageHolder.insertAdjacentHTML('beforeend', dividerHTML);
    }

    let messageWrapper = document.createElement('div');
    messageWrapper.classList.add("message-wrapper");
    
    messageWrapper.dataset.messageId = data.message.id;
    messageWrapper.dataset.senderId = data.message.senderid;

    if (isMe) {
        messageWrapper.innerHTML = `
            <div class="reaction-wrapper">
                
            </div>
            <div class="message ${data.message.theme} user">
                ${data.message.edited ? `<span class="edited-tag">EDITED</span>` : ``}
                ${!isStacked ? `
                    <div class="message-details">
                        <span class="sender-username" style="color: ${data.message.roleColor}">${data.message.roleBadge ? data.message.roleBadge : ''} ${data.message.senderName}</span>
                        <span class="timestamp">${data.message.date} | ${data.message.time}</span>
                    </div>` : ''}
                <p class="message-content ${data.message.font} ${data.message.deleted ? "deleted" : ""}">${data.message.content}</p>
            </div>
            <div class="profile-picture ${data.message.profile ? data.message.profile : "profile-1"} user">
                <span class="message-profile-picture-badge">${data.message.badge ? data.message.badge : "🎀"}</span>
            </div>
        `;
        messageWrapper.classList.add("user");
        if (isStacked) { messageWrapper.classList.add("stacked") }
    }
    else {
        messageWrapper.innerHTML = `
            <div class="profile-picture ${data.message.profile ? data.message.profile : "profile-1"}">
                <span class="message-profile-picture-badge">${data.message.badge ? data.message.badge : "🎀"}</span>
            </div>
            <div class="message ${data.message.theme}">
                ${data.message.edited ? `<span class="edited-tag">EDITED</span>` : ``}
                ${!isStacked ? `
                    <div class="message-details">
                        <span class="sender-username" style="color: ${data.message.roleColor}">${data.message.roleBadge ? data.message.roleBadge : ''} ${data.message.senderName}</span>
                        <span class="timestamp">${data.message.date} | ${data.message.time}</span>
                    </div>` : ''}
                <p class="message-content ${data.message.font} ${data.message.deleted ? "deleted" : ""}">${data.message.content}</p>
            </div>
            <div class="reaction-wrapper">
                
            </div>
        `;
        if (isStacked) { messageWrapper.classList.add("stacked") }
    }
        
    const reactionWrapper = messageWrapper.querySelector('.reaction-wrapper');

    if (data.message.reactions) {
        reactionWrapper.innerHTML = '';

        for (const [emoji, userIDs] of Object.entries(data.message.reactions)) {
            const count = userIDs.length;

            const holder = document.createElement('div');
            holder.classList.add('reaction-holder');

            const content = document.createElement('p');
            content.classList.add('reaction-content');
            content.textContent = emoji;

            const counter = document.createElement('p');
            counter.classList.add('reaction-count');
            counter.textContent = `x${count}`;

            holder.appendChild(content);
            holder.appendChild(counter);
            reactionWrapper.appendChild(holder);
        }
    }

    const messageWrapperProfile = messageWrapper.querySelector('.profile-picture');
    messageWrapperProfile.addEventListener('click', (e) => {
        if (!profileDiv.classList.contains('visible')) {
            openProfileDiv(Number(data.message.senderid), e);
        }
        else if (profileDiv.classList.contains('visible')) {
            closeProfileDiv();
        }
    });

    attachMessageListeners(messageWrapper, data);

    channelMessageHolder.appendChild(messageWrapper);
    scrollToBottomSmooth(channelMessageHolder);
}

document.addEventListener('click', (e) => {
    // Skip if clicking inside context menu or modals
    const exceptions = [
        contextMenu,
        transparent,
        editMessageModal,
        profileDiv
    ];

    for (const el of exceptions) {
        if (el && el.contains(e.target)) return;
    }

    if (profileDiv.classList.contains('visible')) {
        profileDiv.classList.remove('visible');
    }    

    // Only deselect if a message is actually selected
    if (messageSelected && selectedMessage) {
        selectedMessage.classList.remove('selected');
        selectedMessage = null;
        messageSelected = false;

        closeMessageOverlay();
    }
});

document.addEventListener('keydown', (key) =>  {
    if (key.key === "Escape") {
        if (profileDiv.classList.contains('visible')) {
            closeProfileDiv();
        }
    }
});

sendButton.addEventListener('click', handleSendMessage);

mainInput.addEventListener('keydown', (key) => {
    if (key.key === "Enter") {
        handleSendMessage();
    }
});

const profileDiv = document.querySelector(".profile-user");

const profileDivBanner = document.querySelector(".user-banner-1");

const profileDivProfile = document.querySelector(".profile-user-profile");
const profileDivProfileBadge = document.querySelector(".profile-user-badge");
const profileDivUsername = document.querySelector(".profile-user-username");
const profileDivUserID = document.querySelector(".profile-user-userid");
const profileDivBio = document.querySelector(".profile-user-bio");

const profileDivBadge1 = document.querySelector(".user-banner-badge-1");
const profileDivBadge2 = document.querySelector(".user-banner-badge-2");
const profileDivBadge3 = document.querySelector(".user-banner-badge-3");

const profileControls = profileDiv.querySelector(".profile-controls");

let profileAdd;

function positionProfileModal(event) {
    const CARD_WIDTH = 350;   // match your CSS
    const CARD_HEIGHT = 416;  // approximate
    const MARGIN = 12;

    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;

    let left = x + MARGIN;
    let top = y;

    if (left + CARD_WIDTH > window.innerWidth - MARGIN) {
        left = x - CARD_WIDTH - MARGIN;
    }

    if (top + CARD_HEIGHT > window.innerHeight - MARGIN) {
        top = window.innerHeight - CARD_HEIGHT - MARGIN;
    }

    top  = Math.max(MARGIN, top);
    left = Math.max(MARGIN, left);

    profileDiv.style.position = 'fixed';
    profileDiv.style.left = `${left}px`;
    profileDiv.style.top  = `${top}px`;
}

function openProfileDiv(userid, event) {
    fetch("/api/users/details", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "userID": userid })
    })
    .then(response => response.json())
    .then(data => {
        positionProfileModal(event);

        const user = data.userData;

        if (user.userid === userID) {
            profileControls.style.display = "none";
        }
        else {
            profileControls.style.display = "flex";
        }

        profileControls.innerHTML = "";

        profileDiv.classList = "profile-user visible";
        profileDiv.classList.add(user.profileTheme);

        profileDivBanner.classList = "user-banner";
        profileDivBanner.classList.add(user.banner);
        
        profileDivProfile.classList = "profile-user-profile" 
        profileDivProfile.classList.add(user.profile);
        profileDivProfileBadge.textContent = user.badge;

        profileDivUsername.textContent = user.username;
        profileDivUserID.textContent = `#` + user.userid; 
        profileDivBio.textContent = user.bio;

        profileDivBadge1.textContent = user.badge1;
        profileDivBadge2.textContent = user.badge2;
        profileDivBadge3.textContent = user.badge3;

        fetch("/api/users/friendship-relation", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderID: userID, receiverID: userid })
        })
        .then(response => response.json())
        .then(data => {
            profileAdd = document.createElement('button');
            if (data.message === "resolved") {
                profileAdd.style.backgroundColor = '#E66460';
                profileAdd.innerHTML = `<img src="icons/unfriend.svg" alt="Unfriend" title="Unfriend">`
                profileAdd.dataset.type = "unfriend";
            }
            else if (data.message === "pending") {
                profileAdd.style.backgroundColor = '#6B7280';
                profileAdd.innerHTML = `<img src="icons/pending.svg" alt="Pending" title="Pending">`
                profileAdd.disabled = true;
            }
            else {
                profileAdd.style.backgroundColor = '#4FB371';
                profileAdd.innerHTML = `<img src="icons/add-friend.svg" alt="Friend" title="Friend">`
                profileAdd.dataset.type = "available";
            }

            profileAdd.dataset.targetid = user.userid;
            profileControls.appendChild(profileAdd);
        })
    });
}


function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
}

profileControls.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const type = button.dataset.type;
    const targetID = button.dataset.targetid;

    if (type === "available") {
        const senderID = userID;
        const receiverID = targetID;
        const time = Date.now();

        fetch("/api/friend-request/send", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderID, receiverID, time })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === "you tryna friend a friend??") {
                showToast("you really tryna friend a friend you clown?");
                return;
            }
            else if (data.message === "already have a friend request with them") {
                showToast(`active friend request with ${data.receiverName} already`);
                return;
            }
            if (data.message === "friend request sent") {
                showToast(`friend request sent to ${data.receiverName}`);
                button.style.backgroundColor = '#6B7280';
                button.innerHTML = `<img src="icons/pending.svg" alt="Pending" title="Pending">`
                button.disabled = true;
            }
        })
    }
    else if (type === "unfriend") {
        const receiverID = targetID;

        fetch("/api/users/friend/remove", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendID: receiverID, userID })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === "friend removed") {
                showToast(`removed friend. you did your brain cells a favor`)
                profileAdd.style.backgroundColor = '#4FB371';
                profileAdd.innerHTML = `<img src="icons/add-friend.svg" alt="Friend" title="Friend">`
                profileAdd.dataset.type = "available";
                return;
            }
        })
    }
});

function closeProfileDiv() {
    if (profileDiv.classList.contains('visible')) {
        profileDiv.classList.remove('visible');
    }
}

function displayMessages(channelName, serverid) {
    fetch("/api/channels", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "channelName": channelName, "serverID": serverid })
    })
    .then(response => response.json())
    .then(data => {
        if (GlobalSelectedChannelName !== "DM") {
            channelMessageHolder.innerHTML = '';
        }
        channelHeader.innerHTML = data.selectedChannel.name;

        data.selectedChannel.messages.forEach((message, index) => {
            const prev = data.selectedChannel.messages[index - 1];
            const isNewDay = !prev || prev.date !== message.date;

            if (isNewDay) {
                const dividerHTML = `
                    <div class="date-divider">
                        <span class="date-label">${message.date}</span>
                    </div>`;
                channelMessageHolder.insertAdjacentHTML('beforeend', dividerHTML);
            }

            appendSingleMessage({ message: message });
        });
    });
}

const PERMISSIONS = {
    all: ["delete_server", "edit_server", "manage_channels", "manage_roles", "kick", "ban", "delete_messages", "send_messages"],
    admin: ["kick", "ban", "delete_messages", "send_messages", "manage_channels"],
    member: ["send_messages"]
}

function displayServers(userID) {
    fetch("/api/servers", { 
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"userID": userID})
    })
    .then(response => response.json())
    .then(data => {
        serversDiv.innerHTML = ''
        
        data.userServers.forEach((serverName, index) => {
            let userServerObjects = data.userServerObjects;

            const serverButton = document.createElement("button");
            serverButton.classList.add('server-button');

            let serverIcon = document.createElement('img');
            serverIcon.src = `icons/${userServerObjects[index].icon}.svg`
            serverButton.append(serverIcon);

            let serverDiv = document.createElement('div');
            serverDiv.classList.add('server');
            serverDiv.classList.add(userServerObjects[index].icon);

            let serverNameP = document.createElement('p');
            serverNameP.classList.add('sr-only');
            serverNameP.innerHTML = serverName;

            serverDiv.append(serverButton);
            serverDiv.append(serverNameP);
            
            serversDiv.append(serverDiv);   

            serverDiv.addEventListener('click', () => {
                mainContentBottomLeft.innerHTML = 
                `
                <div class="server-details">
                    <div class="server-banner">
                        <img src="icons/${userServerObjects[index].banner}.svg">
                    </div>
                    <p class="about">"Quote appears here."</p>
                    <p class="server-members">Members: --</p>
                    <p class="server-channels">Channels: --</p>
                </div>
                <div class="channels-wrapper">
                    <h2>CHANNELS</h2>
                    <div class="channels">
                    </div>
                </div>
                `
                
                rightSidebar.innerHTML = 
                `
                <h2>MEMBERS</h2>
                <div class="members">
                </div>
                `

                let newAbout = mainContentBottomLeft.querySelector(".about")
                let newChannelsDiv = mainContentBottomLeft.querySelector(".channels");
                let newServerMembers = mainContentBottomLeft.querySelector(".server-members");
                let newServerChannels = mainContentBottomLeft.querySelector(".server-channels");

                let newMembersDiv = rightSidebar.querySelector(".members");

                const allServers = document.querySelectorAll('.server');
                allServers.forEach(server => server.classList.remove('active'));

                serverDiv.classList.add('active');

                fetch("/api/server/details", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "serverName": serverDiv.querySelector('p').textContent })
                })
                .then(response => response.json())
                .then(data => {
                    newMembersDiv.innerHTML = '';
                    newChannelsDiv.innerHTML = '';

                    const selectedServer = data.selectedServer;
                    GlobalSelectedServerID = data.selectedServer.serverid;
                
                    serverNameHeading.innerHTML = data.selectedServer.serverName;
                    newAbout.innerHTML = `"${data.selectedServer.about}"`;
                    newServerMembers.innerHTML = `Members: ${data.selectedServer.members}`;
                    newServerChannels.innerHTML = `Channels: ${ data.selectedServer.channelsno}`;
                        
                    serverSettingsButton = document.querySelector(".header-server-settings");

                    if (String(data.selectedServer.ownerid) === String(userID)) {
                        serverSettingsButton.classList.remove('hidden');
                    }
                    else {
                        serverSettingsButton.classList.add('hidden');
                    }

                    const memberIDS = [];
    
                    selectedServer.memberids.forEach(member => {
                        memberIDS.push(member);
                    });

                    fetch("/api/server/members", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "memberIDS": memberIDS })
                    })
                    .then(response => response.json())
                    .then(data => {
                        const members = data.members;
                        const userRole = selectedServer.roles.find(role => role.holders.includes(Number(userID)));

                        GlobalPermissions = [];
                        
                        if (!userRole) {
                            GlobalPermissions.push(PERMISSIONS.member)
                        } else if (userRole.permissions === 'all') {
                            GlobalPermissions = PERMISSIONS.all
                        } else if (userRole.permissions === 'administrator') {
                            GlobalPermissions = PERMISSIONS.admin
                        } else if (userRole.permissions === "member") {
                            GlobalPermissions = PERMISSIONS.member
                        } else {
                            GlobalPermissions = PERMISSIONS.member
                        }
                        
                        selectedServer.roles.forEach(role => {
                            const roleDiv = document.createElement('div');
                            roleDiv.classList.add(role.name.replace(/\s+/g, '-') + 'XYZ');
                            roleDiv.innerHTML += `<p style="color: ${role.color}; font-weight: 600; font-size: 1.1rem; margin-bottom: 10px;">${role.name} ${role.badge} </p>`
                            newMembersDiv.appendChild(roleDiv);
                        })

                        members.forEach(member => {
                            const memberDiv = document.createElement('div');
                            memberDiv.classList.add('member');
                            
                            const memberRole = selectedServer.roles.find(role => role.holders.includes(Number(member.userid)));

                            const html = `
                                <div class="member-profile ${member.profile}">
                                    <span class="member-badge">${member.badge}</span>
                                </div>
                                <p>${member.username}</p>
                            `
                            memberDiv.innerHTML += html;
                            memberDiv.dataset.userid = member.userid;

                            memberDiv.addEventListener('click', (e) => {
                                openProfileDiv(Number(member.userid), e);
                            });

                            const roleDiv = newMembersDiv.querySelector(`div.${memberRole.name.replace(/\s+/g, '-') + 'XYZ'}`);
                            roleDiv.appendChild(memberDiv);
                        });
                    })

                    console.log(GlobalPermissions);

                    selectedServer.channels.forEach(channel => {

                        const newChannelButton = document.createElement("button");
                        newChannelButton.innerHTML = channel.name;
                        newChannelButton.classList.add('channel-button');

                        newChannelButton.addEventListener('click', () => {
                            GlobalSelectedChannelName = channel.name;

                            const allChannels = document.querySelectorAll('.channel-button');
                            allChannels.forEach(channel => channel.classList.remove('active'));

                            newChannelButton.classList.add('active');

                            const roomName = `${GlobalSelectedServerID}_${GlobalSelectedChannelName}`;

                            socket.emit('join-room', roomName);

                            displayMessages(GlobalSelectedChannelName, GlobalSelectedServerID);
                        });

                        newChannelsDiv.appendChild(newChannelButton);
                    });
                });
            });      
        });
    });
};

if (navigator.userAgentData) {
  const isMobile = navigator.userAgentData.mobile; 
  const platform = navigator.userAgentData.platform;
  headerSpan.textContent = isMobile ? ".Mobile" : ".PC", platform;
}

createButton.addEventListener('click', () => {
    toggleCreate();
    toggleTransparent();
});

closeCreateModal.addEventListener('click', () => {
    toggleCreate();
    toggleTransparent();
});

const serverSettingsModal = document.querySelector(".server-settings");
const serverSettingsModalWrapper = document.querySelector(".server-settings-wrapper");

function toggleServerSettings() {
    serverSettingsModal.classList.toggle('hidden');
    serverSettingsModalWrapper.classList.toggle('hidden');
}

const closeServerSettings = document.querySelector(".server-settings button.back");
closeServerSettings.addEventListener('click', () => {
    toggleServerSettings();
    toggleTransparent();
});

function displayUsername(username) {
    const greetings = [
        `pookie, ${username}!`,
        `${username} my honey bun sugar plum`,
        `${username}, how ya doin`,
        `${username} is goated, fr fr`,
        `it's THE legendary ${username}!`,
        `can't believe i can meet you, THE ${username}!`,
        `psst, im a robot ${username}`,
        `${username}, stop being so legendary, it's distracting.`,
        `${username}, keep it 100, fr fr`,
        `ever took cocaine, ${username}?`,
        `im intimidated by your presence, ${username}`
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    usernameDisplay.innerHTML = randomGreeting;
}

function greetUser(username) {
    const welcomeBacks = [
        `welcome back ${username}`,
        `how ya doin, ${username}!`,
        `my goat! ${username}!`,
        `${username}, lookin good`,
        `${username}, whats your opinion on batman?`,
        `${username} is here!`,
        `commited any tax evasion recently, ${username}`,
        `get pelted with eggs or very squishy bricks, ${username}?`,
        `it's THE ${username}`,
        `go drink some water, ${username}`,
        `psst ${username}, im an AI`,
        `ate any plutonium bricks recently, ${username}?`,
        `you're looking dangerously goated, ${username}`,
        `${username}, best shape for a chicken nugget?`
    ];
    const randomWelcome = welcomeBacks[Math.floor(Math.random() * welcomeBacks.length)];
    usernameDisplay.innerHTML = randomWelcome;
}

function attachMessageListeners(messageWrapper, data) {
    // --- DESKTOP: right-click ---
    messageWrapper.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        // check deleted first
        if (data.message.deleted) return;

        selectedMessage = messageWrapper;
        messageSelected = true;

        // deselect others
        document.querySelectorAll(".message-wrapper").forEach(wrapper => {
            wrapper.classList.remove('selected');
        });
        messageWrapper.classList.add('selected');

        const x = e.clientX;
        const y = e.clientY;

        moveMessageOverlay(x, y);
        openMessageOverlay();
    });

    // --- MOBILE: long-press ---
    let touchTimer = null;
    const holdDuration = 200; // ms
    let touchMoved = false;

    messageWrapper.addEventListener('touchstart', (e) => {
        touchMoved = false;

        touchTimer = setTimeout(() => {
            if (data.message.deleted) return; // deleted
            if (touchMoved) return; // finger moved

            selectedMessage = messageWrapper;
            messageSelected = true;

            // deselect others
            document.querySelectorAll(".message-wrapper").forEach(wrapper => {
                wrapper.classList.remove('selected');
            });
            messageWrapper.classList.add('selected');

            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            moveMessageOverlay(x, y);
            openMessageOverlay();
        }, holdDuration);
    });

    messageWrapper.addEventListener('touchmove', () => {
        touchMoved = true;
        clearTimeout(touchTimer);
        touchTimer = null;
    });

    messageWrapper.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
        touchTimer = null;
    });
}