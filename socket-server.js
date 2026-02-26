const fs = require('fs');
const typingState = {}; // serverID -> channelName -> userID -> info

module.exports = function(io) {
    const connectedUsers = {};

    io.on('connection', (socket) => {        
        const userID = socket.handshake.query.userID;
        socket.userID = userID; // ← ADD THIS LINE
        const connectTime = Date.now();

        socket.on('identify', (data) => {
            const id = String(data.userID || data);
            socket.userID = id;
            connectedUsers[id] = socket.id;
            socket.join(`user_${id}`); // personal room
            console.log(`user_${id} joined`);
        });

        socket.on('disconnect', () => {
            delete connectedUsers[String(userID)];
            console.log(`user_${userID} left`)

            const disconnectTime = Date.now();
            const minutesOnline = Math.round((disconnectTime - connectTime) / 60000);

            // Update JSON / DB
            const data = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));
            const user = data.find(u => u.userid === userID);
            if (user) {
                user["minutesOnline"] += minutesOnline;
                fs.writeFileSync('dummy/users.json', JSON.stringify(data, null, 2));
            }
        });

        socket.on('user-typing-start', (data) => {
            const serverID = data.serverID;
            const channelName = data.channelName;

            const roomName = `${serverID}_${channelName}`;

            const user = {
                "userID": data.userID,
                "username": data.username,
                "profile": data.profile,
                "badge": data.badge,
            }

            if (!typingState.hasOwnProperty(roomName)) { 
                typingState[roomName] = {};
            }

            typingState[roomName][user.userID] = user;

            io.to(roomName).emit('typing-update', { typingObject: typingState[roomName] });
        });

        socket.on('user-typing-stop', (data) => {
            const { serverID, channelName, userID } = data; // Cleaner way to get variables
            const roomName = `${serverID}_${channelName}`;

            if (typingState[roomName]) {
                delete typingState[roomName][userID];

                if (Object.keys(typingState[roomName]).length === 0) {
                    delete typingState[roomName];
                }
            }

            io.to(roomName).emit('typing-update', { 
                typingObject: typingState[roomName] || {} 
            });
        });

        socket.on('edit', (data) => {
            const roomName = `${data.serverID}_${data.channelName}`;

            if (data.channelName === "DM") {
                const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));
                
                const dm = dms.find(dm => Number(dm.id) === Number(data.serverID))
                const message = dm.messages.find(message => Number(message.id) === Number(data.messageID));
                if (message.senderid !== socket.userID) {
                    return;
                }

                message.edited = true;
                message.content = data.content;

                fs.writeFileSync('dummy/servers.json', JSON.stringify(fileContents, null, 2));
                
                io.to(roomName).emit('update-message', { message });
                
                return
            }
            else {
                const fileContents = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));

                let selectedServer;

                fileContents.forEach(server => {
                    if (String(server.serverid) === String(data.serverID)) {
                        selectedServer = server;
                    };
                });
        
                let selectedChannel;

                selectedServer.channels.forEach(channel => {
                    if (channel.name === data.channelName) {
                        selectedChannel = channel;
                    };
                });

                const messages = selectedChannel.messages;

                const message = messages.find(message => Number(message.id) === Number(data.messageID));
                if (message.senderid !== socket.userID) {
                    return;
                }
                
                message.edited = true;
                message.content = data.content;

                fs.writeFileSync('dummy/servers.json', JSON.stringify(fileContents, null, 2));

                io.to(roomName).emit('update-message', { message });
            }
        });

        socket.on('delete-message', (data) => {
            const roomName = `${data.serverID}_${data.channelName}`;

            if (data.channelName === "DM") {
                const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));
                
                const dm = dms.find(dm => Number(dm.id) === Number(data.serverID))
                const message = dm.messages.find(message => Number(message.id) === Number(data.messageID));
                if (message.senderid !== socket.userID) {
                    return;
                }

                message.deleted = true;
                message.content = "this message was deleted";

                fs.writeFileSync('dummy/dms.json', JSON.stringify(dms, null, 2));

                io.to(roomName).emit('update-message', { message })
            }
            else {
                const fileContents = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
                
                let selectedServer;

                fileContents.forEach(server => {
                    if (String(server.serverid) === String(data.serverID)) {
                        selectedServer = server;
                    };
                });
        
                let selectedChannel;

                selectedServer.channels.forEach(channel => {
                    if (channel.name === data.channelName) {
                        selectedChannel = channel;
                    };
                });

                const messages = selectedChannel.messages;

                const message = messages.find(message => Number(message.id) === Number(data.messageID));
                if (message.senderid !== socket.userID) {
                    return;
                }

                message.deleted = true;
                message.content = "this message was deleted";

                fs.writeFileSync('dummy/servers.json', JSON.stringify(fileContents, null, 2));

                io.to(roomName).emit('update-message', { message });
            }
            
        });

        socket.on('react', (data) => {
            const roomName = `${data.serverID}_${data.channelName}`;

            if (data.channelName === "DM") {
                const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));
                const dmID = Number(data.serverID);

                const dm = dms.find(dm => Number(dm.id) === Number(dmID));

                const messages = dm.messages;

                const message = messages.find(message => Number(message.id) === Number(data.messageID));

                if (!message.reactions) message.reactions = {};

                if (!message.reactions[data.emoji]) message.reactions[data.emoji] = [];

                if (!message.reactions[data.emoji].includes(data.userID)) {
                    message.reactions[data.emoji].push(data.userID);
                }

                fs.writeFileSync('dummy/dms.json', JSON.stringify(dms, null, 2));

                io.to(roomName).emit('update-message', { message });
            }
            else {
                const fileContents = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));

                let selectedServer;

                fileContents.forEach(server => {
                    if (String(server.serverid) === String(data.serverID)) {
                        selectedServer = server;
                    };
                });
        
                let selectedChannel;

                selectedServer.channels.forEach(channel => {
                    if (channel.name === data.channelName) {
                        selectedChannel = channel;
                    };
                });

                const messages = selectedChannel.messages;

                const message = messages.find(message => Number(message.id) === Number(data.messageID));

                if (!message.reactions) message.reactions = {};

                if (!message.reactions[data.emoji]) message.reactions[data.emoji] = [];

                if (!message.reactions[data.emoji].includes(data.userID)) {
                    message.reactions[data.emoji].push(data.userID);
                }

                fs.writeFileSync('dummy/servers.json', JSON.stringify(fileContents, null, 2));

                io.to(roomName).emit('update-message', { message });
            }
        });

        socket.on('join-room', (roomName) => {
            // Leave all previous rooms so you don't hear ghosts of old channels
            socket.rooms.forEach(room => {
                if (room !== socket.id) socket.leave(room);
            });

            socket.join(roomName);
        });

        // 2. The Targeted Message
        socket.on('send-chat-message', (data) => {
            const roomName = `${data.serverID}_${data.channelName}`;
            const userData = JSON.parse(fs.readFileSync('dummy/users.json', 'utf-8'));

            if (data.channelName === "DM") {
                const dms = JSON.parse(fs.readFileSync('dummy/dms.json', 'utf-8'));

                const dm = dms.find(dm => Number(dm.id) === Number(data.serverID));
                if (!dm) return;

                const sendersData = userData.find(u => String(u.userid) === String(data.senderid));
                if (!sendersData) return;

                const messages = dm.messages;
                const lastMessage = messages[messages.length - 1];
                const newIndex = lastMessage !== undefined ? lastMessage.id + 1 : 0;

                const stackedMessage = lastMessage && lastMessage.senderid === data.senderid;

                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const now = new Date();
                const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const date = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

                const isNewDay = lastMessage ? lastMessage.date !== date : false;

                const message = {
                    id: newIndex,
                    content: data.content,
                    senderid: data.senderid,
                    senderName: data.senderName,
                    time,
                    date,
                    stacked: stackedMessage,
                    isNewDay,
                    profile: sendersData.profile,
                    badge: sendersData.badge,
                    font: sendersData.font,
                    theme: sendersData.theme,
                    reactions: {},
                    deleted: false
                };

                dm.messages.push(message);

                sendersData.messagesSent = (sendersData.messagesSent || 0) + 1;

                fs.writeFileSync('dummy/dms.json', JSON.stringify(dms, null, 2));
                fs.writeFileSync('dummy/users.json', JSON.stringify(userData, null, 2));

                io.to(roomName).emit('render-new-message', {
                    message,
                    serverID: data.serverID,
                    channelName: data.channelName,
                    isNewDay
                });

                return; // stop here, don't fall into server logic
            }
            
            const fileContents = JSON.parse(fs.readFileSync('dummy/servers.json', 'utf-8'));
            
            let selectedServer;

            fileContents.forEach(server => {
                if (String(server.serverid) === String(data.serverID)) {
                    selectedServer = server;
                };
            });
    
            let selectedChannel;

            selectedServer.channels.forEach(channel => {
                if (channel.name === data.channelName) {
                    selectedChannel = channel;
                };
            });


            const messages = selectedChannel.messages;
            const lastMessage = messages[messages.length - 1];
            const newIndex = lastMessage !== undefined ? (lastMessage.id + 1) : 0;

            let stackedMessage = false;
            let stackStarter = true;
            let stackEnder = true;
            
            if (lastMessage) {
                if (lastMessage.senderid === data.senderid) {
                    stackedMessage = true;
                    stackStarter = false;
                    stackEnder = false;
                } else {
                    stackEnder = true;
                    stackStarter = true;
                }
            } else {
                // First message in channel
                stackStarter = true;
                stackEnder = true;
            }

            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
            const now = new Date();

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const date = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
            
            let isNewDay = false;

            if (lastMessage) {
                if (lastMessage.date !== date) {
                    isNewDay = true;
                }
            }
                
            const sendersData = userData.find(u => String(u.userid) === String(data.senderid));

            if (!sendersData) {
                console.error("User not found in users.json for senderid:", data.senderid);
                return; // Stop the message from sending; otherwise you crash
            }

            // Increment messagesSent safely
            sendersData.messagesSent = (sendersData.messagesSent || 0) + 1;
                
            const userRole = selectedServer.roles.find(role => role.holders.includes(Number(data.senderid)));
            // Now build your message object safely
            const message = {
                "id": newIndex,
                "content": data.content,
                "senderid": data.senderid,
                "senderName": data.senderName,
                "time": time,
                "date": date,
                "stacked": stackedMessage,
                "stackStarter": stackStarter,
                "stackEnder": stackEnder,
                "isNewDay": isNewDay,
                "profile": sendersData.profile,
                "badge": sendersData.badge,
                "font": sendersData.font,
                "theme": sendersData.theme,
                "reactions": {},
                "deleted": false,

                "roleColor": userRole.color || "#ffffff",
                "roleBadge": userRole.badge || "",
            };
            selectedChannel.messages.push(message);

            fs.writeFileSync('dummy/users.json', JSON.stringify(userData, null, 2));
            fs.writeFileSync('dummy/servers.json', JSON.stringify(fileContents, null, 2));

            io.to(roomName).emit('render-new-message', {message, "serverID": data.serverID, "channelName": data.channelName, "isNewDay": isNewDay});
        });
    });

    return { connectedUsers };
};