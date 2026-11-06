window.dashboardGames = (() => {
    let gameCards = [];
    
    async function refresh() {
        gameCards = await loadGameCards();

        render();
    }
    
    function render() {
        renderFavoriteGames();
        renderLiveGames();
    }
    
    async function loadGameCards() {
        try {
            const response = await fetch(`/Dashboard/AllGames?t=${Date.now()}`);
            
            if (!response.ok) {
                console.error("Unable to Load Complete Dashboard Scoreboard");
                
                return getVisibleGameCards();
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            
            const documentFragment = parser.parseFromString(html, "text/html");
            
            return Array.from(documentFragment.querySelectorAll("[data-game-card]"));
        } catch (error) {
            console.error("Unable to Load Complete Dashboard Scoreboard", error);
            
            return getVisibleGameCards();
        }
    }
    
    function getVisibleGameCards() {
        const leagueContainer = document.querySelector("#dashboard-leagues");
        
        if (!leagueContainer) {
            return [];
        }
        
        return Array.from(leagueContainer.querySelectorAll("[data-game-card]"));
    }
    
    function renderFavoriteGames() {
        const games = gameCards.filter(card => {
            const league = card.dataset.league;
            const awayTeamId = card.dataset.awayTeamId;
            const homeTeamId = card.dataset.homeTeamId;
            
            return sportsTrackerFavorites.teams.isFavorite(league, awayTeamId) || sportsTrackerFavorites.teams.isFavorite(league, homeTeamId);
        });
        
        renderGameSection("#dashboard-favorites", "#dashboard-favorite-games", games);
    }
    
    function renderLiveGames() {
        const games = gameCards.filter(card => card.dataset.isLive === "true");
        
        renderGameSection("#dashboard-live", "#dashboard-live-games", games);
    }
    
    function renderGameSection(sectionSelector, containerSelector, games) {
        const section = document.querySelector(sectionSelector);
        const container = document.querySelector(containerSelector);
        
        if (!section || !container) {
            return;
        }
        
        container.replaceChildren();
        
        if (games.length === 0) {
            section.classList.add("d-none");
            
            return;
        }
        
        games.forEach(game => {
            container.appendChild(createGameColumn(game)); 
        });
        
        sportsTrackerFavorites.refreshGameCards(container);
        
        section.classList.remove("d-none");
    }
    
    function createGameColumn(card) {
        const column = document.createElement("div");
        column.className = "col-12 col-xl-6 col-xxl-4";
        
        const clone = card.cloneNode(true);
        
        column.appendChild(clone);
        
        return column;
    }
    
    return {
        refresh,
        render
    }
})();
