document.addEventListener("DOMContentLoaded", () => {
    initializeAthleteFavoriteButtons();
});

document.addEventListener("sportsTracker:favoritesChanged", () => {
    initializeAthleteFavoriteButtons();
});

function initializeAthleteFavoriteButtons() {
    const buttons = document.querySelectorAll("[data-favorite-athlete]");

    buttons.forEach(button => {
        const league = button.dataset.league;
        const athleteId = button.dataset.athleteId;

        if (!league || !athleteId) {
            return;
        }

        updateAthleteFavoriteButton(button, sportsTrackerFavorites.athletes.isFavorite(league, athleteId));

        if (button.dataset.favoriteInitialized === "true") {
            return;
        }

        button.dataset.favoriteInitialized = "true";

        button.addEventListener("click", () => {
                const athlete = {
                    league: button.dataset.league,
                    athleteId: button.dataset.athleteId,
                    displayName: button.dataset.athleteName ?? "",
                    headshot: button.dataset.athleteHeadshot ?? "",
                    teamId: button.dataset.athleteTeamId ?? "",
                    teamName: button.dataset.athleteTeamName ?? "",
                    position: button.dataset.athletePosition ?? "",
                    citizenship: button.dataset.athleteCitizenship ?? ""
                };

                const isFavorite = sportsTrackerFavorites.athletes.toggle(athlete);

                updateAthleteFavoriteButton(button, isFavorite);
            }
        );
    });
}

function updateAthleteFavoriteButton(button, isFavorite) {
    const icon = button.querySelector("i");
    const label = button.querySelector("span");

    const athleteName = button.dataset.athleteName ?? "athlete";

    button.setAttribute("aria-pressed", isFavorite.toString());

    button.setAttribute("aria-label", isFavorite ? `Remove ${athleteName} from Favorites` : `Add ${athleteName} to Favorites`);

    button.title = isFavorite ? "Remove from Favorites" : "Add to Favorites";

    button.classList.toggle("is-favorite", isFavorite);

    if (icon) {
        icon.className = isFavorite ? "bi bi-star-fill" : "bi bi-star";
    }

    if (label) {
        label.textContent = isFavorite ? "Favorited" : "Favorite";
    }
}