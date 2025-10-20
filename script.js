document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const homepageContent = document.getElementById('homepage-content');
    const megathreadContent = document.getElementById('megathread-content');
    const searchBarContainer = document.getElementById('search-bar-container');
    const tabsNavContainer = document.getElementById('tabs-nav-container');
    const filterInput = document.getElementById('global-filter');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    let allCardsData = [];

    // --- REVEAL ON SCROLL ---
    let observer;
    const setupObserver = () => {
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = (Array.from(entry.target.parentNode.children).indexOf(entry.target) % 4) * 100;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    };
    const observeVisibleCards = () => {
        const cards = document.querySelectorAll('.card:not(.is-visible)');
        cards.forEach(card => { if (observer) observer.observe(card); });
    };
    setupObserver();

    // --- DATA CACHING ---
    const cacheAllCards = () => {
        allCardsData = []; // Reset before caching
        document.querySelectorAll('#megathread-content .card').forEach((card, index) => {
            const titleElement = card.querySelector('h3');
            if (titleElement) {
                const title = titleElement.textContent.trim();
                const mainTabContent = card.closest('.tab-content');
                const subTabContent = card.closest('.sub-tab-content');
                
                card.dataset.cardId = `card-${index}`;

                allCardsData.push({
                    id: `card-${index}`,
                    title: title,
                    mainTab: mainTabContent ? mainTabContent.id : null,
                    subTab: subTabContent ? subTabContent.id : null,
                    element: card
                });
            }
        });
    };

    // --- NAVIGATION LOGIC ---
    const activateTab = (targetTabId, callback) => {
        if (!targetTabId) return;
        document.querySelectorAll('.tabs-nav .tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const tabButton = document.querySelector(`.tabs-nav .tab-button[data-tab="${targetTabId}"]`);
        if (tabButton) tabButton.classList.add('active');
        const contentPanel = document.getElementById(targetTabId);
        if (contentPanel) contentPanel.classList.add('active');
        if (callback) callback();
    };

    const activateSubTab = (subTabId) => {
        if (!subTabId) return;
        const subTabContent = document.getElementById(subTabId);
        if (!subTabContent) return;
        const parentPanel = subTabContent.closest('.tab-content');
        if (!parentPanel) return;
        const subNav = parentPanel.querySelector('.sub-tabs-nav');
        if (!subNav) return;
        subNav.querySelectorAll('.sub-tab-button').forEach(btn => btn.classList.toggle('active', btn.dataset.subtab === subTabId));
        parentPanel.querySelectorAll('.sub-tab-content').forEach(content => content.classList.toggle('active', content.id === subTabId));
    };

    const navigateToCard = (cardData) => {
        // Switch to megathread view if on homepage
        if (!homepageContent.classList.contains('hidden')) {
            homepageContent.classList.add('hidden');
            megathreadContent.classList.remove('hidden');
            tabsNavContainer.classList.remove('hidden');
        }

        activateTab(cardData.mainTab, () => {
            if (cardData.subTab) {
                activateSubTab(cardData.subTab);
            }
            // Ensure all cards are visible before scrolling
            document.querySelectorAll('#megathread-content .card').forEach(c => c.style.display = 'flex');

            setTimeout(() => {
                cardData.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cardData.element.classList.add('card-highlight');
                setTimeout(() => cardData.element.classList.remove('card-highlight'), 2000);
            }, 100); // Small delay to allow tab switching CSS to apply
        });
    };

    // --- SEARCH LOGIC ---
    const updateSearchResults = () => {
        const query = filterInput.value.trim().toLowerCase();
        searchResultsContainer.innerHTML = '';

        if (query.length < 2) {
            searchResultsContainer.classList.add('hidden');
            return;
        }

        const matchedCards = allCardsData.filter(card => 
            card.title.toLowerCase().includes(query) || 
            card.element.querySelector('p').textContent.toLowerCase().includes(query)
        );

        if (matchedCards.length > 0) {
            matchedCards.forEach(cardData => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item p-2 cursor-pointer';
                
                const clonedCard = cardData.element.cloneNode(true);
                
                clonedCard.classList.add('is-visible');
                clonedCard.style.transform = '';
                clonedCard.style.opacity = '1';
                clonedCard.style.animation = 'none';

                resultItem.appendChild(clonedCard);
                
                resultItem.addEventListener('click', (e) => {
                    if (e.target.closest('a, .tools-dropdown-button')) {
                        // Allow button/link clicks inside the card preview
                        return;
                    }
                    e.preventDefault();
                    navigateToCard(cardData);
                    filterInput.value = '';
                    searchResultsContainer.classList.add('hidden');
                });
                searchResultsContainer.appendChild(resultItem);
            });
            searchResultsContainer.classList.remove('hidden');
        } else {
            const noResultsItem = document.createElement('div');
            noResultsItem.className = 'px-4 py-3 text-sm text-slate-400';
            noResultsItem.textContent = 'No results found.';
            searchResultsContainer.appendChild(noResultsItem);
            searchResultsContainer.classList.remove('hidden');
        }
    };
    
    // --- PAGE VIEW AND EVENT LISTENERS SETUP ---
    const managePageView = () => {
        const params = new URLSearchParams(window.location.search);
        const tabFromUrl = params.get('tab');

        // Always show the search bar
        searchBarContainer.classList.remove('hidden');

        if (tabFromUrl && document.querySelector(`.tabs-nav .tab-button[data-tab="${tabFromUrl}"]`)) {
            homepageContent.classList.add('hidden');
            megathreadContent.classList.remove('hidden');
            tabsNavContainer.classList.remove('hidden');
            activateTab(tabFromUrl);
        } else {
            homepageContent.classList.remove('hidden');
            megathreadContent.classList.add('hidden');
            tabsNavContainer.classList.add('hidden');
        }
        observeVisibleCards();
    };

    const handleTabSwitching = (navSelector) => {
        const nav = document.querySelector(navSelector);
        if (!nav) return;
        nav.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (!button || button.classList.contains('active')) return;
            e.preventDefault();
            activateTab(button.dataset.tab, observeVisibleCards);
        });
    };
    
    const handleSubTabSwitching = (panelSelector) => {
         const panel = document.querySelector(panelSelector);
         if (!panel) return;
         const subNav = panel.querySelector('.sub-tabs-nav');
         if (!subNav) return;
         subNav.addEventListener('click', (e) => {
             const button = e.target.closest('.sub-tab-button');
             if (!button || button.classList.contains('active')) return;
             e.preventDefault();
             activateSubTab(button.dataset.subtab);
             observeVisibleCards();
         });
    };
    
    const setupToolsDropdowns = () => {
        document.body.addEventListener('click', (e) => {
            const dropdownButton = e.target.closest('.tools-dropdown-button');
            
            // Close all other dropdowns not related to the current click
            document.querySelectorAll('.tools-dropdown-content.active').forEach(dropdown => {
                if (!dropdown.closest('.tools-dropdown-container').contains(dropdownButton)) {
                    dropdown.classList.remove('active');
                    dropdown.closest('.tools-dropdown-container').querySelector('.tools-dropdown-button svg').style.transform = 'rotate(0deg)';
                }
            });

            if (dropdownButton) {
                const dropdownContainer = dropdownButton.closest('.tools-dropdown-container');
                const dropdownContent = dropdownContainer.querySelector('.tools-dropdown-content');
                const dropdownIcon = dropdownButton.querySelector('svg');
                
                if (dropdownContent) {
                    const isActive = dropdownContent.classList.toggle('active');
                    dropdownIcon.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    };

    if (filterInput) {
        filterInput.addEventListener('input', updateSearchResults);
        filterInput.addEventListener('focus', updateSearchResults);
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.key === '/')) {
                e.preventDefault(); 
                filterInput.focus();
            }
        });
        document.addEventListener('click', (e) => {
            if (!searchBarContainer.contains(e.target)) {
                searchResultsContainer.classList.add('hidden');
            }
        });
    }

    // --- INITIALIZATION ---
    cacheAllCards();
    handleTabSwitching('header .tabs-nav');
    handleSubTabSwitching('#emulation');
    handleSubTabSwitching('#gaming');
    handleSubTabSwitching('#movies-tv');
    setupToolsDropdowns();
    managePageView();
});

