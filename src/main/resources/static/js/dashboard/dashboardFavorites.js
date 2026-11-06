window.dashboardFavorites = (() => {
    function render() {
        renderEmptyState();
        renderTeams();
        renderAthletes();
    }
    
    function renderEmptyState() {
        const emptyState = document.querySelector("#dashboard-favorites-empty");
        
        if (!emptyState) {
            return;
        }
        
        const hasFavoriteTeams = sportsTrackerFavorites.teams.getAll().length > 0;
        const hasFavoriteAthletes = sportsTrackerFavorites.athletes.getAll().length > 0;
        
        emptyState.classList.toggle("d-none", hasFavoriteTeams || hasFavoriteAthletes);
    }
    
    function renderTeams() {
        const section = document.querySelector("#dashboard-favorite-teams");
        const container = document.querySelector("#dashboard-favorite-team-list");
        
        if (!section || !container) {
            return;
        }
        
        container.replaceChildren();
        
        const favorites = sportsTrackerFavorites.teams.getAll().sort((a, b) => (a.displayName ?? "").localeCompare(b.displayName ?? ""));
        
        if (favorites.length === 0) {
            section.classList.add("d-none");
            
            return;
        }
        
        favorites.forEach(team => {
            container.appendChild(createTeamCard(team));
        });
        
        section.classList.remove("d-none");
    }
    
    function renderAthletes() {
        const section = document.querySelector("#dashboard-favorite-athletes");
        const container = document.querySelector("#dashboard-favorite-athlete-list");
        
        if (!section || !container) {
            return;
        }
        
        container.replaceChildren();
        
        const favorites = sportsTrackerFavorites.athletes.getAll().sort((a, b) => (a.displayName ?? "").localeCompare(b.displayName ?? ""));
        
        if (favorites.length === 0) {
            section.classList.add("d-none");
            
            return;
        }
        
        favorites.forEach(athlete => {
            container.appendChild(createAthleteCard(athlete));
        });
        
        section.classList.remove("d-none");
    }
    
    function createTeamCard(team) {
        const card = document.createElement("div");        
        card.className = "dashboard-favorite-team";
        
        const link = document.createElement("a");
        link.className = "dashboard-favorite-team-link";
        
        link.href = `/team/${encodeURIComponent(team.league)}/${encodeURIComponent(team.teamId)}`;
        
        if (team.logo) {
            const logo = document.createElement("img");
            logo.src = team.logo;
            logo.alt = team.displayName ?? "Favorite Team";
            logo.className = "dashboard-favorite-team-logo";
            
            link.appendChild(logo);
        }
        
        const info = document.createElement("div");
        info.className = "dashboard-favorite-team-info";
        
        const name = document.createElement("div");
        name.className = "dashboard-favorite-team-name";
        name.textContent = team.displayName ?? "Team";
        
        const league = document.createElement("div");
        league.className = "dashboard-favorite-team-league";
        league.textContent = [
            team.abbreviation,
            team.league
        ].filter(Boolean).join(" - ");
        
        info.appendChild(name);
        info.appendChild(league);
        
        link.appendChild(info);        
        card.appendChild(link);
        
        const removeButton = createRemoveButton(team.displayName ?? "Team", () => {
            sportsTrackerFavorites.teams.remove(team.league, team.teamId);
        });
        
        removeButton.classList.add("dashboard-favorite-team-remove");
        
        card.appendChild(removeButton);
        
        return card;
    }
    
    function createAthleteCard(athlete) {
        const card = document.createElement("div");        
        card.className = "dashboard-favorite-athlete";
        
        const link = document.createElement("a");
        link.className = "dashboard-favorite-athlete-link";
        
        link.href = `/athlete/${encodeURIComponent(athlete.league)}/${encodeURIComponent(athlete.athleteId)}`;
        
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "dashboard-favorite-athlete-image-wrap";
        
        if (athlete.headshot) {
            const image = document.createElement("img");
            image.src = athlete.headshot;
            image.alt = athlete.displayName ?? "Favorite Player";
            image.className = "dashboard-favorite-athlete-image";
            
            imageWrapper.appendChild(image);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "dashboard-favorite-athlete-placeholder";
            placeholder.innerHTML = `<i class="bi bi-person-fill"></i>`;            
            
            imageWrapper.appendChild(placeholder);
        }
        
        const info = document.createElement("div");
        info.className = "dashboard-favorite-athlete-info";
        
        const name = document.createElement("div");
        name.className = "dashboard-favorite-athlete-name";
        name.textContent = athlete.displayName ?? "Player";
        
        const details = document.createElement("div");
        details.className = "dashboard-favorite-athlete-details";
        details.textContent = getAthleteDetails(athlete);
        
        info.appendChild(name);
        
        if (details.textContent) {
            info.appendChild(details);
        }
        
        link.appendChild(imageWrapper);
        link.appendChild(info);
        
        card.appendChild(link);
        
        const removeButton = createRemoveButton(athlete.displayName ?? "Player", () => {
            sportsTrackerFavorites.athletes.remove(athlete.league, athlete.athleteId);
        });
        
        removeButton.classList.add("dashboard-favorite-athlete-remove");
        
        card.appendChild(removeButton);
        
        return card;
    }
    
    function createRemoveButton(displayName, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.title = "Remove from Favorites";
        button.setAttribute("aria-label", `Remove ${displayName} from Favorites`);
        
        button.innerHTML = `<i class="bi bi-star-fill"></i>`;
        
        button.addEventListener("click", onClick);
        
        return button;
    }
    
    function getAthleteDetails(athlete) {
        const details = [];
        
        if (athlete.position) {
            details.push(athlete.position);
        }
        
        if (athlete.teamName) {
            details.push(athlete.teamName);
        } else if (athlete.citizenship) {
            details.push(athlete.citizenship);
        }
        
        if (athlete.league) {
            details.push(athlete.league);
        }
        
        return details.join(" - ");
    }
    
    return {
        render
    };
})();