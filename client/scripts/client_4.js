mainContentBottomLeft.addEventListener('click', (e) => {
    if (e.target.closest(".friend-requests")) {
        channelMessageHolder.innerHTML = '';
        channelMessageHolder.innerHTML += `
            <div class="friend-requests-section">
                <h2>SENT</h2>
                <div class="pending-requests"></div>
                <h2>INCOMING</h2>
                <div class="incoming-requests"></div>
            </div>
        `

        const pendingRequestsDiv = channelMessageHolder.querySelector(".pending-requests");
        const incomingRequestsDiv = channelMessageHolder.querySelector(".incoming-requests");

        fetch("/api/users/pending-requests", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderID: userID })
        })
        .then(res => res.json())
        .then(data => {
            const pendingRequests = data.pendingRequests;
            const pendingRequestUsers = data.pendingRequestUsers;

            pendingRequests.forEach((request, index) => {
                const time = timeAgo(request.timestamp);
                        
                const requestDiv = document.createElement('div');
                requestDiv.classList.add('incoming-request');
                requestDiv.innerHTML = `
                    <div class="incoming-request-left">
                        <div class="incoming-request-pfp ${pendingRequestUsers[index].profile}">
                            <span class="incoming-request-badge">${pendingRequestUsers[index].badge}</span>
                        </div>
                        <div class="incoming-request-details">
                            <p class="incoming-request-username">${pendingRequestUsers[index].username}</p>
                            <p class="incoming-request-userid">#${pendingRequestUsers[index].userid}</p>
                        </div>
                        <p class="incoming-request-timestamp">${time}</p>
                    </div>
                    <div class="incoming-request-controls"></div>
                `;

                const cancelButton = document.createElement('button');
                cancelButton.classList.add('cancel-sent-request');
                cancelButton.innerHTML = `<img src="icons/block.svg" alt="Reject">`;

                cancelButton.addEventListener('click', () => {
                    fetch("/api/users/friend-requests/cancel", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ requestID: request.id, userID: userID })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.message === "request cancelled") {
                            showToast(`request cancelled i guess, mr. cant socialize even online.`)
                            requestDiv.remove(); // works now because it's a real DOM element
                        }
                    })
                });

                requestDiv.querySelector('.incoming-request-controls').appendChild(cancelButton);
                pendingRequestsDiv.appendChild(requestDiv);
            });
        })

        fetch("/api/users/incoming-requests", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderID: userID })
        })
        .then(res => res.json())
        .then(data => {
            const incomingRequests = data.incomingRequests;
            const incomingRequestUsers = data.incomingRequestUsers;

            incomingRequests.forEach((request, index) => {
                const time = timeAgo(request.timestamp);

                const requestDiv = document.createElement("div");
                requestDiv.classList.add('incoming-request'); 
                requestDiv.innerHTML  = `
                    <div class="incoming-request-left">
                        <div class="incoming-request-pfp ${incomingRequestUsers[index].profile}">
                            <span class="incoming-request-badge">${incomingRequestUsers[index].badge}</span>
                        </div>
                        <div class="incoming-request-details">
                            <p class="incoming-request-username">${incomingRequestUsers[index].username}</p>
                            <p class="incoming-request-userid">#${incomingRequestUsers[index].userid}</p>
                        </div>
                        <p class="incoming-request-timestamp">${time}</p>
                        <div class="incoming-request-status"></div>
                    </div>
                    <div class="incoming-request-controls">
                    </div>
                `
                const controlsDiv = requestDiv.querySelector(".incoming-request-controls");

                const acceptButton = document.createElement('button');
                acceptButton.classList.add('add-incoming-request');
                acceptButton.innerHTML = `<img src="icons/add-friend.svg" alt="Add">`;

                acceptButton.addEventListener('click', () => {
                    fetch("/api/users/friend-requests/accept", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ requestID: request.id })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.message === "request accepted") {
                            showToast(`became friends with ${data.receiverUsername}. go talk to them.`)
                            requestDiv.remove();
                        }
                    })
                });

                const rejectButton = document.createElement('button');
                rejectButton.classList.add('reject-incoming-request');
                rejectButton.innerHTML = `<img src="icons/unfriend.svg" alt="Reject">`;

                rejectButton.addEventListener('click', () => {
                    fetch("/api/users/friend-requests/reject", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ requestID: request.id })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.message === "request rejected") {
                            showToast(`hope you feel better about yourself after rejecting ${data.senderUsername}.`)
                            requestDiv.remove();
                        }
                    })
                });
                
                controlsDiv.appendChild(acceptButton);
                controlsDiv.appendChild(rejectButton);

                incomingRequestsDiv.appendChild(requestDiv);
            })
        })
    }
    if (e.target.closest(".friends-list")) {
        channelMessageHolder.innerHTML = '';
        channelMessageHolder.innerHTML = `
            <div class="friend-list">
                <h2>ONLINE</h2>
                <div class="online-friends"></div>
                <h2>OFFLINE</h2>
                <div class="offline-friends"></div>
            </div>
        `

        const onlineFriendList = channelMessageHolder.querySelector('.online-friends');
        const offlineFriendList = channelMessageHolder.querySelector('.offline-friends');

        fetch('/api/users/friends', {
            method: "POST",
            headers: {  'Content-Type': 'application/json' },
            body: JSON.stringify({ userID: userID })
        })
        .then(response => response.json())
        .then(data => {
            if (data.onlineFriends.length > 0) {
                data.onlineFriends.forEach((friend, index)=> {
                    const friendListFriend = document.createElement('div');
                    friendListFriend.classList.add('friend-list-friend');
                
                    const friendDms = data.friendDms;
                    
                    const friendDM = friendDms[index];
                    const friendDMLastMessage = friendDM.messages.length > 0 ? friendDM.messages[friendDM.messages.length - 1] : null;

                    friendListFriend.innerHTML = `
                        <div class="friend-pfp ${friend.profile}">
                            <span class="friend-badge">${friend.badge}</span>
                        </div>
                        <div class="friend-details">
                            <div class="friend-details-top">
                                <p class="friend-username">${friend.username}</p>
                                <div class="friend-status online"></div>
                            </div>
                            <p class="friend-last-message-content">${friendDMLastMessage ? friendDMLastMessage.senderName : "giddu"}: ${friendDMLastMessage ? friendDMLastMessage.content : "wanna meet up for the 'i-fell' tower plan?"} <span class="friend-read-status">(READ)</span></p>
                        </div>
                        <div class="friend-list-last-message-time-container">
                            <p class="friend-list-last-message-time">${friendDMLastMessage ? friendDMLastMessage.time : "12h ago"} |  ${friendDMLastMessage ? friendDMLastMessage.date : "24 Feb 2026"}</p>
                        </div>
                        <div class="friend-list-friend-right">
                            <div class="friend-unread-status"></div>
                        </div>
                    `
        
                    friendListFriend.addEventListener('click', () => {
                        GlobalSelectedServerID = friendDM.id;
                        GlobalSelectedChannelName = 'DM';

                        socket.emit('join-room', `${friendDM.id}_DM`); // ← add this

                        channelMessageHolder.innerHTML = ''
                        channelMessageHolder.innerHTML = `
                            <div class="dm-topper">
                                <div class="dm-topper-friend-pfp ${friend.profile}">
                                    <span class="dm-topper-friend-badge">${friend.badge}</span>
                                </div>
                                <p class="muted margin">You are now chatting with</p>
                                <p class="dm-topper-friend-username">${friend.username}</p>
                                <p class="muted">Say hi</p>
                            </div>
                            <div class="dm-messages"></div>
                        `
                        
                        displayMessages(GlobalSelectedChannelName, GlobalSelectedServerID);
                    });

                    onlineFriendList.appendChild(friendListFriend);
                });
            }

            if (data.offlineFriends.length > 0) {
                data.offlineFriends.forEach((friend, index) => {
                    const friendListFriend = document.createElement('div');
                    friendListFriend.classList.add('friend-list-friend');
                
                    const friendDms = data.friendDms;
                    
                    const friendDM = friendDms[index];
                    const friendDMLastMessage = friendDM.messages.length > 0 ? friendDM.messages[friendDM.messages.length - 1] : null;

                    friendListFriend.innerHTML = `
                        <div class="friend-pfp ${friend.profile}">
                            <span class="friend-badge">${friend.badge}</span>
                        </div>
                        <div class="friend-details">
                            <div class="friend-details-top">
                                <p class="friend-username">${friend.username}</p>
                                <div class="friend-status offline"></div>
                            </div>
                            <p class="friend-last-message-content">${friendDMLastMessage ? friendDMLastMessage.senderName : "giddu"}: ${friendDMLastMessage ? friendDMLastMessage.content : "wanna meet up for the 'i-fell' tower plan?"} <span class="friend-read-status">(READ)</span></p>
                        </div>
                        <div class="friend-list-last-message-time-container">
                            <p class="friend-list-last-message-time">${friendDMLastMessage ? friendDMLastMessage.time : "12h ago"} |  ${friendDMLastMessage ? friendDMLastMessage.date : "24 Feb 2026"}</p>
                        </div>
                        <div class="friend-list-friend-right">
                            <div class="friend-unread-status"></div>
                        </div>
                    `
                    
                    friendListFriend.addEventListener('click', () => {
                        GlobalSelectedServerID = friendDM.id;
                        GlobalSelectedChannelName = 'DM';

                        socket.emit('join-room', `${friendDM.id}_DM`); // ← add this

                        channelMessageHolder.innerHTML = ''
                        channelMessageHolder.innerHTML = `
                            <div class="dm-topper">
                                <div class="dm-topper-friend-pfp ${friend.profile}">
                                    <span class="dm-topper-friend-badge">${friend.badge}</span>
                                </div>
                                <p class="muted margin">You are now chatting with</p>
                                <p class="dm-topper-friend-username">${friend.username}</p>
                                <p class="muted">Say hi</p>
                            </div>
                            <div class="dm-messages"></div>
                        `
                        
                        displayMessages(GlobalSelectedChannelName, GlobalSelectedServerID);
                    });

                    offlineFriendList.appendChild(friendListFriend);
                });
            }
        });
    }
})