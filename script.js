document.addEventListener('DOMContentLoaded', () => {
    // --- REVEAL ON SCROLL ---
    let observer;

    const setupObserver = () => {
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Staggering delay based on position for a wave effect
                    const delay = (entry.target.offsetTop % window.innerHeight) / 4;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // Start loading a bit before they enter viewport
        });
    };

    const observeVisibleCards = () => {
        const cards = document.querySelectorAll('.card:not(.is-visible)');
        cards.forEach(card => {
            if (observer) {
                observer.observe(card);
            }
        });
    };
    
    setupObserver();

    // --- HANDLE TAB FROM URL on megathread.html ---
    const activateTabFromURL = () => {
        if (!window.location.pathname.includes('megathread.html')) return;
        
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) {
            const tabButton = document.querySelector(`.tabs-nav .tab-button[data-tab="${tab}"]`);
            if (tabButton) {
                // Deactivate any currently active tabs first
                document.querySelectorAll('.tabs-nav .tab-button.active').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content.active').forEach(c => c.classList.remove('active'));

                // Activate the correct one
                tabButton.classList.add('active');
                const contentPanel = document.getElementById(tab);
                if(contentPanel) {
                    contentPanel.classList.add('active');
                }
            }
        }
    };
    activateTabFromURL();


    const handleTabSwitching = (navSelector) => {
        const nav = document.querySelector(navSelector);
        if (!nav) return;

        nav.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (!button || button.classList.contains('active')) return;
            e.preventDefault();
            
            const tabId = button.dataset.tab;
            
            nav.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabId);
            });

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });

            runFilter();
            observeVisibleCards();
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

             subNav.querySelectorAll('.sub-tab-button').forEach(btn => {
                 btn.classList.toggle('active', btn.dataset.subtab === subTabId);
             });
             
             panel.querySelectorAll('.sub-tab-content').forEach(content => {
                 content.classList.toggle('active', content.id === subTabId);
             });

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
    const modalTitle = document.getElementById('tutorial-title');
    const modalContent = document.getElementById('tutorial-content');
    const closeModalButton = document.getElementById('modal-close');
    
    const openModal = (topic) => {
        const content = getTutorialContent(topic);
        modalTitle.textContent = content ? content.title : 'Tutorial Not Found';
        modalContent.innerHTML = content ? content.body : '<p>Sorry, we could not find a tutorial for this topic.</p>';
        modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    };
    
    const getTutorialContent = (topic) => {
        const tutorials = {
            'duckduckgo': {
                title: 'How to Set DuckDuckGo as Your Default Search Engine',
                body: `
                    <p class="mb-4">Setting DuckDuckGo as your default search engine is a great step for privacy. Here's how to do it in major browsers:</p>
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-semibold text-violet-400 mb-2">Google Chrome</h3>
                            <ol class="list-decimal list-inside space-y-1">
                                <li>Go to <strong>Settings</strong> by clicking the three dots in the top-right corner.</li>
                                <li>Select <strong>Search Engine</strong> from the left sidebar.</li>
                                <li>From the dropdown menu next to "Search engine used in the address bar", select <strong>DuckDuckGo</strong>.</li>
                            </ol>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-violet-400 mb-2">Mozilla Firefox</h3>
                            <ol class="list-decimal list-inside space-y-1">
                                <li>Go to <strong>Settings</strong> by clicking the three lines in the top-right corner.</li>
                                <li>Select <strong>Search</strong> from the left sidebar.</li>
                                <li>Under the "Default Search Engine" section, choose <strong>DuckDuckGo</strong> from the dropdown list.</li>
                            </ol>
                        </div>
                    </div>
                `
            }
        };
        return tutorials[topic] || null;
    };
    
    document.body.addEventListener('click', (event) => {
        const tutorialButton = event.target.closest('.tutorial-button');
        if (tutorialButton) {
            openModal(tutorialButton.dataset.topic);
        }
    });

    closeModalButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) closeModal(); });


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

    observeVisibleCards();
});

