document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const homepageContent = document.getElementById('homepage-content');
    const megathreadContent = document.getElementById('megathread-content');
    const searchBarContainer = document.getElementById('search-bar-container');
    const tabsNavContainer = document.getElementById('tabs-nav-container');
    const filterInput = document.getElementById('global-filter');

    // --- REVEAL ON SCROLL ---
    let observer;
    const setupObserver = () => {
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Slight delay for a staggered effect
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
        cards.forEach(card => {
            if (observer) observer.observe(card);
        });
    };
    setupObserver();

    // --- PAGE VIEW LOGIC ---
    const managePageView = () => {
        const params = new URLSearchParams(window.location.search);
        const tabFromUrl = params.get('tab');

        if (tabFromUrl && document.querySelector(`.tabs-nav .tab-button[data-tab="${tabFromUrl}"]`)) {
            homepageContent.classList.add('hidden');
            megathreadContent.classList.remove('hidden');
            searchBarContainer.classList.remove('hidden');
            tabsNavContainer.classList.remove('hidden');
            activateTab(tabFromUrl);
        } else {
            homepageContent.classList.remove('hidden');
            megathreadContent.classList.add('hidden');
            searchBarContainer.classList.add('hidden');
            tabsNavContainer.classList.add('hidden');
            observeVisibleCards(); // Observe homepage cards
        }
    };
    
    const activateTab = (targetTabId) => {
        if (!targetTabId) return;
        document.querySelectorAll('.tabs-nav .tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const tabButton = document.querySelector(`.tabs-nav .tab-button[data-tab="${targetTabId}"]`);
        if (tabButton) tabButton.classList.add('active');
        
        const contentPanel = document.getElementById(targetTabId);
        if (contentPanel) contentPanel.classList.add('active');
        
        observeVisibleCards();
    };

    // --- GLOBAL FILTER ---
    const runFilter = () => {
        if (!filterInput) return;
        const query = filterInput.value.trim().toLowerCase();

        // Remove all existing search count badges first
        document.querySelectorAll('.search-match-count').forEach(badge => badge.remove());

        // If the query is empty, restore all cards to visible and exit
        if (query === '') {
            document.querySelectorAll('#megathread-content .card').forEach(card => {
                card.style.display = 'flex';
            });
            return;
        }

        // Filter all cards on the entire site
        const allCards = document.querySelectorAll('#megathread-content .card');
        allCards.forEach(card => {
            const isVisible = card.innerText.toLowerCase().includes(query);
            card.style.display = isVisible ? 'flex' : 'none';
        });

        // Add count badges to main tabs that have results
        document.querySelectorAll('.tabs-nav .tab-button').forEach(button => {
            const tabId = button.dataset.tab;
            const contentPanel = document.getElementById(tabId);
            if (contentPanel) {
                const matchCount = contentPanel.querySelectorAll('.card[style*="display: flex"]').length;
                if (matchCount > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'search-match-count ml-2 bg-violet-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full';
                    badge.textContent = matchCount;
                    button.appendChild(badge);
                }
            }
        });

        // Add count badges to sub-tabs that have results
        document.querySelectorAll('.sub-tabs-nav .sub-tab-button').forEach(button => {
            const subTabId = button.dataset.subtab;
            const contentPanel = document.getElementById(subTabId);
            if (contentPanel) {
                const matchCount = contentPanel.querySelectorAll('.card[style*="display: flex"]').length;
                if (matchCount > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'search-match-count ml-1 bg-slate-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full';
                    badge.textContent = matchCount;
                    button.appendChild(badge);
                }
            }
        });
    };

    // --- EVENT LISTENERS ---
    const handleTabSwitching = (navSelector) => {
        const nav = document.querySelector(navSelector);
        if (!nav) return;
        nav.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (!button || button.classList.contains('active')) return;
            e.preventDefault();
            activateTab(button.dataset.tab);
            runFilter(); // Re-apply filter to show/hide content correctly on the new tab
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
             const subTabId = button.dataset.subtab;
             subNav.querySelectorAll('.sub-tab-button').forEach(btn => btn.classList.toggle('active', btn.dataset.subtab === subTabId));
             panel.querySelectorAll('.sub-tab-content').forEach(content => content.classList.toggle('active', content.id === subTabId));
             runFilter(); // Re-apply filter for consistency
             observeVisibleCards();
         });
    };

    if (filterInput) {
        filterInput.addEventListener('input', runFilter);
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.key === '/')) {
                e.preventDefault(); 
                filterInput.focus();
            }
        });
    }

    // --- MODAL LOGIC (Placeholder based on original structure) ---
    const modalOverlay = document.getElementById('tutorial-modal');
    if(modalOverlay) {
        // This logic is simplified. Assumes there's a click listener on the document
        // or that it will be handled appropriately.
        document.body.addEventListener('click', function(e) {
            if (e.target.closest('.tutorial-button')) {
                // Tutorial button was clicked, logic to open modal would go here.
                // e.g., openModalFor(e.target.dataset.topic);
                console.log('Tutorial button clicked for:', e.target.dataset.topic);
            }
            if (e.target.id === 'modal-close' || e.target === modalOverlay) {
                 // Logic to close modal would go here.
                 // modalOverlay.classList.add('hidden');
            }
        });
    }
    
    // --- INITIALIZATION ---
    handleTabSwitching('header .tabs-nav');
    handleSubTabSwitching('#emulation');
    handleSubTabSwitching('#gaming');
    handleSubTabSwitching('#movies-tv');
    managePageView();
});
