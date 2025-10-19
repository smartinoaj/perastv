document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const homepageContent = document.getElementById('homepage-content');
    const megathreadContent = document.getElementById('megathread-content');
    const searchBarContainer = document.getElementById('search-bar-container');
    const tabsNavContainer = document.getElementById('tabs-nav-container');

    // --- REVEAL ON SCROLL ---
    let observer;
    const setupObserver = () => {
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = (entry.target.offsetTop % window.innerHeight) / 4;
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
            // Show Megathread View
            homepageContent.classList.add('hidden');
            megathreadContent.classList.remove('hidden');
            searchBarContainer.classList.remove('hidden');
            tabsNavContainer.classList.remove('hidden');
            activateTab(tabFromUrl);
        } else {
            // Show Homepage View
            homepageContent.classList.remove('hidden');
            megathreadContent.classList.add('hidden');
            searchBarContainer.classList.add('hidden');
            tabsNavContainer.classList.add('hidden');
        }
    };
    
    const activateTab = (targetTabId) => {
        if (!targetTabId) return;
        // Deactivate all tabs and content panels
        document.querySelectorAll('.tabs-nav .tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        // Activate the target tab and content
        const tabButton = document.querySelector(`.tabs-nav .tab-button[data-tab="${targetTabId}"]`);
        if (tabButton) tabButton.classList.add('active');
        const contentPanel = document.getElementById(targetTabId);
        if (contentPanel) contentPanel.classList.add('active');
        // After setting tab, observe its cards
        observeVisibleCards();
    };

    // --- TAB SWITCHING LOGIC ---
    const handleTabSwitching = (navSelector) => {
        const nav = document.querySelector(navSelector);
        if (!nav) return;
        nav.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (!button || button.classList.contains('active')) return;
            e.preventDefault();
            activateTab(button.dataset.tab);
            runFilter();
        });
    };
    
    const handleSubTabSwitching = (panelSelector) => {
         const panel = document.querySelector(panelSelector);
         if (!panel) return;
         const subNav = panel.querySelector('.sub-tabs-nav');
         if(!subNav) return;
         subNav.addEventListener('click', (e) => {
             const button = e.target.closest('.sub-tab-button');
             if(!button || button.classList.contains('active')) return;
             e.preventDefault();
             const subTabId = button.dataset.subtab;
             subNav.querySelectorAll('.sub-tab-button').forEach(btn => btn.classList.toggle('active', btn.dataset.subtab === subTabId));
             panel.querySelectorAll('.sub-tab-content').forEach(content => content.classList.toggle('active', content.id === subTabId));
             runFilter();
             observeVisibleCards();
         });
    };

    handleTabSwitching('header .tabs-nav');
    handleSubTabSwitching('#emulation');
    handleSubTabSwitching('#gaming');
    handleSubTabSwitching('#movies-tv');

    // --- MODAL LOGIC ---
    const modalOverlay = document.getElementById('tutorial-modal');
    // ... (rest of modal logic is unchanged)

    // --- GLOBAL FILTER ---
    const filterInput = document.getElementById('global-filter');
    const runFilter = () => {
        if (!filterInput) return;
        const query = filterInput.value.trim().toLowerCase();
        const activePanel = document.querySelector('.tab-content.active');
        if (!activePanel) return;
        const activeSubPanel = activePanel.querySelector('.sub-tab-content.active') || activePanel;
        const cards = activeSubPanel.querySelectorAll('.card');
        cards.forEach(card => {
            const isVisible = card.innerText.toLowerCase().includes(query);
            card.style.display = isVisible ? 'flex' : 'none';
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

    // --- INITIALIZATION ---
    managePageView();
});

