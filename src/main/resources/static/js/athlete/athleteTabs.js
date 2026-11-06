document.addEventListener("click", event => {
    const statsButton = event.target.closest("[data-athlete-stats-category]");

    if (statsButton) {
        const container = statsButton.closest("[data-athlete-stats]");

        if (!container) {
            return;
        }

        const category = statsButton.dataset.athleteStatsCategory;

        container.querySelectorAll("[data-athlete-stats-category]").forEach(button => {
            const isActive = button.dataset.athleteStatsCategory === category;

            button.classList.toggle("btn-primary", isActive);

            button.classList.toggle("btn-outline-secondary", !isActive);
        });

        container.querySelectorAll("[data-athlete-stats-category-panel]").forEach(panel => {
            const isActive = panel.dataset.athleteStatsCategoryPanel === category;

            panel.classList.toggle("d-none", !isActive);
        });

        return;
    }

    const gameLogButton = event.target.closest("[data-athlete-gamelog-season]");

    if (gameLogButton) {
        const container = gameLogButton.closest("[data-athlete-gamelog]");

        if (!container) {
            return;
        }

        const season = gameLogButton.dataset.athleteGamelogSeason;

        container.querySelectorAll("[data-athlete-gamelog-season]").forEach(button => {
            const isActive = button.dataset.athleteGamelogSeason === season;

            button.classList.toggle("btn-primary", isActive);

            button.classList.toggle("btn-outline-secondary", !isActive);
        });

        container.querySelectorAll("[data-athlete-gamelog-season-panel]").forEach(panel => {
            const isActive = panel.dataset.athleteGamelogSeasonPanel === season;

            panel.classList.toggle("d-none", !isActive);
        });
        
        return;
    }
    
    const splitsButton = event.target.closest("[data-athlete-splits-category]");
    
    if (splitsButton) {
        const container = splitsButton.closest("[data-athlete-splits]");
        
        if (!container) {
            return;
        }
        
        const category = splitsButton.dataset.athleteSplitsCategory;
        
        container.querySelectorAll("[data-athlete-splits-category]").forEach(button => {
            const isActive = button.dataset.athleteSplitsCategory === category;
            
            button.classList.toggle("btn-primary", isActive);
            
            button.classList.toggle("btn-outline-secondary", !isActive);
        });
        
        container.querySelectorAll("[data-athlete-splits-category-panel]").forEach(panel => {
            const isActive = panel.dataset.athleteSplitsCategoryPanel === category;
            
            panel.classList.toggle("d-none", !isActive);
        });
        
        return;
    }
});