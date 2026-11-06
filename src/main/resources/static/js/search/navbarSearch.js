document.addEventListener("DOMContentLoaded", () => {
    const search = document.querySelector("[data-navbar-search]");

    if (!search) {
        return;
    }

    const input = search.querySelector("[data-navbar-search-input]");
    const resultsContainer = search.querySelector("[data-navbar-search-results]");

    if (!input || !resultsContainer) {
        return;
    }

    let debounceTimer = null;
    let requestController = null;

    input.addEventListener("input", () => {
        clearTimeout(debounceTimer);

        const query = input.value.trim();

        if (query.length < 2) {
            hideResults();

            return;
        }

        debounceTimer = setTimeout(() => loadSuggestions(query), 300);
    });

    document.addEventListener("click", event => {
        if (!search.contains(event.target)) {
            hideResults();
        }
    });

    input.addEventListener("focus", () => {
        if (resultsContainer.children.length > 0) {
            resultsContainer.classList.remove("d-none");
        }
    });

    async function loadSuggestions(query) {
        if (requestController) {
            requestController.abort();
        }

        requestController = new AbortController();

        try {
            const response = await fetch(`/search/suggestions?q=${encodeURIComponent(query)}`, {
                signal: requestController.signal
            });

            if (!response.ok) {
                hideResults();

                return;
            }

            const data = await response.json();

            if (input.value.trim() !== query) {
                return;
            }

            renderSuggestions(data);
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Unable to Load Suggestions:", error);
            }
        }
    }

    function renderSuggestions(data) {
        resultsContainer.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            const empty = document.createElement("div");

            empty.className = "navbar-search-empty";

            empty.textContent = "No Matching Players, Teams or Games";

            resultsContainer.appendChild(empty);
        } else {
            data.results.forEach(result => {
                resultsContainer.appendChild(createSuggestion(result));
            });
        }

        if (data.query) {
            resultsContainer.appendChild(createViewAll(data.query));
        }

        resultsContainer.classList.remove("d-none");
    }

    function createSuggestion(result) {
        const link = document.createElement("a");
        
        link.href = result.url;
        
        link.className = "navbar-search-result";
        
        const imageWrap = document.createElement("div");
        
        imageWrap.className = "navbar-search-result-image-wrap";
        
        if (result.image) {
            const image = document.createElement("img");
            
            image.src = result.image;
            image.alt = result.displayName;
            image.className = "navbar-search-result-image";
            
            imageWrap.appendChild(image);
        } else {
            const icon = document.createElement("i");
            
            icon.className = getResultIcon(result.type);
            
            imageWrap.appendChild(icon);
        }
        
        const content = document.createElement("div");
        
        content.className = "navbar-search-result-content";
        
        const name = document.createElement("div");
        
        name.className = "navbar-search-result-name";
        
        name.textContent = result.displayName;
        
        const meta = document.createElement("div");
        
        meta.className = "navbar-search-result-meta";
        
        meta.textContent = getResultMeta(result);
        
        content.appendChild(name);
        content.appendChild(meta);
        
        link.appendChild(imageWrap);
        link.appendChild(content);
        
        return link;
    }
    
    function getResultMeta(result) {
        if (!result.subtitle) {
            return result.league;
        }
        
        if (result.subtitle.toLowerCase() === result.league.toLowerCase()) {
            return result.league;
        }
        
        return `${result.league} - ${result.subtitle}`;
    }
    
    function createViewAll(query) {
        const link = document.createElement("a");
        
        link.href = `/search?q=${encodeURIComponent(query)}`;
        
        link.className = "navbar-search-view-all";
        
        link.innerHTML = `<i class="bi bi-search me-2"></i>View All Results for "${escapeHtml(query)}"`;
        
        return link;
    }
    
    function getResultIcon(type) {
        switch (type) {
            case "Player":
                return "bi bi-person-fill";
            case "Team":
                return "bi bi-shield-fill";
            case "Game":
                return "bi bi-calendar-event-fill";
            
            default:
                return "bi bi-search";
        }
    }
    
    function hideResults() {
        resultsContainer.classList.add("d-none");
    }
    
    function escapeHtml(value) {
        const div = document.createElement("div");
        
        div.textContent = value;
        
        return div.innerHTML;
    }
});