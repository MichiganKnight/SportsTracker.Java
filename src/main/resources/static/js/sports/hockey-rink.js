document.addEventListener("change", (event) => {
    const target = event.target;
    
    if (!(target instanceof Element)) {
        return;
    }
    
    const map = target.closest("[data-hockey-shot-map]");
    if (!map) {
        return;
    }
    
    const team = map.querySelector("[data-hockey-team]")?.value ?? "all";
    const period = map.querySelector("[data-hockey-period]")?.value ?? "all";
    const goalsOnly = map.querySelector("[data-hockey-goals-only]")?.checked ?? false;
    
    map.querySelectorAll(".hockey-map-shot").forEach((shot) => {
        const teamMatches = team === "all" || shot.dataset.team === team;
        const periodMatches = period === "all" || shot.dataset.period === period;
        const goalMatches = !goalsOnly || shot.dataset.goal === "true";
        
        shot.style.display = teamMatches && periodMatches && goalMatches ? "" : "none";
    });
});