'use strict';

const entryModalWrapper = document.querySelector(".entry-modal-wrapper");
const entryModal = document.querySelector(".entry-modal");

const emptyLoginButton = document.querySelector(".empty-login");
const emptySignupButton = document.querySelector(".empty-signup");

const loginModalWrapper = document.querySelector(".login-modal-wrapper");
const loginModal = document.querySelector(".login-modal");
const loginButton = document.querySelector(".log-in");
const loginBack = loginModal.querySelector("button.back");
const loginUsernameInput = loginModal.querySelector(".username-input");
const loginPasswordInput = loginModal.querySelector(".password-input");

const signupModalWrapper = document.querySelector(".signup-modal-wrapper");
const signupModal = document.querySelector(".signup-modal");
const signupContinueButton = document.querySelector(".continue");
const signupContinueButton2 = document.querySelector(".continue-2");
const signupBack = signupModal.querySelector("button.back")
const signupUsernameInput = signupModal.querySelector(".username-input");
const signupPasswordInput = signupModal.querySelector(".password-input");

const profileModalWrapper = document.querySelector(".profile-modal-wrapper");
const profileModal = document.querySelector(".profile-modal");

const messageModalWrapper = document.querySelector(".message-modal-wrapper");
const messageModal = document.querySelector(".message-modal");

const profilePicturesDiv = document.querySelector(".profile-pictures");
const allProfilePictureButtons = profilePicturesDiv.querySelectorAll("button"); 
const previewPFP = document.querySelector(".profile-preview");

const profileBadgesDiv = document.querySelector(".profile-badges");
const allProfileBadgeButtons = profileBadgesDiv.querySelectorAll("button");
const profileBadge = document.querySelector(".profile-badge");

const messagePreviewWrapper = document.querySelector(".message-wrapper-preview");
const messagePreviewUsername = messagePreviewWrapper.querySelector(".sender-username");
const messagePreviewTimestamp = messagePreviewWrapper.querySelector(".timestamp");
const messagePreviewProfile = messagePreviewWrapper.querySelector(".profile-picture-preview")
const messagePreviewBadge = messagePreviewWrapper.querySelector(".profile-picture-preview-badge");
const messagePreviewContent = messagePreviewWrapper.querySelector(".message-content");

const messageFonts = document.querySelector(".message-fonts");
const allMessageFontButtons = messageFonts.querySelectorAll("button");

const messagePreviewDiv = document.querySelector(".message-preview")
const messageThemes = document.querySelector(".messages-themes");
const allMessageThemeButtons = messageThemes.querySelectorAll("button");

const finishSignupButton = document.querySelector(".sign-up");
const messageModalBackButton = document.querySelector(".message-modal button.back");

const headerProfilePicture = document.querySelector(".header-profile");
const headerProfileBadge = headerProfilePicture.querySelector("span");

const serverCustomization = document.querySelector(".server-customization")
const serverCustomizationWrapper = document.querySelector(".server-customization-wrapper")

let profilePictureSelected = false;
let profileBadgeSelected = false;
let themeSelected = false;
let fontSelected = false;

let selectedProfile = JSON.parse(localStorage.getItem('pfp')) || null;
let selectedBadge = JSON.parse(localStorage.getItem('badge')) || null;
let selectedFont;
let selectedTheme;

let selectedBanner;
let selectedBadge1;
let selectedBadge2;
let selectedBadge3;
let selectedProfileTheme;

let username;
let password;
let bio;

finishSignupButton.addEventListener('click', () => {
    if (!fontSelected) {
        selectedFont = "message-font-1";
    }

    if (!themeSelected) {
        selectedTheme = "msg-theme-default";
    }

    fetch('/api/users/signup', {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            "username": username, 
            "password": password,
            "selectedProfile": selectedProfile,
            "selectedBadge": selectedBadge,
            "selectedFont": selectedFont,
            "selectedTheme": selectedTheme
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "signed up, fr fr") {
            showToast("signed up, fr fr");

            userID = data.userID;
            console.log(userID);

            localStorage.setItem("pfp", JSON.stringify(selectedProfile));
            localStorage.setItem("badge", JSON.stringify(selectedBadge));
            localStorage.setItem("username", JSON.stringify(username));
            localStorage.setItem("userID", JSON.stringify(userID));

            fetch('/api/users/details', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "userID": userID }) 
            })
            .then(response => response.json())
            .then(data => {
                selectedBanner = data.userData.banner;
                selectedBadge1 = data.userData.badge1;
                selectedBadge2 = data.userData.badge2;
                selectedBadge3 = data.userData.badge3;
                selectedProfileTheme = data.userData.profileTheme;
                bio = data.userData.bio;
            })

            profilePictureSelected = false;
            profileBadgeSelected = false;
            themeSelected = false;
            fontSelected = false;

            selectedFont = null;
            selectedTheme = null;

            if (previewPFP) previewPFP.className = 'profile-preview';
            if (profileBadge) profileBadge.textContent = '';
            if (messagePreviewContent) messagePreviewContent.className = 'message-content';
            if (messagePreviewDiv) messagePreviewDiv.className = 'message-preview';
            if (messagePreviewProfile) messagePreviewProfile.className = 'profile-picture-preview';
            
            toggleMessage();
            toggleTransparent();
            greetUser(username); 
            setProfilePicture(selectedProfile, selectedBadge);

            displayServers(userID);
            socket.emit('identify', { userID });
        };
    });
});

allMessageThemeButtons.forEach(button => {
    button.addEventListener('click', () => {
        messagePreviewDiv.className = 'message-preview'; 
        const themeClass = button.classList[1];
        
        messagePreviewDiv.classList.add(themeClass);
        
        selectedTheme = themeClass;
        themeSelected = true;
    });
});

allProfilePictureButtons.forEach(button => {
    button.addEventListener('click', () => {
        const pfpClass = button.classList[0]; 

        previewPFP.className = 'profile-preview selected'; 
        previewPFP.classList.add(pfpClass);

        messagePreviewProfile.className = 'profile-picture-preview';
        messagePreviewProfile.classList.add(pfpClass);
        
        selectedProfile = pfpClass;
        profilePictureSelected = true;
    });
});

allProfileBadgeButtons.forEach(button => {
    button.addEventListener('click', () => {
        profileBadge.textContent = button.textContent;
        selectedBadge = button.textContent;
        profileBadgeSelected = true;
    });
});

allMessageFontButtons.forEach(button => {
    button.addEventListener("click", () => {
        messagePreviewContent.className = 'message-content'; 
        const fontClass = button.classList[0]; 
        
        messagePreviewContent.classList.add(fontClass);
        selectedFont = fontClass;
        fontSelected = true;
    });
});

signupContinueButton2.addEventListener('click', () => {
    if (!profilePictureSelected) {
        showToast("select a profile picture my sugar plum");
        return;
    }

    if (!profileBadgeSelected) {
        showToast("select a profile badge my sugar plum");
        return;
    }

    const messagePreviewUsername = messagePreviewWrapper.querySelector(".sender-username");
    const messagePreviewTimestamp = messagePreviewWrapper.querySelector(".timestamp");
    const messagePreviewBadge = messagePreviewWrapper.querySelector(".profile-picture-preview-badge");
    
    const now = new Date();
    
    const datePart = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const timePart = now.toLocaleTimeString('en-US', {
        hour12: false, // true means AM / PM as well
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    messagePreviewUsername.textContent = username;
    messagePreviewTimestamp.textContent = `${datePart} | ${timePart}`

    messagePreviewProfile.classList.add(`${selectedProfile}`);
    messagePreviewBadge.textContent = selectedBadge;

    toggleProfile();
    toggleMessage();
});

function toggleServerCustom() {
    serverCustomizationWrapper.classList.toggle('hidden');
    serverCustomization.classList.toggle('hidden');
}

function toggleEntry() {
    entryModalWrapper.classList.toggle('hidden');
    entryModal.classList.toggle('hidden');
}

function toggleEntry() {
    entryModalWrapper.classList.toggle('hidden');
    entryModal.classList.toggle('hidden');
}

function toggleLogin() {
    loginModalWrapper.classList.toggle('hidden');
    loginModal.classList.toggle('hidden');
}

function toggleSignup() {
    signupModalWrapper.classList.toggle('hidden');
    signupModal.classList.toggle('hidden');
}

function toggleProfile() {
    profileModalWrapper.classList.toggle('hidden');
    profileModal.classList.toggle('hidden');
}

function toggleMessage() {
    messageModalWrapper.classList.toggle('hidden');
    messageModal.classList.toggle('hidden');
}

emptyLoginButton.addEventListener('click', () => {
    toggleEntry();
    toggleLogin();
});

emptySignupButton.addEventListener('click', () => {
    toggleEntry();
    toggleSignup();
});

loginBack.addEventListener('click', () => {
    toggleLogin();
    toggleEntry();
});

signupBack.addEventListener('click', () => {
    toggleSignup();
    toggleEntry();
});

messageModalBackButton.addEventListener('click', () => {
    toggleMessage();
    toggleProfile();
});

function setProfilePicture(pfp, badge) {
    headerProfilePicture.classList.add(pfp);
    headerProfileBadge.textContent = badge;
}

function signupContinue() {
    username = signupUsernameInput.value.trim();
    password = signupPasswordInput.value.trim();

    if (!password) {
        showToast("enter a password lazy");
        return;
    }
    if (password.length < 5) {
        showToast("password too short, stop being weak");
        return;
    }
    if (!username) {
        showToast("enter a username lazy");
        return;
    } 
    if (hasSpecialChars(username)) {
        showToast("no special chars in username");
        return;
    }

    fetch('/api/user/username/check', {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
            "username": username
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "username taken my guy") {
            showToast("username already in use");
            return;
        };
        if (data.message === "account deleted 💀") {
            showToast("account deleted 💀💀");
            return;
        }
 
        signupUsernameInput.value = '';
        signupPasswordInput.value = '';
        
        toggleSignup();
        toggleProfile();
    });
}

signupUsernameInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        signupContinue();
    }
});

signupPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        signupContinue();
    }
});

signupContinueButton.addEventListener('click', () => {
    signupContinue();
});


function login() {
    username = loginUsernameInput.value.trim();
    password = loginPasswordInput.value.trim();

    if (!password) {
        showToast("enter a password lazy");
        return;
    }
    if (password.length < 5) {
        showToast("password too short, stop being weak");
        return;
    }
    if (!username) {
        showToast("enter a username lazy");
        return;
    } 
    if (!username) {
        showToast("enter a username lazy");
        return;
    } 
    if (hasSpecialChars(username)) {
        showToast("no special chars in username");
        return;
    }

    fetch('/api/user/login', {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "forgot your password my pookie bear?") {
            showToast("forgot your password my pookie bear?");
            return;
        };
        if (data.message === "account doesnt exist honeybun") {
            showToast("no account exists with this username honeybun");
            return;
        }
        if (data.message === "welcome back my beloved") {

            let toastContent = `welcome back, ${username}! i missed you, munchkin`
            showToast(toastContent);
            
            loginUsernameInput.value = '';
            loginPasswordInput.value = '';

            profilePictureSelected = false;
            profileBadgeSelected = false;
            themeSelected = false;
            fontSelected = false;

            selectedFont = null;
            selectedTheme = null;

            if (previewPFP) previewPFP.className = 'profile-preview';
            if (profileBadge) profileBadge.textContent = '';
            if (messagePreviewContent) messagePreviewContent.className = 'message-content';
            if (messagePreviewDiv) messagePreviewDiv.className = 'message-preview';
            if (messagePreviewProfile) messagePreviewProfile.className = 'profile-picture-preview';

            userID = data.userID;
            selectedProfile = data.selectedProfile;
            selectedBadge = data.selectedBadge;

            selectedBanner = data.userData.banner;
            selectedBadge1 = data.userData.badge1;
            selectedBadge2 = data.userData.badge2;
            selectedBadge3 = data.userData.badge3;
            selectedProfileTheme = data.userData.profileTheme;
            bio = data.userData.bio;

            localStorage.setItem('pfp', JSON.stringify(selectedProfile));
            localStorage.setItem('badge', JSON.stringify(selectedBadge));
            localStorage.setItem('username', JSON.stringify(username));
            localStorage.setItem('userID', JSON.stringify(userID));
            
            toggleLogin();
            toggleTransparent();
            greetUser(username); 
            setProfilePicture(selectedProfile, selectedBadge);
                
            displayServers(userID);
            socket.emit('identify', { userID });
        }
    });
};

loginUsernameInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        login();
    }
});

loginPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        login();
    }
});

loginButton.addEventListener('click', () => {
    login();
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        selectedProfile = localStorage.getItem("pfp") ? JSON.parse(localStorage.getItem("pfp")) : "profile-1";
        selectedBadge = localStorage.getItem("badge") ? JSON.parse(localStorage.getItem("badge")) : "🎀";
        username = localStorage.getItem("username") ? JSON.parse(localStorage.getItem("username")) : null;
        userID = localStorage.getItem("userID") ? JSON.parse(localStorage.getItem("userID")) : null;
    } catch (err) {
        console.log(err);
    }

    if (userID) {
        // await this so globals are guaranteed set before anything else
        const res = await fetch('/api/users/details', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "userID": userID }) 
        });
        const data = await res.json();

        selectedBanner = data.userData.banner;
        selectedBadge1 = data.userData.badge1;
        selectedBadge2 = data.userData.badge2;
        selectedBadge3 = data.userData.badge3;
        selectedProfileTheme = data.userData.profileTheme;
        bio = data.userData.bio;
        username = data.userData.username; // use DB value not localStorage

        socket.emit('identify', userID);
        displayUsername(username);
        displayServers(userID);
        setProfilePicture(selectedProfile, selectedBadge);
    }

    if (!userID) {
        toggleTransparent();
        toggleEntry();
    }
});