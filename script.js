document.addEventListener('DOMContentLoaded', () => {
    // --- GUIDE DATA ---
    // To add your own images, replace the placeholder URLs below with the paths to your image files.
    // For example, if you have an 'images' folder, a path would look like: 'images/pcsx2-step-1.jpg'
    const guides = {
        pcsx2: {
            title: "PCSX2 Graphic Settings",
            images: [
                'img/guides/pcsx2_display.png',
                'img/guides/pcsx2_rendering.png'
            ]
        },
        dolphin: {
            title: "Dolphin Graphic Settings",
            images: [
                'img/guides/dolphin_general.png',
                'img/guides/dolphin_enhancements.png',
                'img/guides/dolphin_advanced.png'
            ]
        },
        ppsspp: {
            title: "PPSSPP Graphic Settings",
            images: [
                'img/guides/ppsspp_rendering.png',
                'img/guides/ppsspp_texture.png'
            ]
        }
        // You can add more guides here by following the same format, e.g.:
        // another_guide: { title: "Another Guide", images: ['path/to/image1.jpg', 'path/to/image2.jpg'] }
    };
    let currentGuide = null;
    let currentImageIndex = 0;


    // --- DOM ELEMENTS ---
    const homepageContent = document.getElementById('homepage-content');
    const megathreadContent = document.getElementById('megathread-content');
    const searchBarContainer = document.getElementById('search-bar-container');
    const tabsNavContainer = document.getElementById('tabs-nav-container');
    const filterInput = document.getElementById('global-filter');
    const searchResultsContainer = document.getElementById('search-results-container');
    const imageGuideModal = document.getElementById('image-guide-modal');
    const imageGuideTitle = document.getElementById('image-guide-title');
    const guideImage = document.getElementById('guide-image');
    const guidePrevBtn = document.getElementById('guide-prev');
    const guideNextBtn = document.getElementById('guide-next');
    const imageGuideCloseBtn = document.getElementById('image-guide-close');
    const imageGuideCounter = document.getElementById('image-guide-counter');
    
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
        
        // Update URL with current tab
        const url = new URL(window.location);
        url.searchParams.set('tab', targetTabId);
        window.history.pushState({}, '', url);
        
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
        
        // Update URL with current subtab
        const url = new URL(window.location);
        url.searchParams.set('subtab', subTabId);
        window.history.pushState({}, '', url);
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
    
    // --- IMAGE GUIDE LOGIC ---
    const showImage = (index) => {
        if (!currentGuide) return;
        guideImage.src = currentGuide.images[index];
        imageGuideCounter.textContent = `${index + 1} / ${currentGuide.images.length}`;
    };

    const openImageGuide = (guideId) => {
        const guideData = guides[guideId];
        if (!guideData) return;

        currentGuide = guideData;
        currentImageIndex = 0;
        
        imageGuideTitle.textContent = currentGuide.title;
        showImage(currentImageIndex);

        imageGuideModal.classList.remove('hidden');
        imageGuideModal.classList.add('flex');
    };

    const closeImageGuide = () => {
        imageGuideModal.classList.add('hidden');
        imageGuideModal.classList.remove('flex');
        currentGuide = null;
    };
    
    const nextImage = () => {
        if (!currentGuide) return;
        currentImageIndex = (currentImageIndex + 1) % currentGuide.images.length;
        showImage(currentImageIndex);
    };

    const prevImage = () => {
         if (!currentGuide) return;
        currentImageIndex = (currentImageIndex - 1 + currentGuide.images.length) % currentGuide.images.length;
        showImage(currentImageIndex);
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
                    // Prevent navigation if a button or link inside the card was clicked
                    if (e.target.closest('a, button')) {
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
        const subTabFromUrl = params.get('subtab');

        // Always show the search bar
        searchBarContainer.classList.remove('hidden');

        if (tabFromUrl && document.querySelector(`.tabs-nav .tab-button[data-tab="${tabFromUrl}"]`)) {
            homepageContent.classList.add('hidden');
            megathreadContent.classList.remove('hidden');
            tabsNavContainer.classList.remove('hidden');
            
            // Temporarily prevent URL updates during initial load
            const originalPushState = window.history.pushState;
            window.history.pushState = () => {};
            
            activateTab(tabFromUrl);
            
            // Restore subtab if specified in URL
            if (subTabFromUrl && document.getElementById(subTabFromUrl)) {
                activateSubTab(subTabFromUrl);
            }
            
            // Restore pushState functionality
            window.history.pushState = originalPushState;
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
    
    const setupInteractionListeners = () => {
        document.body.addEventListener('click', (e) => {
            const dropdownButton = e.target.closest('.tools-dropdown-button');
            const closeButton = e.target.closest('.close-tools-button');
            const guideButton = e.target.closest('.guide-button');

            if (closeButton) {
                closeButton.closest('.card').classList.remove('tools-active');
                return;
            }

            if (dropdownButton) {
                const card = dropdownButton.closest('.card');
                // Close any other active cards before opening a new one
                document.querySelectorAll('.card.tools-active').forEach(activeCard => {
                    if (activeCard !== card) {
                        activeCard.classList.remove('tools-active');
                    }
                });
                card.classList.toggle('tools-active');
                return;
            }

            if (guideButton) {
                const guideId = guideButton.dataset.guideId;
                if(guideId) openImageGuide(guideId);
                return;
            }

            // If clicking outside an active card (and not on a tools button), close it
            if (!e.target.closest('.card.tools-active')) {
                 document.querySelectorAll('.card.tools-active').forEach(activeCard => {
                    activeCard.classList.remove('tools-active');
                });
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
    handleSubTabSwitching('#privacy');
    handleSubTabSwitching('#emulation');
    handleSubTabSwitching('#gaming');
    handleSubTabSwitching('#movies-tv');
    setupInteractionListeners();
    managePageView();
    
    // Guide Modal Listeners
    imageGuideCloseBtn.addEventListener('click', closeImageGuide);
    guideNextBtn.addEventListener('click', nextImage);
    guidePrevBtn.addEventListener('click', prevImage);
    imageGuideModal.addEventListener('click', (e) => {
        if(e.target === imageGuideModal) {
            closeImageGuide();
        }
    });

    // Copy Password Functionality
    document.addEventListener('click', (e) => {
        if (e.target.closest('.copy-password-btn')) {
            const btn = e.target.closest('.copy-password-btn');
            const password = btn.dataset.password;
            
            // Copy to clipboard
            navigator.clipboard.writeText(password).then(() => {
                // Store original content
                const originalHTML = btn.innerHTML;
                
                // Show success feedback
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
                btn.classList.add('border-green-500', 'text-green-400');
                btn.classList.remove('border-slate-600', 'text-slate-300');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('border-green-500', 'text-green-400');
                    btn.classList.add('border-slate-600', 'text-slate-300');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy password:', err);
            });
        }
    });

    // Bios Download Button Hover Text Change
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.bios-download-btn')) {
            const btn = e.target.closest('.bios-download-btn');
            const textSpan = btn.querySelector('.bios-text');
            if (textSpan) {
                textSpan.textContent = 'Download';
            }
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.bios-download-btn')) {
            const btn = e.target.closest('.bios-download-btn');
            const textSpan = btn.querySelector('.bios-text');
            if (textSpan) {
                textSpan.textContent = 'Bios';
            }
        }
    });

});




