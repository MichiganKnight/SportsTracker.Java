window.dashboardOverview = (() => {
    function render() {
        const teamCount = document.querySelector("[data-dashboard-favorite-team-count]");
        const athleteCount = document.querySelector("[data-dashboard-favorite-athlete-count]");

        if (teamCount) {
            teamCount.textContent = sportsTrackerFavorites.teams.getAll().length;
        }

        if (athleteCount) {
            athleteCount.textContent = sportsTrackerFavorites.athletes.getAll().length;
        }
    }

    return {
        render
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    dashboardOverview.render();
});

document.addEventListener("sportsTracker:favoritesChanged", () => {
    dashboardOverview.render();
});