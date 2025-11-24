// --- Mock Data: Game Catalog (Now with DUMMY redirect links) ---
const DUMMY_LINK = 'https://example.com/placeholder-redirect';
const REDEEM_CODE_VALUE = { "GIFT10": 10.00, "FREE5": 5.00 };

const MOCK_GAMES = [
    { 
        id: 1, 
        title: "Counter-Strike 2", 
        price: 0.00, 
        tags: ["action", "multiplayer", "fps"], 
        popularity: 99, 
        image: 'counter-strike.jpeg',
        // Fixed: Ensure screenshots array exists for the carousel logic to work
        
        video: 'steam trailer.mp4',
        storeLink: 'https://store.steampowered.com/app/730/CounterStrike_2/' 
    },
    { 
        id: 2, 
        title: "Grand Theft Auto V", 
        price: 29.99, 
        tags: ["action", "adventure", "rpg"], 
        popularity: 97, 
        image: 'gta5.jpg',
        screenshots: ['gta5_ss1.jpg'], 
        video: 'gta5_trailer.mp4',
        storeLink: DUMMY_LINK 
    },
    { id: 3, title: "FC 24", price: 69.99, tags: ["sports", "simulation", "multiplayer"], popularity: 90, image: 'FC-24.jpeg', storeLink: DUMMY_LINK },
    { id: 4, title: "FC 25", price: 39.99, tags: ["adventure", "multiplayer"], popularity: 91, image: 'FC-25.jpeg', storeLink: DUMMY_LINK },
    { id: 5, title: "Forza Horizon 5", price: 49.99, tags: ["strategy", "action", "multiplayer"], popularity: 88, image: 'Forza.jpeg', storeLink: DUMMY_LINK },
    { id: 6, title: "Rocket League", price: 19.99, tags: ["sports", "multiplayer"], popularity: 75, image: 'rocket.jpeg', storeLink: DUMMY_LINK },
    { id: 7, title: "Assassin's Creed Mirage", price: 59.99, tags: ["indie", "rpg"], popularity: 65, image: 'Mirage.jpeg', storeLink: DUMMY_LINK },
    { id: 8, title: "Assassin's Creed Odyssey", price: 9.99, tags: ["adventure", "strategy"], popularity: 72, image: 'odyssey.jpeg', storeLink: DUMMY_LINK },
];

let currentUser = null;
let currentAuthMode = 'login';
let currentFilterTag = 'all';
let carouselInterval;

// --- DOM ELEMENTS ---
const authPage = document.getElementById('authPage');
const mainPage = document.getElementById('mainPage');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const userDisplay = document.getElementById('userDisplay');
const walletDisplay = document.getElementById('walletDisplay');
const gridElement = document.getElementById('grid');
const searchBar = document.getElementById('searchBar');
const sortSelect = document.getElementById('sort');
const priceRange = document.getElementById('priceRange');
const currentPriceDisplay = document.getElementById('currentPrice');
const featuredTitle = document.getElementById('featuredTitle');
const featuredMeta = document.getElementById('featuredMeta');
const viewFeaturedBtn = document.getElementById('viewFeatured');
const carouselElement = document.getElementById('carousel');
const libraryGrid = document.getElementById('libraryGrid');
const storePage = document.getElementById('storePage');
const libraryPage = document.getElementById('libraryPage');
const storeTab = document.getElementById('storeTab');
const libraryTab = document.getElementById('libraryTab');
const userDropdown = document.getElementById('userDropdown');
const passwordMessage = document.getElementById('passwordMessage');


// --- USER STATE MANAGEMENT (Local Storage) ---

function saveUserState(user) {
    localStorage.setItem('currentUser', user.username);
    localStorage.setItem(`wallet_${user.username}`, user.wallet.toFixed(2));
    localStorage.setItem(`library_${user.username}`, JSON.stringify(user.library));
    localStorage.setItem(`password_${user.username}`, user.password);
}

function loadUserState(username) {
    const defaultUser = {
        username: username,
        password: localStorage.getItem(`password_${username}`) || 'password', 
        wallet: parseFloat(localStorage.getItem(`wallet_${username}`)) || 0.00,
        library: JSON.parse(localStorage.getItem(`library_${username}`)) || MOCK_GAMES.filter(g => g.price === 0).map(g => g.id), 
    };
    return defaultUser;
}

function updateWalletDisplay() {
    if (currentUser) {
        walletDisplay.textContent = `[$${currentUser.wallet.toFixed(2)}]`;
    }
}


// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Set up form and control listeners
    document.getElementById('changePasswordForm').onsubmit = handleChangePassword;
    document.getElementById('addFundsForm').onsubmit = handleRedeemCode;
    document.querySelectorAll('.fund-btn').forEach(btn => {
        btn.onclick = () => addFunds(parseFloat(btn.dataset.amount));
    });

    authForm.onsubmit = handleAuth;
    searchBar.oninput = updateGrid;
    sortSelect.onchange = updateGrid;
    priceRange.oninput = () => {
        currentPriceDisplay.textContent = parseFloat(priceRange.value).toFixed(2);
        updateGrid();
    };
    
    // Check for existing user
    const savedUsername = localStorage.getItem('currentUser');
    if (savedUsername) {
        currentUser = loadUserState(savedUsername);
        renderMainPage(currentUser.username);
    } else {
        viewLogin();
    }
});


// --- FEATURED GAME & CAROUSEL FUNCTIONS ---

function setupFeatured() {
    const featuredGame = MOCK_GAMES[0]; 
    
    featuredTitle.textContent = featuredGame.title;
    featuredMeta.textContent = featuredGame.tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' • ');
    viewFeaturedBtn.onclick = () => showGameModal(featuredGame.id);

    let carouselHTML = '';

    if (featuredGame.video) {
        carouselHTML += `
            <div class="carousel-item active">
                <video controls autoplay muted loop>
                    <source src="./images/${featuredGame.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }

    if (featuredGame.screenshots && featuredGame.screenshots.length > 0) {
        featuredGame.screenshots.forEach(ss => {
            carouselHTML += `
                <div class="carousel-item">
                    <img src="./images/${ss}" alt="${featuredGame.title} Screenshot">
                </div>
            `;
        });
    }

    carouselElement.innerHTML = carouselHTML;
    startCarousel(); 
}

function startCarousel() {
    const items = document.querySelectorAll('.hero-overlay .carousel-item');
    if (items.length <= 1) return;

    let currentIndex = 0;
    const intervalTime = 5000;

    if (carouselInterval) clearInterval(carouselInterval);

    carouselInterval = setInterval(() => {
        items[currentIndex].classList.remove('active');
        const currentVideo = items[currentIndex].querySelector('video');
        if (currentVideo) currentVideo.pause();

        currentIndex = (currentIndex + 1) % items.length;

        items[currentIndex].classList.add('active');
        const nextVideo = items[currentIndex].querySelector('video');
        if (nextVideo) nextVideo.play();

    }, intervalTime);
}


// --- AUTH FUNCTIONS ---

window.viewLogin = function() {
    currentAuthMode = 'login';
    authTitle.textContent = 'Login';
    document.querySelector('.auth-buttons button:nth-child(1)').classList.add('primary');
    document.querySelector('.auth-buttons button:nth-child(2)').classList.remove('primary');
}

window.viewSignup = function() {
    currentAuthMode = 'signup';
    authTitle.textContent = 'Sign Up';
    document.querySelector('.auth-buttons button:nth-child(2)').classList.add('primary');
    document.querySelector('.auth-buttons button:nth-child(1)').classList.remove('primary');
}

function handleAuth(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    authMessage.textContent = '';

    if (currentAuthMode === 'login') {
        const savedPassword = localStorage.getItem(`password_${username}`);
        if (username && savedPassword && savedPassword === password) {
            currentUser = loadUserState(username);
            renderMainPage(username);
        } else if (username === 'testuser' && password === 'password') { 
            currentUser = loadUserState(username);
            saveUserState(currentUser);
            renderMainPage(username);
        } else {
            authMessage.textContent = 'Invalid username or password.';
        }
    } else { 
        if (username.length >= 4 && password.length >= 6) {
            if (localStorage.getItem(`password_${username}`)) {
                 authMessage.textContent = 'User already exists. Please log in.';
                 return;
            }
            currentUser = { username: username, password: password, wallet: 0.00, library: MOCK_GAMES.filter(g => g.price === 0).map(g => g.id)};
            saveUserState(currentUser);
            renderMainPage(username);
        } else {
            authMessage.textContent = 'Username 4+ chars, Password 6+ chars required.';
        }
    }
}

function renderMainPage(username) {
    authPage.style.display = 'none';
    mainPage.style.display = 'block';
    userDisplay.textContent = username.toUpperCase();
    updateWalletDisplay();
    setupFeatured();
    updateGrid();
    showPage('store'); // Default to Store
}

window.logout = function() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    mainPage.style.display = 'none';
    authPage.style.display = 'flex';
    document.getElementById('password').value = '';
    viewLogin();
}

window.toggleUserMenu = function() {
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
}

window.showPage = function(page) {
    const allPages = [storePage, libraryPage];
    const allTabs = [storeTab, libraryTab];

    allPages.forEach(p => p.style.display = 'none');
    allTabs.forEach(t => t.classList.remove('active-tab'));

    if (page === 'store') {
        storePage.style.display = 'block';
        storeTab.classList.add('active-tab');
        updateGrid(); 
    } else if (page === 'library') {
        libraryPage.style.display = 'block';
        libraryTab.classList.add('active-tab');
        renderLibrary(); 
    }
}


// --- LIBRARY FUNCTIONS ---

function renderLibrary() {
    document.getElementById('libraryUserDisplay').textContent = currentUser.username.toUpperCase();
    const ownedGameIds = currentUser.library;
    const ownedGames = MOCK_GAMES.filter(game => ownedGameIds.includes(game.id));
    
    if (ownedGames.length === 0) {
        libraryGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; margin-top: 50px; font-size: 1.2em; color: #8c9fa8;">Your library is empty. Go buy some games!</p>';
    } else {
        libraryGrid.innerHTML = ownedGames.map(game => {
            const imagePath = `./images/${game.image || 'default.jpeg'}`; 
            return `
                <div class="game-card library-card" onclick="alert('Launching ${game.title}...')">
                    <div class="image">
                        <img src="${imagePath}" alt="${game.title} Logo"> 
                    </div>
                    <div class="info">
                        <div class="game-title">${game.title}</div>
                        <p style="color:var(--steam-primary-button); margin-top:5px;">PLAY NOW</p>
                    </div>
                </div>
            `;
        }).join('');
    }
}


// --- WALLET & PURCHASE FUNCTIONS ---

window.addFunds = function(amount) {
    currentUser.wallet += amount;
    saveUserState(currentUser);
    updateWalletDisplay();
    document.getElementById('fundWalletDisplay').textContent = `$${currentUser.wallet.toFixed(2)}`;
    alert(`Successfully added $${amount.toFixed(2)}! New balance: $${currentUser.wallet.toFixed(2)}`);
}

function handleRedeemCode(event) {
    event.preventDefault();
    const code = document.getElementById('redeemCode').value.trim().toUpperCase();
    const messageElement = document.getElementById('redeemMessage');
    messageElement.style.color = '#ff6b6b';

    if (REDEEM_CODE_VALUE[code]) {
        const amount = REDEEM_CODE_VALUE[code];
        currentUser.wallet += amount;
        saveUserState(currentUser);
        updateWalletDisplay();
        document.getElementById('fundWalletDisplay').textContent = `$${currentUser.wallet.toFixed(2)}`;
        messageElement.style.color = 'var(--steam-primary-button)';
        messageElement.textContent = `Code redeemed! Added $${amount.toFixed(2)}.`;
    } else {
        messageElement.textContent = 'Invalid redeem code.';
    }
    document.getElementById('redeemCode').value = '';
}

window.buyGame = function(gameId) {
    const game = MOCK_GAMES.find(g => g.id === gameId);
    if (!game) return;

    if (currentUser.library.includes(gameId)) {
        alert(`${game.title} is already in your library!`);
        return;
    }
    
    if (currentUser.wallet >= game.price) {
        // Successful Purchase Simulation
        currentUser.wallet -= game.price;
        currentUser.library.push(gameId);
        saveUserState(currentUser);
        updateWalletDisplay();
        closeModal();
        alert(`Purchase successful! ${game.title} is now in your library.`);
        updateGrid(); 
    } else {
        alert(`Insufficient funds. You need $${(game.price - currentUser.wallet).toFixed(2)} more. First, try "Add Funds / Redeem" from the username menu.`);
    }
}


// --- ACCOUNT MANAGEMENT FUNCTIONS ---

window.showAccountManagement = function() {
    toggleUserMenu();
    document.getElementById('accountUserDisplay').textContent = currentUser.username.toUpperCase();
    document.getElementById('accountWalletDisplay').textContent = `$${currentUser.wallet.toFixed(2)}`;
    document.getElementById('accountModal').style.display = 'flex';
    passwordMessage.textContent = '';
}

function handleChangePassword(event) {
    event.preventDefault();
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    passwordMessage.style.color = '#ff6b6b';

    if (oldPass !== currentUser.password) {
        passwordMessage.textContent = 'Error: Old password does not match.';
    } else if (newPass.length < 6) {
        passwordMessage.textContent = 'Error: New password must be at least 6 characters.';
    } else if (newPass !== confirmPass) {
        passwordMessage.textContent = 'Error: New passwords do not match.';
    } else {
        currentUser.password = newPass;
        saveUserState(currentUser);
        passwordMessage.style.color = 'var(--steam-primary-button)';
        passwordMessage.textContent = 'Password successfully updated (Mock).';
        // Clear inputs
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
}

window.showWalletModal = function() {
    toggleUserMenu();
    document.getElementById('fundWalletDisplay').textContent = `$${currentUser.wallet.toFixed(2)}`;
    document.getElementById('walletModal').style.display = 'flex';
    document.getElementById('redeemMessage').textContent = '';
}

window.closeAccountModal = function() {
    document.getElementById('accountModal').style.display = 'none';
}

window.closeWalletModal = function() {
    document.getElementById('walletModal').style.display = 'none';
}


// --- GRID, FILTER, SORT FUNCTIONS ---

window.filterBy = function(tag) {
    currentFilterTag = tag;
    
    // Update active class on sidebar links
    document.querySelectorAll('.left-sidebar .sidebar-link').forEach(link => link.classList.remove('active-filter'));
    
    if (tag === 'all') {
         document.querySelector('.left-sidebar .sidebar-section:first-child .sidebar-link:first-child').classList.add('active-filter');
    } else {
        // Use data-tag selector for genre links
        const activeLink = document.querySelector(`.sidebar-link[data-tag="${tag}"]`);
        if(activeLink) activeLink.classList.add('active-filter');
    }

    updateGrid();
}

function updateGrid() {
    if (document.getElementById('storePage').style.display === 'none') return;

    let games = [...MOCK_GAMES];
    const search = searchBar.value.toLowerCase();
    const maxPrice = parseFloat(priceRange.value);

    games = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(search);
        const matchesTag = currentFilterTag === 'all' || game.tags.includes(currentFilterTag);
        const matchesPrice = game.price <= maxPrice;
        return matchesSearch && matchesTag && matchesPrice;
    });

    const sortBy = sortSelect.value;
    
    games.sort((a, b) => {
        if (sortBy === 'pop') return b.popularity - a.popularity;
        if (sortBy === 'price') return a.price - b.price; 
        if (sortBy === 'alpha') return a.title.localeCompare(b.title);
        return 0;
    });

    renderGrid(games);
}

function renderGrid(games) {
    if (!currentUser) return;
    
    if (games.length === 0) {
        gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; margin-top: 50px; font-size: 1.2em; color: #8c9fa8;">No games found matching your criteria.</p>';
        return;
    }
    
    gridElement.innerHTML = games.map(game => {
        const imagePath = `./images/${game.image || 'default.jpeg'}`; 
        const isOwned = currentUser.library.includes(game.id);
        const priceText = game.price === 0.00 ? 'Free to Play' : '$' + game.price.toFixed(2);
        const priceColor = isOwned ? 'var(--steam-text-muted)' : 'var(--steam-primary-button)';
        const cardClass = isOwned ? 'game-card owned-game' : 'game-card';

        return `
            <div class="${cardClass}" onclick="showGameModal(${game.id})">
                <div class="image">
                    <img src="${imagePath}" alt="${game.title} Logo"> 
                </div>
                <div class="info">
                    <div class="game-title">${game.title}</div>
                    <div class="tags">${game.tags.join(' • ')}</div>
                    <div class="price" style="color:${priceColor}">
                        ${isOwned ? 'In Library' : priceText}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


// --- GAME DETAIL MODAL FUNCTIONS ---

window.showGameModal = function(gameId) {
    const game = MOCK_GAMES.find(g => g.id === gameId);
    const isOwned = currentUser.library.includes(gameId);
    
    if (game) {
        const priceDisplay = game.price === 0.00 ? 'FREE' : '$' + game.price.toFixed(2);
        
        let buttonHTML;
        if (isOwned) {
            buttonHTML = `<button class="btn primary" style="margin-top: 20px;" onclick="closeModal(); showPage('library')">Play in Library</button>`;
        } else {
            buttonHTML = `
                <button class="btn primary" style="margin-top: 20px;" onclick="buyGame(${gameId})">
                    ${game.price === 0.00 ? 'Add to Library (Free)' : `Buy for ${priceDisplay}`}
                </button>
                <button class="btn" style="margin-top: 20px; margin-left: 10px;" onclick="redirectToStore('${game.storeLink}')">
                    Add to Cart (External)
                </button>
            `;
        }

        modalContent.innerHTML = `
            <div style="text-align:center;">
                <img src="./images/${game.image || 'default.jpeg'}" alt="${game.title} Cover" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: var(--border-radius); margin-bottom: 20px;">
            </div>
            <h3>${game.title}</h3>
            <p class="muted" style="margin-bottom: 10px;">Tags: ${game.tags.join(', ')}</p>
            <div style="font-size: 2em; font-weight: 700; color: var(--steam-primary-button); margin-bottom: 20px;">
                ${isOwned ? 'OWNED' : priceDisplay}
            </div>
            <p>Welcome to the page for ${game.title}! This is a detailed game info view.</p>
            ${buttonHTML}
        `;
        document.getElementById('modal').style.display = 'flex';
    }
}

window.redirectToStore = function(url) {
    window.open(url, '_blank');
    closeModal();
}

window.closeModal = function() {
    document.getElementById('modal').style.display = 'none';
}

document.getElementById('modal').onclick = (event) => {
    if (event.target === document.getElementById('modal')) {
        closeModal();
    }
    if (event.target === document.getElementById('accountModal')) {
        closeAccountModal();
    }
    if (event.target === document.getElementById('walletModal')) {
        closeWalletModal();
    }
};