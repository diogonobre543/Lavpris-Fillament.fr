/**
 * BILLIGT FILAMENT - JAVASCRIPT ENGINE 2026
 * Version Finale: Edition Skilteproduktion (Français)
 * API ATUALIZADA: 9D20D11BF004359263F6665EB4676D07EB47FE50B55FE9D55EE6C9C2A9EA0CA5
 */

// URL DA NOVA API QUE VOCÊ PASSOU
const API_URL = 'https://www.datamarked.dk/?id=8016&apikey=9D20D11BF004359263F6665EB4676D07EB47FE50B55FE9D55EE6C9C2A9EA0CA5';

let allProducts = [];
let activeCategory = 'all';

// Filtres de Catégorie (Keywords para organizar automaticamente)
const materialKeywords = ['PLA', 'PETG', 'SILK', 'ABS', 'TPU', 'ASA', 'NYLON', 'WOOD', 'CARBON'];
const printerKeywords = ['PRINTER', 'CREALITY', 'BAMBU', 'ANYCUBIC', 'ENDER', 'VORON', 'ELEGOO', 'MACHINE', 'RESIN'];

// Formatage Prix (Danois/Euro)
const formatPrice = (p) => p.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * 1. NAVIGATION MOBILE (HAMBURGER)
 */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    
    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mainNav.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : 'auto';
    });

    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mainNav.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

/**
 * 2. CHARGEMENT DES PRODUITS DE L'API
 */
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Mapeamento dos dados da API para o nosso formato
        allProducts = data.map(i => {
            const titleUpper = i.title.toUpperCase();
            let cat = 'AUTRES';
            
            if (printerKeywords.some(k => titleUpper.includes(k))) {
                cat = 'IMPRIMANTE';
            } else {
                const found = materialKeywords.find(m => titleUpper.includes(m));
                cat = found || 'AUTRES';
            }

            return {
                title: i.title,
                // Converte preço de string "123,00" para número 123.00
                price: parseFloat(String(i.price).replace(',', '.')),
                img: i.image,
                link: i.link,
                stock: parseInt(i.stock) || 0,
                category: cat,
                description: i.description || `Filament de haute qualité ${cat} pour impression 3D professionnelle.`
            };
        });

        // Atualiza a interface
        renderHero();
        renderGrid();
        renderProductDetail();
        createFilterButtons();

    } catch (error) {
        console.error("Erreur lors du chargement de l'API :", error);
    }
}

/**
 * 3. AFFICHAGE DE LA GRILLE DE PRODUITS
 */
function renderGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const search = document.getElementById('searchField')?.value.toLowerCase() || '';
    const sort = document.getElementById('sortOrder')?.value || 'default';

    let list = allProducts.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search);
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    
    // Se estiver na home, mostra apenas 8
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (search === '' && activeCategory === 'all') list = list.slice(0, 8);
    }

    grid.innerHTML = list.map(p => `
        <article class="product-card">
            <div class="img-wrapper"><img src="${p.img}" loading="lazy" alt="${p.title}"></div>
            <div class="product-info">
                <h3>${p.title}</h3>
                <div class="price">${formatPrice(p.price)} €</div>
                <div class="product-actions">
                    <a href="./product-detail.html?title=${encodeURIComponent(p.title)}" class="btn-details">Voir plus</a>
                    <a href="${p.link}" target="_blank" class="btn-buy">SKILTEPRODUCTION</a>
                </div>
            </div>
        </article>
    `).join('');
}

/**
 * 4. AFFICHAGE PAGE DÉTAILS PRODUIT
 */
function renderProductDetail() {
    const container = document.getElementById('product-detail-render');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productTitle = urlParams.get('title');
    const product = allProducts.find(p => p.title === productTitle);

    if (product) {
        container.innerHTML = `
            <div class="detail-image-box">
                <img src="${product.img}" alt="${product.title}">
            </div>
            <div class="detail-content">
                <span class="stock-tag" style="font-weight:800; color: ${product.stock > 0 ? '#10b981' : '#ef4444'}">
                    ${product.stock > 0 ? '● EN STOCK' : '○ RUPTURE'}
                </span>
                <h1 style="margin: 10px 0;">${product.title}</h1>
                <div class="detail-price" style="font-size: 2rem; font-weight: 800; color: var(--primary); margin-bottom: 20px;">
                    ${formatPrice(product.price)} €
                </div>
                
                <div class="meta-box" style="background: var(--ice); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <p style="margin-bottom: 8px;"><strong>Catégorie :</strong> ${product.category}</p>
                    <p><strong>Stock :</strong> ${product.stock} pcs</p>
                </div>

                <div class="product-description" style="margin-bottom: 30px;">
                    <h4 style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; color: var(--slate); margin-bottom: 10px;">Description</h4>
                    <p style="line-height: 1.8; color: #475569;">${product.description}</p>
                </div>

                <a href="${product.link}" target="_blank" class="btn-buy" 
                   style="padding: 20px; font-size: 1.1rem; width: 100%; display: block; text-align: center; text-decoration: none; border-radius: 12px;">
                    SKILTEPRODUCTION
                </a>
            </div>
        `;
    }
}

/**
 * 5. HERO (ACCUEIL)
 */
function renderHero() {
    const pBox = document.getElementById('hero-random-printer');
    const mBox = document.getElementById('hero-random-material');
    if (!pBox || !mBox) return;

    const printers = allProducts.filter(p => p.category === 'IMPRIMANTE');
    const mats = allProducts.filter(p => p.category !== 'IMPRIMANTE' && p.category !== 'AUTRES');

    const card = (item) => `
        <div class="product-card" style="width: 220px; box-shadow: var(--shadow);">
            <div class="img-wrapper" style="height: 160px;"><img src="${item.img}"></div>
            <div class="product-info" style="padding: 10px;">
                <h3 style="font-size: 0.85rem; min-height: 2.2rem;">${item.title}</h3>
                <div class="price" style="font-size: 1.1rem; margin-bottom: 10px;">${formatPrice(item.price)} €</div>
                <a href="./product-detail.html?title=${encodeURIComponent(item.title)}" class="btn-details" style="font-size: 0.75rem; padding: 8px; display: block;">Voir détails</a>
            </div>
        </div>`;
    
    if (printers.length) pBox.innerHTML = card(printers[Math.floor(Math.random() * printers.length)]);
    if (mats.length) mBox.innerHTML = card(mats[Math.floor(Math.random() * mats.length)]);
}

/**
 * 6. BOUTONS DE FILTRE
 */
function createFilterButtons() {
    const box = document.getElementById('materialBoxes');
    if (!box) return;

    const cats = ['all', 'IMPRIMANTE', ...new Set(allProducts.map(p => p.category).filter(c => c !== 'IMPRIMANTE' && c !== 'AUTRES'))].sort();
    box.innerHTML = cats.map(c => `
        <button class="material-btn ${c === activeCategory ? 'active' : ''}" onclick="changeCategory('${c}')">
            ${c === 'all' ? 'Tous' : c}
        </button>
    `).join('');
}

window.changeCategory = (cat) => {
    activeCategory = cat;
    createFilterButtons();
    renderGrid();
};

// Initialisation Globale
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadProducts();
    
    document.getElementById('searchField')?.addEventListener('input', renderGrid);
    document.getElementById('sortOrder')?.addEventListener('change', renderGrid);
});