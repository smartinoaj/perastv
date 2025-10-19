document.addEventListener('DOMContentLoaded', () => {
    const handleTabSwitching = (navSelector) => {
        const nav = document.querySelector(navSelector);
        if (!nav) return;

        nav.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (!button) return;
            e.preventDefault();
            
            const tabId = button.dataset.tab;
            
            // Update all navs of the same type
            document.querySelectorAll(navSelector).forEach(n => {
                n.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.tab === tabId);
                     btn.classList.toggle('bg-slate-800', btn.dataset.tab === tabId);
                     btn.classList.toggle('text-white', btn.dataset.tab === tabId);
                });
            });

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
             // After tab switch, re-run filter
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
             if(!button) return;
             e.preventDefault();

             const subTabId = button.dataset.subtab;

             subNav.querySelectorAll('.sub-tab-button').forEach(btn => {
                 btn.classList.toggle('active', btn.dataset.subtab === subTabId);
                 btn.classList.toggle('bg-sky-500', btn.dataset.subtab === subTabId);
                 btn.classList.toggle('text-white', btn.dataset.subtab === subTabId);
             });
             
             panel.querySelectorAll('.sub-tab-content').forEach(content => {
                 content.classList.toggle('active', content.id === subTabId);
             });
              // After sub-tab switch, re-run filter
             runFilter();
         });
    };

    // Main tabs for both desktop and mobile
    handleTabSwitching('body > div > aside > nav');
    handleTabSwitching('body > nav');
    
    // Sub tabs for each main category
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
        if (content) {
            modalTitle.textContent = content.title;
            modalContent.innerHTML = content.body;
        } else {
            modalTitle.textContent = 'Tutorial Not Found';
            modalContent.innerHTML = '<p>Sorry, we could not find a tutorial for this topic.</p>';
        }
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
                            <h3 class="text-lg font-semibold text-sky-400 mb-2">Google Chrome</h3>
                            <ol class="list-decimal list-inside space-y-1">
                                <li>Go to <strong>Settings</strong> by clicking the three dots in the top-right corner.</li>
                                <li>Select <strong>Search Engine</strong> from the left sidebar.</li>
                                <li>From the dropdown menu next to "Search engine used in the address bar", select <strong>DuckDuckGo</strong>.</li>
                            </ol>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-sky-400 mb-2">Mozilla Firefox</h3>
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
        if (event.target.matches('.tutorial-button')) {
            openModal(event.target.getAttribute('data-topic'));
        }
    });

    closeModalButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });


    // --- GLOBAL FILTER ---
    const filterInput = document.getElementById('global-filter');
    const runFilter = () => {
        const query = filterInput.value.trim().toLowerCase();
        const activePanel = document.querySelector('.tab-content.active');
        if (!activePanel) return;

        const activeSubPanel = activePanel.querySelector('.sub-tab-content.active') || activePanel;

        const cards = activeSubPanel.querySelectorAll('.card');
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
    };
    
    if (filterInput) {
        filterInput.addEventListener('input', runFilter);
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault(); 
                filterInput.focus();
            }
        });
    }
});
