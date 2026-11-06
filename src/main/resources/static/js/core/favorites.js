const sportsTrackerFavorites = (() => {
    const teamStorageKey = "sportsTracker.favoriteTeams";
    const athleteStorageKey = "sportsTracker.favoriteAthletes";
    
    function getStoredItems(storageKey) {
        const stored = localStorage.getItem(storageKey);
        
        if (!stored) {
            return [];
        }
        
        try {
            const parsed = JSON.parse(stored);
            
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    
    function saveStoredItems(storageKey, items) {
        localStorage.setItem(storageKey, JSON.stringify(items));
        
        document.dispatchEvent(new CustomEvent("sportsTracker:favoritesChanged"));
    }
    
    function createKey(league, id) {
        return `${String(league ?? "").toLowerCase()}:${String(id ?? "")}`;
    }
    
    const teams = {
        getAll() {
            return getStoredItems(teamStorageKey);
        },
        
        isFavorite(league, teamId) {
            const key = createKey(league, teamId);
            
            return this.getAll().some(team =>
                createKey(team.league, team.teamId) === key
            );
        },
        
        add(team) {
            if (!isValidTeam(team)) {
                return;
            }
            
            const favorites = this.getAll();
            
            if (this.isFavorite(team.league, team.teamId)) {
                return;
            }
            
            favorites.push(team);
            saveStoredItems(teamStorageKey, favorites);
        },
        
        remove(league, teamId) {
            const key = createKey(league, teamId);
            
            const favorites = this.getAll().filter(team => createKey(team.league, team.teamId) !== key);
            
            saveStoredItems(teamStorageKey, favorites);
        },
        
        toggle(team) {
            if (!isValidTeam(team)) {
                return false;
            }
            
            if (this.isFavorite(team.league, team.teamId)) {
                this.remove(team.league, team.teamId);
                
                return false;
            }
            
            this.add(team);
            
            return true;
        }
    };

    const athletes = {
        getAll() {
            return getStoredItems(athleteStorageKey);
        },

        isFavorite(league, athleteId) {
            const key = createKey(league, athleteId);

            return this.getAll().some(athlete =>
                createKey(athlete.league, athlete.athleteId) === key
            );
        },

        add(athlete) {
            if (!isValidAthlete(athlete)) {
                return;
            }

            const favorites = this.getAll();

            if (this.isFavorite(athlete.league, athlete.athleteId)) {
                return;
            }

            favorites.push(athlete);
            saveStoredItems(athleteStorageKey, favorites);
        },

        remove(league, athleteId) {
            const key = createKey(league, athleteId);

            const favorites = this.getAll().filter(athlete => createKey(athlete.league, athlete.athleteId) !== key);

            saveStoredItems(athleteStorageKey, favorites);
        },

        toggle(athlete) {
            if (!isValidAthlete(athlete)) {
                return false;
            }

            if (this.isFavorite(athlete.league, athlete.athleteId)) {
                this.remove(athlete.league, athlete.athleteId);

                return false;
            }

            this.add(athlete);

            return true;
        }
    };
    
    function isValidTeam(team) {
        return Boolean(team && team.league && team.teamId);
    }
    
    function isValidAthlete(athlete) {
        return Boolean(athlete && athlete.league && athlete.athleteId);
    }

    function refreshGameCards(root = document) {
        const gameCards = [
            ...(root.matches?.("[data-game-card]") ? [root] : []),
            ...root.querySelectorAll("[data-game-card]")
        ];

        gameCards.forEach(card => {
            const badge = card.querySelector("[data-favorite-game-badge]");

            if (!badge) {
                return;
            }

            const league = card.dataset.league;
            const awayTeamId = card.dataset.awayTeamId;
            const homeTeamId = card.dataset.homeTeamId;

            const hasFavoriteTeam = teams.isFavorite(league, awayTeamId) || teams.isFavorite(league, homeTeamId);

            badge.classList.toggle("d-none", !hasFavoriteTeam);
        });
    }

    return {
        teams,
        athletes,
        refreshGameCards
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    sportsTrackerFavorites.refreshGameCards();
});

document.addEventListener("sportsTracker:favoritesChanged", () => {
    sportsTrackerFavorites.refreshGameCards();
});
