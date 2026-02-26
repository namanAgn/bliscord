const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

app.use(express.json()); // allow JSON in requests
app.use(express.static('client')); // serve HTML/CSS/JS from /client

// Hand over to socket-server.js that acts as the commentator
const socketLogic = require('./socket-server.js');
const { connectedUsers } = socketLogic(io);

function notifyUser(targetID, event, data) {
    const isOnline = !!connectedUsers[String(targetID)];
    
    if (isOnline) {
        io.to(`user_${targetID}`).emit(event, data);
    } else {
        console.log("he ded lmao")
    }
}

// --- Notifications ---
app.post('/api/user/notifications', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/notifs.json', 'utf-8'));
    const userID = req.body.userID;
    const userNotifications = data[String(userID)];
    res.json({ userNotifications });
});

// --- Public servers ---
app.post('/api/public/servers', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const userID = req.body.userID;

    const publicServers = data.filter(server => {
        return server.public && !server.memberids.includes(userID);
    });

    res.json({ publicServers });
});

// --- User servers ---
app.post('/api/servers', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const userID = req.body.userID;

    const userServers = [];
    const userServerObjects = [];

    data.forEach(server => {
        if (server.memberids.includes(userID)) {
            userServers.push(server.serverName);
            userServerObjects.push(server);
        }
    });

    res.json({ userServers, userServerObjects });
});

// --- Generate Invite Code ---
function generateInviteCode(serverName) {
    const adjectives = ["cool", "epic", "pookie", "sketchy", "based", "glossy", "vibey"];
    const nouns = ["zone", "hangout", "realm", "corner", "hub", "pit", "cloud"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const cleanName = serverName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanName}-${adj}${noun}-${randomStr}`;
}

// --- Create Server ---
app.post('/api/server/create', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const lastServerID = data.length > 0 ? Number(data[data.length - 1].serverid) : -1;
    const newServerID = String(lastServerID + 1);
    const serverInviteCode = generateInviteCode(req.body.serverName);

    const roles = [
        { id: 0, name: "owner", holders: [0], permissions: ["all"], color: "#f5da7e", badge: "👑", default: false},
        { id: 0, name: "member", holders: [0], permissions: ["none"], color: "#ffffff", badge: "", default: true},
        { id: 0, name: "admin", holders: [0], permissions: ["admin"], color: "#000000", badge: "🔪", default: false}
    ]

    const server = {
        serverName: req.body.serverName,
        invite: serverInviteCode,
        public: req.body.public,
        serverid: newServerID,
        ownerid: req.body.userID,
        members: req.body.members,
        about: req.body.about,
        memberids: req.body.memberids,
        memberNames: req.body.memberNames,
        channelsno: req.body.channelsno,
        channels: req.body.channels,
        icon: req.body.icon,
        banner: req.body.banner,
        roles: roles
    };

    data.push(server);
    fs.writeFileSync('dummy/servers.json', JSON.stringify(data, null, 2));

    res.json({ message: "honeybun, your server is ready" });
});

// --- Server details ---
app.post('/api/server/details', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const serverName = req.body.serverName;
    const selectedServer = data.find(server => server.serverName === serverName);
    res.json({ selectedServer });
});

// --- Message details ---
app.post('/api/message/details', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const { messageID, serverID, channelName } = req.body;
    
    if (channelName === "DM") {
        const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));
        const dm = dms.find(dm => Number(dm.id) === Number(serverID));
        const message = dm.messages.find(msg => String(msg.id) === String(messageID));

        return res.json({ message })
    }
    else {
        const selectedServer = data.find(server => server.serverid === serverID);
        const selectedChannel = selectedServer.channels.find(channel => channel.name === channelName);
        const message = selectedChannel.messages.find(msg => String(msg.id) === String(messageID));

        return res.json({ message });
    }
});

app.post('/api/server/members', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const memberIDS = req.body.memberIDS;

    let members = [];

    memberIDS.forEach(id => {
        members.push(data.find(user => Number(user.userid) === Number(id)));
    });

    res.json({ members })
});

// --- Channels ---
app.post('/api/channels', (req, res) => {
    const serverData = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));
    const { serverID, channelName } = req.body;
    
    if (channelName === "DM") {
        const dm = dms.find(dm => Number(dm.id) === Number(serverID));

        const selectedChannel = {
            messages: dm.messages,
            name: "DM"
        }

        return res.json({ selectedChannel });
    }

    const selectedServer = serverData.find(server => server.serverid === serverID);
    if (!selectedServer) return res.status(404).json({ error: "Server not found" });

    const selectedChannel = selectedServer.channels.find(channel => channel.name === channelName);
    return res.json({ selectedChannel });
});

// --- User login ---
app.post('/api/user/login', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const { username, password } = req.body;
    const userData = data.find(user => user.username === username);

    if (!userData) {
        return res.json({ message: "account doesnt exist honeybun" });
    }

    if (userData.password === password) {
        return res.json({
            message: "welcome back my beloved",
            userID: userData.userid,
            selectedProfile: userData.profile,
            selectedBadge: userData.badge,
            userData: userData  // ← add this
        });
    } else {
        return res.json({ message: "forgot your password my pookie bear?" });
    }
});

// --- Server join ---
app.post('/api/server/join', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const { serverid, userID, username } = req.body;

    const selectedServer = data.find(server => server.serverid === serverid);
    if (selectedServer) {
        selectedServer.memberids.push(userID);
        selectedServer.memberNames.push(username);
        selectedServer.members = selectedServer.memberids.length;
        selectedServer.roles.forEach(role => {
            if (role.default) {
                role.holders.push(Number(userID));
            }
        });

        fs.writeFileSync('dummy/servers.json', JSON.stringify(data, null, 2));
        return res.json({ message: "server joined, fr fr" });
    }

    res.status(404).json({ message: "server not found, rip" });
});

// --- Username check ---
app.post('/api/user/username/check', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const { username } = req.body;

    const matchedUser = data.find(user => user.username === username);

    if (!matchedUser) return res.json({ message: "username valid fr fr" });
    if (matchedUser.deleted === true) return res.json({ message: "account deleted 💀" });

    return res.json({ message: "username taken my guy" });
});

// --- User signup ---
app.post('/api/users/signup', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const { username, password, selectedProfile, selectedBadge, selectedFont, selectedTheme } = req.body;

    const lastUserID = data.length > 0 ? Number(data[data.length - 1].userid) : 0;
    const userID = String(lastUserID + 1);

    const bios = [
        `${username} believes gravity is optional, rules are suggestions, and every glass of water exists purely to be pushed off tables.`,
        `${username} operates on three core principles: eat aggressively, nap artistically, and sprint at 3 a.m. like rent is due.`,
        `${username} has never paid taxes, never will, and still lives a more luxurious life than most working adults.`,
        `${username} stares into empty corners, sees things beyond mortal comprehension, then demands snacks like nothing happened.`,
        `${username} is powered by zoomies, mild chaos, and the unwavering belief that keyboards exist solely for sitting on.`,
        `${username} considers closed doors a personal attack and will scream about it like a tiny emotional air raid siren.`,
        `${username} commits small crimes daily and relies on cuteness as a legally binding defense strategy.`,
        `${username} treats every cardboard box like premium real estate and every human like unpaid staff.`
    ];

    const generatedBio = bios[Math.floor(Math.random() * bios.length)];

    const userData = {
        username,
        userid: userID,
        password,
        profile: selectedProfile,
        badge: selectedBadge,
        font: selectedFont,
        theme: selectedTheme,
        bio: generatedBio,
        links: [],
        banner: "user-banner-1",
        badge1: "🎀",
        badge2: "⚡",
        badge3: "🐰",
        profileTheme: "profile-theme-1",
        serversJoined: 0,
        messagesSent: 0,
        reactionsSent: 0,
        friendsAdded: 0,
        minutesOnline: 0,
        averageSession: 0,
        deleted: false
    };

    data.push(userData);
    fs.writeFileSync('dummy/users.json', JSON.stringify(data, null, 2));

    res.json({ message: "signed up, fr fr", userID });
});

// --- Get user details ---
app.post('/api/users/details', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const userID = Number(req.body.userID);
    const user = data.find(user => Number(user.userid) === userID);
    res.json({ userData: user });
});

// --- User stats ---
app.post('/api/users/stats', (req, res) => {
    const userData = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const serverData = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const userID = String(req.body.userID);

    const userServers = [];
    const userServerObjects = [];

    serverData.forEach(server => {
        if (server.memberids.includes(userID)) {
            userServers.push(server.serverName);
            userServerObjects.push(server);
        }
    });

    const user = userData.find(u => String(u.userid) === userID);
    if (!user) console.error("User not found in users.json for senderid:", userID);

    const userStats = {
        serversJoined: userServers.length,
        messagesSent: user.messagesSent,
        reactionsSent: user.reactionsSent,
        friendsAdded: user.friendsAdded,
        minutesOnline: user.minutesOnline,
        averageSession: user.averageSession
    };

    res.json({ userStats });
});

// --- Delete user ---
app.post('/api/users/delete', (req, res) => {
    const userData = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const serverData = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    const userID = String(req.body.userID);
    const user = userData.find(u => u.userid === userID);

    if (!user) return res.status(404).json({ error: "user not found" });

    user.username = "[Deleted User]";
    user.profile = "profile-deleted";
    user.badge = "💀";
    user.font = "message-font-1";
    user.theme = "msg-theme-default";
    user.deleted = true;

    // Update messages everywhere
    serverData.forEach(server => {
        server.channels.forEach(channel => {
            channel.messages.forEach(message => {
                if (message.senderid === userID) {
                    message.senderName = "[Deleted User]";
                    message.profile = "profile-deleted";
                    message.badge = "💀";
                    message.font = "message-font-1";
                    message.theme = "msg-theme-default";
                }
            });
        });
    });

    fs.writeFileSync('dummy/users.json', JSON.stringify(userData, null, 2));
    fs.writeFileSync('dummy/servers.json', JSON.stringify(serverData, null, 2));

    res.json({ message: "user deleted" });
});

// --- Save/update profile ---
app.post('/api/user/profile/update', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
        
    const userID = req.body.userID;
    
    const userData = data.find(user => String(user.userid) === String(userID))
    
    const username = req.body.username;
    const profile = req.body.profile;
    const badge = req.body.badge;
    const banner = req.body.banner;
    const badge1 = req.body.badge1;
    const badge2 = req.body.badge2;
    const badge3 = req.body.badge3;
    const profileTheme = req.body.profileTheme;
    
    userData.username = username;
    userData.banner = banner ?? userData.banner;
    userData.badge1 = badge1 ?? userData.badge1;
    userData.badge2 = badge2 ?? userData.badge2;
    userData.badge3 = badge3 ?? userData.badge3;
    userData.profileTheme = profileTheme ?? userData.profileTheme;
    userData.profile = profile ?? userData.profile;
    userData.badge = badge ?? userData.badge;

    fs.writeFileSync('dummy/users.json', JSON.stringify(data, null, 2));

    res.json({ message: "profile updated" })
});

app.post('/api/user/username/change', (req, res) => {
    const userData = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const serverData = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
    
    const { userID, username, oldUsername } = req.body;
    
    // Update user in users.json
    const user = userData.find(u => String(u.userid) === String(userID));
    if (!user) return res.status(404).json({ error: "user not found" });
    
    user.username = username;
    
    // Update messages everywhere
    serverData.forEach(server => {
        // Update member list
        const memberIndex = server.memberNames.indexOf(oldUsername);
        if (memberIndex !== -1) {
            server.memberNames[memberIndex] = username;
        }
        
        // Update messages
        server.channels.forEach(channel => {
            channel.messages.forEach(message => {
                if (message.senderid === userID) {
                    message.senderName = username;
                }
            });
        });
    });
    
    fs.writeFileSync('dummy/users.json', JSON.stringify(userData, null, 2));
    fs.writeFileSync('dummy/servers.json', JSON.stringify(serverData, null, 2));
    
    res.json({ message: "username changed" });
});

app.post('/api/friend-request/send', (req, res) => {
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const requests = JSON.parse(fs.readFileSync('dummy/requests.json', 'utf-8'));

    const { senderID, receiverID, time } = req.body;

    if (senderID == receiverID) {
        return res.json({ message: "cannot friend yourself" });
    }

    const sender = users.find(u => u.userid == senderID);
    const receiver = users.find(u => u.userid == receiverID);

    if (!sender || !receiver) {
        return res.json({ message: "invalid users" });
    }
    
    if (sender?.friends?.some(f => String(f) === String(receiverID))) {
        return res.json({ message: "you tryna friend a friend??" });
    }
    const existingRequest = requests.find(r =>
        (r.senderid == senderID && r.receiverid == receiverID) ||
        (r.senderid == receiverID && r.receiverid == senderID)
    );

    if (existingRequest) {
        return res.json({ message: "already have a friend request with them", receiverName: receiver.username  });
    }

    const newRequest = {
        id: requests.length ? requests[requests.length - 1].id + 1 : 1,
        senderid: Number(senderID),
        receiverid: Number(receiverID),
        status: "pending",
        timestamp: time
    };

    requests.push(newRequest);

    notifyUser(receiverID, 'friend-request-received', {
        requestID: newRequest.id,
        senderID,
        senderName: sender.username,
        senderProfile: sender.profile,
        senderBadge: sender.badge
    });

    fs.writeFileSync('dummy/requests.json', JSON.stringify(requests, null, 2));

    return res.json({ message: "friend request sent", receiverName: receiver.username });
});

app.post('/api/users/pending-requests', (req, res) => {
    const requests = JSON.parse(fs.readFileSync('dummy/requests.json', 'utf-8'));
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));

    const senderID = req.body.senderID;

    let pendingRequests = [];
    let pendingRequestUsers = [];

    requests.forEach(request => {
        if (Number(request.senderid) === Number(senderID)) {
            pendingRequests.push(request);
            pendingRequestUsers.push(users.find(user => Number(user.userid) === Number(request.receiverid)));
        }
    });

    return res.json({ pendingRequests, pendingRequestUsers })
})

app.post('/api/users/incoming-requests', (req, res) => {
    const requests = JSON.parse(fs.readFileSync('dummy/requests.json', 'utf-8'));
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    
    const senderID = req.body.senderID;

    let incomingRequests = [];
    let incomingRequestUsers = [];

    requests.forEach(request => {
        if (Number(request.receiverid) === Number(senderID)) {
            incomingRequests.push(request);
            incomingRequestUsers.push(users.find(user => Number(user.userid) === Number(request.senderid)));
        }
    });

    return res.json({ incomingRequests, incomingRequestUsers })
})

app.post('/api/users/friendship-relation', (req, res) => {
    const requests = JSON.parse(fs.readFileSync('dummy/requests.json', 'utf-8'));
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));

    const senderID = req.body.senderID;
    const receiverID = req.body.receiverID;

    const sender = users.find(u => String(u.userid) === String(senderID));

    if (sender?.friends?.some(f => String(f) === String(receiverID))) {
        return res.json({ message: "resolved" });
    }

    const request = requests.find(r =>
        ((String(r.senderid) === String(senderID) && String(r.receiverid) === String(receiverID)) ||
        (String(r.senderid) === String(receiverID) && String(r.receiverid) === String(senderID))) &&
        r.status === "pending"
    );

    if (request) return res.json({ message: "pending" });

    return res.json({ message: "available" });
});

app.post('/api/users/friend-requests/cancel', (req, res) => {
    const requests = JSON.parse(fs.readFileSync('dummy/requests.json', 'utf-8'));
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    
    const requestID = req.body.requestID;
    const userID = req.body.userID;

    const request = requests.find(request => Number(request.id) === Number(requestID));
    const sender = users.find(u => Number(u.userid) === Number(userID));

    if (request) {
        if (Number(request.senderid) === Number(userID)) {
            const updated = requests.filter(r => Number(r.id) !== Number(requestID));
            notifyUser(request.receiverid, 'friend-request-cancelled', {
                cancellerName: sender.username
            });
            
            fs.writeFileSync('dummy/requests.json', JSON.stringify(updated, null, 2));

            return res.json({ message: "request cancelled" })
        }
        else {
            return res.json({ message: "failed" })
        }
    }
})

app.post('/api/users/friend-requests/accept', (req, res) => {
    const requests = JSON.parse(fs.readFileSync('dummy/requests.json', 'utf-8'));
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));

    const requestID = req.body.requestID
    let request = requests.find(request => Number(request.id) === Number(requestID));
    
    if (request) {
        const receiverID = request.receiverid;
        const senderID = request.senderid;

        const receiver = users.find(user => Number(user.userid) === Number(receiverID))
        const sender = users.find(user => Number(user.userid) === Number(senderID))

        const alreadyFriends = receiver.friends?.some(f => String(f) === String(sender.userid));

        if (!alreadyFriends) {
            if (!receiver.friends) receiver.friends = [sender.userid];
            else receiver.friends.push(sender.userid);

            if (!sender.friends) sender.friends = [receiver.userid];
            else sender.friends.push(receiver.userid);
        }

        const updated = requests.filter(r => Number(r.id) !== Number(requestID));

        let lastDm = dms.length > 0 ? dms[dms.length - 1] : null;
        let newDmID = lastDm ? lastDm.id + 1 : 0;

        const dm = {
            id: Number(newDmID),
            participants: [Number(receiverID), Number(senderID)],
            messages: []
        }

        dms.push(dm);

        notifyUser(request.senderid, 'friend-request-accepted', {
            accepterName: receiver.username
        });

        fs.writeFileSync('dummy/requests.json', JSON.stringify(updated, null, 2));
        fs.writeFileSync('dummy/dms.json', JSON.stringify(dms, null, 2));
        fs.writeFileSync('dummy/users.json', JSON.stringify(users, null, 2));
        
        return res.json({ message: "request accepted", receiverUsername: receiver.username });
    }
});

app.post('/api/users/friend-requests/reject', (req, res) => {
    const requests = JSON.parse(fs.readFileSync('dummy/requests.json', 'utf-8'));
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));

    const requestID = req.body.requestID
    let request = requests.find(request => Number(request.id) === Number(requestID));
    
    if (request) {
        const senderUsername = users.find(user => Number(user.userid) === Number(request.senderid)).username;
            
        notifyUser(request.senderid, 'friend-request-rejected', {
            rejecterName: senderUsername
        });

        const updated = requests.filter(r => Number(r.id) !== Number(requestID));
        fs.writeFileSync('dummy/requests.json', JSON.stringify(updated, null, 2));

        return res.json({ message: "request rejected", senderUsername })
    }
});

app.post('/api/users/friend/remove', (req, res) => { 
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    
    const friendID = req.body.friendID;
    const userID = req.body.userID;

    const friend = users.find(user => Number(user.userid) === Number(friendID));
    const user = users.find(user => Number(user.userid) === Number(userID));

    const updatedFriend = friend.friends.filter(id => Number(id) !== Number(userID));
    friend.friends = updatedFriend;

    const updatedUser = user.friends.filter(id => Number(id) !== Number(friendID));
    user.friends = updatedUser;
    
    notifyUser(friend.userid, 'friend-removed', {
        removerName: user.username
    });
    
    fs.writeFileSync('dummy/users.json', JSON.stringify(users, null, 2));

    return res.json({ message: "friend removed" })
})

app.post('/api/users/friends', (req, res) => {
    const users = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
    const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));

    const userID = req.body.userID;

    const user = users.find(user => Number(user.userid) === Number(userID));

    let onlineFriends = [];
    let offlineFriends = [];

    let friendDms = [];

    user.friends.forEach(friend => {
        const friendData = users.find(u => String(u.userid) === String(friend));
        
        if (!friendData) {
            console.warn("Friend not found for id:", friend);
            return; // skip this one
        }

        const dm = dms.find(d => 
            d.participants.includes(Number(userID)) && 
            d.participants.includes(Number(friendData.userid))
        );

        if (!dm) {
            console.warn("No DM found between", userID, "and", friendData.userid);
            return; // skip instead of crash
        }

        friendDms.push(dm);

        if (connectedUsers.hasOwnProperty(String(friendData.userid))) {
            onlineFriends.push(friendData);
        } else {
            offlineFriends.push(friendData);
        }
    });

    return res.json({ onlineFriends, offlineFriends, friendDms })
});

// --- Start server ---
const PORT = 3000;
http.listen(PORT, '0.0.0.0', () => console.log('server gonna blow up fr fr'));
