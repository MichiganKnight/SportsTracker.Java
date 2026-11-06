let dashboardRefreshTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    await refreshDashboard();
});

document.addEventListener("sportsTracker:favoritesChanged", async () => {
    await refreshDashboardFavorites();
});

async function refreshDashboard() {
    const dashboard = getDashboard();

    if (!dashboard) {
        return;
    }

    await dashboardGames.refresh();
    
    if (typeof dashboardFavorites !== "undefined") {
        dashboardFavorites.render();
    }

    sportsTrackerFavorites.refreshGameCards(dashboard);
}

function refreshDashboardFavorites() {
    const dashboard = getDashboard();
    
    if (!dashboard) {
        return;
    }
    
    if (typeof dashboardFavorites !== "undefined") {
        dashboardFavorites.render();
    }
    
    sportsTrackerFavorites.refreshGameCards(dashboard);
}

function scheduleDashboardFeaturesRefresh() {
    clearTimeout(dashboardRefreshTimer);

    dashboardRefreshTimer = setTimeout(async () => {
        await refreshDashboard();
    }, 300);
}

function getDashboard() {
    return document.querySelector(".dashboard-page");
}