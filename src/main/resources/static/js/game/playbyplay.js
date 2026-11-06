document.addEventListener("DOMContentLoaded", function () {
    initializePlayByPlayFilters();
});

function initializePlayByPlayFilters() {
    const buttons = document.querySelectorAll("[data-play-filter]");
    
    if (buttons.length === 0) {
        return;
    }
    
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.playFilter ?? "all";
            
            setActivePlayFilter(buttons, button);
            filterPlays(filter);
        });
    });
}

function getPlayIds() {
    return new Set(Array.from(document.querySelectorAll("[data-game-play]")).map(play => play.dataset.playId).filter(Boolean));   
}

function isNearLatestPlay() {
    const threshold = 300;
    
    const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    
    return distanceFromBottom <= threshold;
}

function scrollToLatestPlay(behavior = "smooth") {
    const plays = document.querySelectorAll("[data-game-play]");
    
    if (plays.length === 0) {
        return;
    }
    
    const latestPlay = plays[plays.length - 1];
    
    latestPlay.scrollIntoView({
        behavior: behavior,
        block: "center"
    });
}

function highlightNewPlays(previousPlayIds) {
    const plays = document.querySelectorAll("[data-game-play]");
    
    plays.forEach(play => {
        const playId = play.dataset.playId;
        
        if (!playId || previousPlayIds.has(playId)) {
            return;
        }
        
        play.classList.add("game-play-new");
        
        setTimeout(() => {
            play.classList.remove("game-play-new");       
        }, 2500);
    });
}

function setActivePlayFilter(buttons, activeButton) {
    buttons.forEach(button => {
        const active = button === activeButton;
        
        button.classList.toggle("btn-primary", active);        
        button.classList.toggle("btn-outline-secondary", !active);
        
        button.classList.toggle("active", active);
    });
}

function filterPlays(filter) {
    const plays = document.querySelectorAll("[data-game-play]");
    
    const normalizedFilter = filter.toLowerCase();
    
    plays.forEach(play => {
        const categories = (play.dataset.playCategory ?? "other").toLowerCase().split(/\s+/).filter(Boolean);
        
        const visible = normalizedFilter === "all" || categories.includes(normalizedFilter);
        
        play.classList.toggle("play-hidden", !visible);
    });
    
    updateVisiblePeriods();
}

function updateVisiblePeriods() {
    const periods = document.querySelectorAll("[data-play-period]");
    
    periods.forEach(period => {
        const visiblePlay = period.querySelector("[data-game-play]:not(.play-hidden)");
        
        period.classList.toggle("play-period-hidden", !visiblePlay);
    });
}

function restorePlayFilter(filter) {
    const buttons = document.querySelectorAll("[data-play-filter]");
    
    const button = Array.from(buttons).find(button => button.dataset.playFilter === filter);
    
    if (!button) {
        filterPlays("all");
        
        return;
    }
    
    setActivePlayFilter(buttons, button);
    
    filterPlays(filter);
}