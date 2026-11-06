document.addEventListener("DOMContentLoaded", () => {
    initializeTeamFavoritesButtons();
});

document.addEventListener("sportsTracker:favoritesChanged", () => {
    initializeTeamFavoritesButtons();
});

function initializeTeamFavoritesButtons() {
    const buttons = document.querySelectorAll("[data-favorite-team]");
    
    buttons.forEach(button => {
        const league = button.dataset.league;
        const teamId = button.dataset.teamId;
        
        if (!league || !teamId) {
            return;
        }
        
        updateFavoriteButton(button, sportsTrackerFavorites.teams.isFavorite(league, teamId));

        if (button.dataset.favoriteInitialized === "true") {
            return;
        }
        
        button.dataset.favoriteInitialized = "true";
        
        button.addEventListener("click", () => {
            const team = {
                league: button.dataset.league,
                teamId: button.dataset.teamId,
                displayName: button.dataset.teamName ?? "",
                abbreviation: button.dataset.teamAbbreviation ?? "",
                logo: button.dataset.teamLogo ?? ""
            };
            
            const isFavorite = sportsTrackerFavorites.teams.toggle(team);
            
            updateFavoriteButton(button, isFavorite);
        });
    });
}

function updateFavoriteButton(button, isFavorite) {
    const icon = button.querySelector("i");
    const label = button.querySelector("span");
    const teamName = button.dataset.teamName ?? "team";
    
    button.setAttribute("aria-pressed", isFavorite.toString());
    button.setAttribute("aria-label", isFavorite ? `Remove ${teamName} from Favorites` : `Add ${teamName} to Favorites`);
    
    button.title = isFavorite ? `Remove from Favorites` : `Add to Favorites`;   
    
    button.classList.toggle("is-favorite", isFavorite);
    
    if (icon) {
        icon.className = isFavorite ? "bi bi-star-fill" : "bi bi-star";
    }
    
    if (label) {
        label.textContent = isFavorite ? "Favorited" : "Favorite";
    }
}