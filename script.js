document.addEventListener('DOMContentLoaded', () => {
    // --- GUIDE DATA ---
    // To add your own images, replace the placeholder URLs below with the paths to your image files.
    // For example, if you have an 'images' folder, a path would look like: 'images/pcsx2-step-1.jpg'
    const guides = {
        pcsx2: {
            title: "PCSX2 Graphic Settings",
            categories: {
                "High End PC": [
                    'img/guides/pcsx2_display.png',
                    'img/guides/pcsx2_rendering.png'
                ],
                "Low End PC": [
                    // Add low-end PC images here
                ]
            }
        },
        dolphin: {
            title: "Dolphin Graphic Settings",
            categories: {
                "High End PC": [
                    'img/guides/dolphin_general.png',
                    'img/guides/dolphin_enhancements.png',
                    'img/guides/dolphin_advanced.png'
                ],
                "Low End PC": [
                    // Add low-end PC images here
                ]
            }
        },
        ppsspp: {
            title: "PPSSPP Graphic Settings",
            categories: {
                "High End PC": [
                    'img/guides/ppsspp_rendering.png',
                    'img/guides/ppsspp_texture.png'
                ],
                "Low End PC": [
                    // Add low-end PC images here
                ]
            }
        }
        // You can add more guides here by following the same format
    };
    let currentGuide = null;
    let currentCategory = null;
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
    const getCurrentImages = () => {
        if (!currentGuide || !currentCategory) return [];
        return currentGuide.categories[currentCategory] || [];
    };

    const showImage = (index) => {
        const images = getCurrentImages();
        if (images.length === 0) return;
        guideImage.src = images[index];
        imageGuideCounter.textContent = `${index + 1} / ${images.length}`;
    };

    const switchCategory = (category) => {
        currentCategory = category;
        currentImageIndex = 0;
        
        // Update category button styles
        const categoryButtons = document.querySelectorAll('.guide-category-btn');
        categoryButtons.forEach(btn => {
            if (btn.textContent === category) {
                btn.classList.add('active', 'bg-violet-500', 'text-white');
                btn.classList.remove('bg-slate-700', 'text-slate-300');
            } else {
                btn.classList.remove('active', 'bg-violet-500', 'text-white');
                btn.classList.add('bg-slate-700', 'text-slate-300');
            }
        });
        
        showImage(currentImageIndex);
    };

    const openImageGuide = (guideId) => {
        const guideData = guides[guideId];
        if (!guideData) return;

        currentGuide = guideData;
        currentCategory = "High End PC"; // Default to High End PC
        currentImageIndex = 0;
        
        imageGuideTitle.textContent = currentGuide.title;
        
        // Create category buttons
        const categoryContainer = document.getElementById('guide-category-container');
        categoryContainer.innerHTML = '';
        
        Object.keys(currentGuide.categories).forEach((category, index) => {
            const images = currentGuide.categories[category];
            // Only show category if it has images
            if (images && images.length > 0) {
                const btn = document.createElement('button');
                btn.className = 'guide-category-btn px-4 py-2 rounded-lg font-semibold transition-colors';
                btn.textContent = category;
                
                if (index === 0) {
                    btn.classList.add('active', 'bg-violet-500', 'text-white');
                } else {
                    btn.classList.add('bg-slate-700', 'text-slate-300', 'hover:bg-slate-600');
                }
                
                btn.addEventListener('click', () => switchCategory(category));
                categoryContainer.appendChild(btn);
            }
        });
        
        showImage(currentImageIndex);

        imageGuideModal.classList.remove('hidden');
        imageGuideModal.classList.add('flex');
    };

    const closeImageGuide = () => {
        imageGuideModal.classList.add('hidden');
        imageGuideModal.classList.remove('flex');
        currentGuide = null;
        currentCategory = null;
    };
    
    const nextImage = () => {
        const images = getCurrentImages();
        if (images.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % images.length;
        showImage(currentImageIndex);
    };

    const prevImage = () => {
        const images = getCurrentImages();
        if (images.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
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
                
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                const rect = dropdownButton.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
                dropdownButton.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
                
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

    // --- SETTINGS DROPDOWN ---
    const settingsDropdownBtn = document.getElementById('settings-dropdown-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');
    
    settingsDropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsDropdown?.contains(e.target) && !settingsDropdownBtn?.contains(e.target)) {
            settingsDropdown?.classList.add('hidden');
        }
    });

    // --- THEME TOGGLE ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeText = document.getElementById('theme-text');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', currentTheme);
    
    // Update icon and text based on current theme
    function updateThemeUI(theme) {
        if (theme === 'light') {
            themeIconDark.classList.remove('hidden');
            themeIconLight.classList.add('hidden');
            themeText.textContent = 'Light Mode';
            document.body.classList.add('light-mode');
        } else {
            themeIconDark.classList.add('hidden');
            themeIconLight.classList.remove('hidden');
            themeText.textContent = 'Dark Mode';
            document.body.classList.remove('light-mode');
        }
    }
    
    updateThemeUI(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const theme = htmlElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeUI(newTheme);
    });

    // --- IMPORT/EXPORT FAVORITES ---
    const importBtnDropdown = document.getElementById('import-btn-dropdown');
    const exportBtnDropdown = document.getElementById('export-btn-dropdown');
    
    // Create hidden file input for import
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    importBtnDropdown?.addEventListener('click', () => {
        fileInput.click();
        settingsDropdown?.classList.add('hidden');
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedFavorites = JSON.parse(event.target.result);
                
                if (!Array.isArray(importedFavorites)) {
                    alert('Invalid favorites file format!');
                    return;
                }
                
                // Merge with existing favorites (avoid duplicates)
                importedFavorites.forEach(url => {
                    if (!favorites.includes(url)) {
                        favorites.push(url);
                    }
                });
                
                localStorage.setItem('favorites', JSON.stringify(favorites));
                
                // Refresh the page to show updated favorites
                alert(`Successfully imported ${importedFavorites.length} favorites!`);
                location.reload();
            } catch (error) {
                alert('Error reading favorites file. Please make sure it\'s a valid JSON file.');
            }
        };
        
        reader.readAsText(file);
        fileInput.value = ''; // Reset input
    });
    
    exportBtnDropdown?.addEventListener('click', () => {
        if (favorites.length === 0) {
            alert('No favorites to export!');
            return;
        }
        
        const data = JSON.stringify(favorites, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'megathread-favorites.json';
        a.click();
        URL.revokeObjectURL(url);
        
        settingsDropdown?.classList.add('hidden');
    });

    // --- BACK TO TOP BUTTON ---
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
            backToTopButton.classList.add('opacity-100');
        } else {
            backToTopButton.classList.add('opacity-0', 'pointer-events-none');
            backToTopButton.classList.remove('opacity-100');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- COPY LINK FUNCTIONALITY ---
    document.addEventListener('click', (e) => {
        if (e.target.closest('.copy-link-btn')) {
            e.preventDefault();
            e.stopPropagation();
            
            const btn = e.target.closest('.copy-link-btn');
            const url = btn.getAttribute('data-url');
            
            navigator.clipboard.writeText(url).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                btn.classList.remove('bg-slate-700/50');
                btn.classList.add('bg-green-600');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('bg-green-600');
                    btn.classList.add('bg-slate-700/50');
                }, 2000);
            });
        }
    });

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('global-filter').focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('global-filter');
            if (searchInput === document.activeElement) {
                searchInput.value = '';
                searchInput.blur();
                document.getElementById('search-results-container').classList.add('hidden');
            }
        }
    });

    // --- ADD FAVICONS TO CARD TITLES ---
    function addFavicons() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            // Skip if already has favicon
            if (card.querySelector('.card-favicon')) return;
            
            const link = card.querySelector('a[href^="http"]');
            if (!link) return;
            
            const url = link.getAttribute('href');
            const titleElement = card.querySelector('h3');
            if (!titleElement) return;
            
            // Extract domain from URL
            let domain;
            try {
                const urlObj = new URL(url);
                domain = urlObj.hostname;
            } catch (e) {
                return;
            }
            
            // Create favicon image
            const favicon = document.createElement('img');
            favicon.className = 'card-favicon inline-block mr-2 flex-shrink-0';
            favicon.style.width = '20px';
            favicon.style.height = '20px';
            favicon.style.objectFit = 'contain';
            
            // Use Google's favicon service as fallback
            favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
            
            // Handle error by using a default icon
            favicon.onerror = () => {
                favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(148, 163, 184)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
            };
            
            // Make title flex if not already
            if (!titleElement.style.display || titleElement.style.display !== 'flex') {
                titleElement.style.display = 'flex';
                titleElement.style.alignItems = 'center';
            }
            
            // Insert favicon at the beginning
            titleElement.insertBefore(favicon, titleElement.firstChild);
        });
    }

    // --- AUTO-ADD COPY LINK BUTTONS TO ALL CARDS ---
    function addCopyLinkButtons() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            // Get all links in the card (including multiple options)
            const links = card.querySelectorAll('a[href^="http"]');
            if (links.length === 0) return;
            
            links.forEach(link => {
                // Skip if this link already has a copy button
                if (link.querySelector('.copy-link-btn')) return;
                
                // Skip if this is a bios download button
                if (link.classList.contains('bios-download-btn')) return;
                
                const url = link.getAttribute('href');
                
                // Create copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-link-btn ml-auto p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 transition-all border border-slate-600 inline-flex items-center justify-center flex-shrink-0';
                copyBtn.setAttribute('data-url', url);
                copyBtn.title = 'Copy link';
                copyBtn.innerHTML = '<svg class="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
                
                // Make the link a flex container and add the copy button inside
                link.style.display = 'flex';
                link.style.alignItems = 'center';
                link.style.justifyContent = 'space-between';
                link.style.gap = '0.5rem';
                
                // Wrap the existing text in a span
                const linkText = link.textContent;
                link.textContent = '';
                const textSpan = document.createElement('span');
                textSpan.textContent = linkText;
                link.appendChild(textSpan);
                link.appendChild(copyBtn);
            });
            
            card.classList.add('group');
        });
    }

    // --- ADD RECENTLY ADDED BADGES ---
    function addRecentlyAddedBadges() {
        // Define recently added resources (add URLs of new resources here)
        const recentlyAdded = [
            'auth.ente.io',
            'mpv.io',
            'flingtrainer.com',
            'playnite.link',
            'opensubtitles.com',
            'iptv-org',
            'handbrake.fr',
            'bcuninstaller.com',
            'code.visualstudio.com',
            'mega.nz',
            'proton.me/drive'
        ];
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const link = card.querySelector('a[href^="http"]');
            if (!link) return;
            
            const url = link.getAttribute('href');
            const isRecent = recentlyAdded.some(recent => url.includes(recent));
            
            if (isRecent && !card.querySelector('.recently-added-badge')) {
                // Find the title container
                const titleContainer = card.querySelector('.flex.items-start.justify-between');
                if (!titleContainer) return;
                
                const badge = document.createElement('div');
                badge.className = 'recently-added-badge ml-2 px-2 py-1 rounded-full bg-green-500/20 border border-green-500 text-green-400 text-xs font-bold';
                badge.textContent = 'NEW';
                
                // Insert after the title (before the tag)
                const title = titleContainer.querySelector('h3');
                if (title) {
                    title.style.display = 'flex';
                    title.style.alignItems = 'center';
                    title.appendChild(badge);
                }
            }
        });
    }

    // --- FAVORITES/BOOKMARKS SYSTEM ---
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // --- POPULATE FAVORITES TAB ---
    function populateFavoritesTab() {
        const favoritesGrid = document.getElementById('favorites-grid');
        const noFavoritesMessage = document.getElementById('no-favorites-message');
        
        if (!favoritesGrid) return;
        
        // Clear existing content
        favoritesGrid.innerHTML = '';
        
        if (favorites.length === 0) {
            favoritesGrid.classList.add('hidden');
            if (noFavoritesMessage) noFavoritesMessage.classList.remove('hidden');
            return;
        }
        
        favoritesGrid.classList.remove('hidden');
        if (noFavoritesMessage) noFavoritesMessage.classList.add('hidden');
        
        // Find all favorited cards and clone them
        favorites.forEach(url => {
            const allCards = document.querySelectorAll('.card');
            allCards.forEach(card => {
                const link = card.querySelector('a[href^="http"]');
                if (!link) return;
                
                const cardUrl = link.getAttribute('href');
                if (cardUrl === url) {
                    // Clone the card
                    const clonedCard = card.cloneNode(true);
                    clonedCard.classList.add('is-visible');
                    clonedCard.style.opacity = '1';
                    clonedCard.style.transform = '';
                    favoritesGrid.appendChild(clonedCard);
                }
            });
        });
        
        // Re-apply enhancements to cloned cards
        setTimeout(() => {
            addFavicons();
            addCopyLinkButtons();
            addRecentlyAddedBadges();
            addFavoriteButtons();
        }, 100);
    }
    
    function addFavoriteButtons() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.querySelector('.favorite-btn')) return;
            
            const link = card.querySelector('a[href^="http"]');
            if (!link) return;
            
            const url = link.getAttribute('href');
            const titleElement = card.querySelector('h3');
            if (!titleElement) return;
            
            const title = titleElement.textContent || 'Resource';
            const isFavorite = favorites.includes(url);
            
            const favBtn = document.createElement('button');
            favBtn.className = `favorite-btn ml-2 p-1 rounded transition-all ${isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`;
            favBtn.setAttribute('data-url', url);
            favBtn.setAttribute('data-title', title);
            favBtn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
            favBtn.innerHTML = isFavorite ? 
                '<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>' :
                '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>';
            
            // Make title flex and add button
            titleElement.style.display = 'flex';
            titleElement.style.alignItems = 'center';
            titleElement.appendChild(favBtn);
        });
    }
    
    // Store original card positions
    const originalCardPositions = new Map();
    
    // --- SAVE ORIGINAL POSITIONS ---
    function saveOriginalPositions() {
        const subTabContents = document.querySelectorAll('.sub-tab-content');
        
        subTabContents.forEach(subTab => {
            const cardsGrid = subTab.querySelector('.grid');
            if (!cardsGrid) return;
            
            const cards = Array.from(cardsGrid.querySelectorAll('.card'));
            cards.forEach((card, index) => {
                const link = card.querySelector('a[href^="http"]');
                if (!link) return;
                
                const url = link.getAttribute('href');
                if (!originalCardPositions.has(url)) {
                    originalCardPositions.set(url, {
                        card: card,
                        originalIndex: index,
                        parentGrid: cardsGrid
                    });
                }
            });
        });
    }
    
    // --- REORDER CARDS BY FAVORITES ---
    function reorderCardsByFavorites() {
        // Get all sub-tab contents
        const subTabContents = document.querySelectorAll('.sub-tab-content');
        
        subTabContents.forEach(subTab => {
            const cardsGrid = subTab.querySelector('.grid');
            if (!cardsGrid) return;
            
            const cards = Array.from(cardsGrid.querySelectorAll('.card'));
            if (cards.length === 0) return;
            
            // Separate favorited and non-favorited cards with their original positions
            const favoritedCards = [];
            const nonFavoritedCards = [];
            
            cards.forEach((card, currentIndex) => {
                const link = card.querySelector('a[href^="http"]');
                if (!link) return;
                
                const url = link.getAttribute('href');
                const isFavorited = favorites.includes(url);
                const originalPos = originalCardPositions.get(url);
                
                if (isFavorited) {
                    // Add order based on position in favorites array
                    const favoriteIndex = favorites.indexOf(url);
                    favoritedCards.push({ card, favoriteIndex });
                } else {
                    nonFavoritedCards.push({ 
                        card, 
                        originalIndex: originalPos ? originalPos.originalIndex : currentIndex 
                    });
                }
            });
            
            // Sort favorited cards by the order they were added to favorites
            favoritedCards.sort((a, b) => a.favoriteIndex - b.favoriteIndex);
            
            // Sort non-favorited cards by their original position
            nonFavoritedCards.sort((a, b) => a.originalIndex - b.originalIndex);
            
            // Clear the grid
            cardsGrid.innerHTML = '';
            
            // Add favorited cards first (in order)
            favoritedCards.forEach(item => {
                item.card.classList.add('favorited-card');
                cardsGrid.appendChild(item.card);
            });
            
            // Then add non-favorited cards in their original order
            nonFavoritedCards.forEach(item => {
                cardsGrid.appendChild(item.card);
            });
        });
    }
    
    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const url = btn.getAttribute('data-url');
            const title = btn.getAttribute('data-title');
            
            const card = btn.closest('.card');
            const index = favorites.indexOf(url);
            if (index > -1) {
                favorites.splice(index, 1);
                btn.innerHTML = '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>';
                btn.className = 'favorite-btn ml-2 p-1 rounded transition-all text-slate-400 hover:text-red-400';
                btn.title = 'Add to favorites';
                if (card) card.classList.remove('favorited-card');
            } else {
                favorites.push(url);
                btn.innerHTML = '<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>';
                btn.className = 'favorite-btn ml-2 p-1 rounded transition-all text-red-500';
                btn.title = 'Remove from favorites';
                if (card) card.classList.add('favorited-card');
            }
            
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Reorder cards after favoriting/unfavoriting
            reorderCardsByFavorites();
            
            // Refresh favorites tab
            populateFavoritesTab();
        }
    });

    // --- RESOURCE COUNTER ---
    function updateResourceCounters() {
        const categories = document.querySelectorAll('.category-card');
        categories.forEach(categoryCard => {
            const href = categoryCard.getAttribute('href');
            if (!href) return;
            
            const tabName = href.replace('?tab=', '');
            const tabContent = document.getElementById(tabName);
            if (!tabContent) return;
            
            const resourceCount = tabContent.querySelectorAll('.card').length;
            
            // Add counter badge if not exists
            if (!categoryCard.querySelector('.resource-counter')) {
                const counter = document.createElement('div');
                counter.className = 'resource-counter absolute top-4 right-4 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500 text-violet-400 text-sm font-bold';
                counter.textContent = `${resourceCount} resources`;
                categoryCard.style.position = 'relative';
                categoryCard.appendChild(counter);
            }
        });
    }

    // --- ADVANCED SEARCH FILTERS ---
    function addSearchFilters() {
        const searchContainer = document.getElementById('search-bar-container');
        if (!searchContainer || document.getElementById('search-filters')) return;
        
        const filtersHTML = `
            <div id="search-filters" class="flex items-center gap-2">
                <select id="tag-filter" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm border border-slate-700 focus:outline-none focus:border-violet-500">
                    <option value="all">All Tags</option>
                    <option value="goat">GOAT Only</option>
                    <option value="recommended">Recommended Only</option>
                </select>
            </div>
        `;
        
        const searchDiv = searchContainer.querySelector('.relative.max-w-lg');
        if (searchDiv) {
            searchDiv.insertAdjacentHTML('afterend', filtersHTML);
            
            // Add filter functionality
            document.getElementById('tag-filter')?.addEventListener('change', applyFilters);
        }
    }
    
    function applyFilters() {
        const tagFilter = document.getElementById('tag-filter')?.value || 'all';
        
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) return;
        
        const cards = Array.from(activeTab.querySelectorAll('.card'));
        if (cards.length === 0) return;
        
        // Filter by tag
        cards.forEach(card => {
            if (tagFilter === 'all') {
                card.style.display = '';
            } else if (tagFilter === 'goat') {
                card.style.display = card.classList.contains('tag-goat') ? '' : 'none';
            } else if (tagFilter === 'recommended') {
                card.style.display = card.classList.contains('tag-recommended') ? '' : 'none';
            }
        });
    }

    // --- UPDATE STATS BANNER ---
    function updateStatsBanner() {
        const allCards = document.querySelectorAll('.card');
        const goatCards = document.querySelectorAll('.card.tag-goat');
        const recentCards = document.querySelectorAll('.recently-added-badge');
        
        const totalResourcesEl = document.getElementById('total-resources');
        const goatResourcesEl = document.getElementById('goat-resources');
        const newResourcesEl = document.getElementById('new-resources');
        
        if (totalResourcesEl) totalResourcesEl.textContent = allCards.length;
        if (goatResourcesEl) goatResourcesEl.textContent = goatCards.length;
        if (newResourcesEl) newResourcesEl.textContent = recentCards.length;
    }

    // --- RANDOM RESOURCE BUTTON ---
    function addRandomButton() {
        const searchContainer = document.getElementById('search-bar-container');
        if (!searchContainer || document.getElementById('random-btn')) return;
        
        const randomBtn = document.createElement('button');
        randomBtn.id = 'random-btn';
        randomBtn.className = 'px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors flex items-center gap-2';
        randomBtn.title = 'Random resource';
        randomBtn.innerHTML = '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Random';
        
        searchContainer.appendChild(randomBtn);
        
        randomBtn.addEventListener('click', () => {
            // Get random card from cached data
            if (allCardsData.length === 0) {
                cacheAllCards();
            }
            
            if (allCardsData.length === 0) return;
            
            const randomCardData = allCardsData[Math.floor(Math.random() * allCardsData.length)];
            
            // Use navigateToCard function which handles everything
            navigateToCard(randomCardData);
            
            // Add enhanced highlight effect
            setTimeout(() => {
                randomCardData.element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    randomCardData.element.style.transform = '';
                }, 3000);
            }, 100);
        });
    }

    // Initialize all enhancements
    setTimeout(() => {
        saveOriginalPositions(); // Save original card positions first
        addFavicons();
        addCopyLinkButtons();
        addRecentlyAddedBadges();
        addFavoriteButtons();
        reorderCardsByFavorites(); // Apply favorite ordering on load
        populateFavoritesTab(); // Populate favorites tab
        updateResourceCounters();
        addSearchFilters();
        updateStatsBanner();
        addRandomButton();
    }, 500);

    // Re-apply enhancements when switching tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                addFavicons();
                addCopyLinkButtons();
                addRecentlyAddedBadges();
                addFavoriteButtons();
            }, 100);
        });
    });

});




