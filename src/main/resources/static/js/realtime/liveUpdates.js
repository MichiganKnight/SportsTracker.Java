const connection = new signalR.HubConnectionBuilder()
    .withUrl("/scoreboardHub")
    .withAutomaticReconnect()
    .build();

connection.on("ScoreboardUpdated", async payload => {
    await handleScoreboardUpdated(payload)
});

async function handleScoreboardUpdated(payload) {
    await Promise.all([
        refreshDashboardLeague(payload),
        refreshGamesLeague(payload),
        refreshLeaguePage(payload),
        refreshGameDetails(payload),
        refreshBoxScore(payload),
        refreshPlayByPlay(payload)
    ]);
}

/**
 * Dashboard League Section
 */
async function refreshDashboardLeague(payload) {
    if (document.querySelector(".games-page")) {
        return;
    }

    const league = payload.league;
    const leagueKey = league.toLowerCase();
    const selector = `#league-${leagueKey}`;
    const current = document.querySelector(selector);

    if (!current) {
        return;
    }

    const oldScores = captureScores(current);

    await refreshPartial({
        selector: selector,
        url: `/Dashboard/LeagueSection?league=${encodeURIComponent(league)}&t=${Date.now()}`,
        afterReplace: async replacement => {
            const changedGames = findScoreChanges(oldScores, replacement);

            animateScoreChanges(changedGames);

            if (typeof sportsTrackerFavorites === "function") {
                sportsTrackerFavorites.refreshGameCards(replacement);
            }

            if (typeof scheduleDashboardFeaturesRefresh === "function") {
                scheduleDashboardFeaturesRefresh();
            }
        }
    });
}

/**
 * Games Page League Section
 */
async function refreshGamesLeague(payload) {
    const gamesPage = document.querySelector(".games-page");

    if (!gamesPage) {
        return;
    }

    if (gamesPage.dataset.isToday !== "true") {
        return;
    }

    const league = payload.league;
    const leagueKey = league.toLowerCase();
    const selector = `#league-${leagueKey}`;
    const current = document.querySelector(selector);

    if (!current) {
        return;
    }

    const oldScores = captureScores(current);

    await refreshPartial({
        selector: selector,
        url: `/games/league-section?league=${encodeURIComponent(league)}&t=${Date.now()}`,
        afterReplace: replacement => {
            const changedGames = findScoreChanges(oldScores, replacement);

            animateScoreChanges(changedGames);

            if (typeof sportsTrackerFavorites === "function") {
                sportsTrackerFavorites.refreshGameCards(replacement);
            }
        }
    })
}

/**
 * League Page
 */
async function refreshLeaguePage(payload) {
    const league = payload.league;
    const leagueKey = league.toLowerCase();
    const selector = `#league-games-${leagueKey}`;
    const current = document.querySelector(selector);

    if (!current) {
        return;
    }

    const oldScores = captureScores(current);

    await refreshPartial({
        selector: selector,
        url: `/league/GameSections?league=${encodeURIComponent(league)}&t=${Date.now()}`,
        afterReplace: replacement => {
            const changedGames = findScoreChanges(oldScores, replacement);

            animateScoreChanges(changedGames);

            if (typeof sportsTrackerFavorites === "function") {
                sportsTrackerFavorites.refreshGameCards(replacement);
            }
        }
    });
}

/**
 * Game Summary Page
 */
async function refreshGameDetails(payload) {
    const page = document.querySelector("[data-game-summary-page]");

    if (!page) {
        return;
    }

    if (page.dataset.league?.toUpperCase() === "NFL" && page.querySelector("[data-football-playback]")) {
        return;
    }

    const league = page.dataset.league;
    const gameId = page.dataset.gameId;

    if (!isMatchingLeague(league, payload.league)) {
        return;
    }

    await refreshPartial({
        selector: "[data-game-summary-page]",
        url: `/game/content/${encodeURIComponent(league)}/${encodeURIComponent(gameId)}?t=${Date.now()}`,

        beforeReplace: () => {
            const footballPlayback = window.SportsTrackerFootballPlayback?.captureState();

            const rink = document.querySelector("[data-hockey-shot-map]");

            if (!rink) {
                return {
                    footballPlayback,
                    hockey: null
                };
            }

            return {
                footballPlayback,

                hockey: {
                    team: rink.querySelector("[data-hockey-team]")?.value ?? "all",
                    period: rink.querySelector("[data-hockey-period]")?.value ?? "all",
                    goalsOnly: rink.querySelector("[data-hockey-goals-only]")?.checked ?? false,
                }
            };
        },

        afterReplace: (replacement, state) => {
            if (window.SportsTrackerFootballPlayback) {
                window.SportsTrackerFootballPlayback.initialize(replacement);

                if (state?.footballPlayback) {
                    window.SportsTrackerFootballPlayback.restoreState(state.footballPlayback, replacement);
                }
            }

            const hockeyState = state?.hockey;

            if (!hockeyState) {
                return;
            }

            const rink = replacement.querySelector("[data-hockey-shot-map]");

            if (!rink) {
                return;
            }

            const teamSelect = rink.querySelector("[data-hockey-team]");
            const periodSelect = rink.querySelector("[data-hockey-period]");
            const goalsCheckbox = rink.querySelector("[data-hockey-goals-only]");

            if (teamSelect) {
                teamSelect.value = hockeyState.team;
            }

            if (periodSelect) {
                const periodExists = Array.from(periodSelect.options).some(option => option.value === hockeyState.period);

                periodSelect.value = periodExists ? hockeyState.period : "all";
            }

            if (goalsCheckbox) {
                goalsCheckbox.checked = hockeyState.goalsOnly;
            }

            teamSelect?.dispatchEvent(new Event("change", {
                bubbles: true
            }));
        }
    });
}

/**
 * Game Boxscore Page
 */
async function refreshBoxScore(payload) {
    const page = document.querySelector("[data-game-boxscore-page]");

    if (!page) {
        return;
    }

    const league = page.dataset.league;
    const gameId = page.dataset.gameId;

    if (!isMatchingLeague(league, payload.league)) {
        return;
    }

    await refreshPartial({
        selector: "[data-game-boxscore-page]",
        url: `/game/boxscore/content/${encodeURIComponent(league)}/${encodeURIComponent(gameId)}?t=${Date.now()}`,
        afterReplace: () => {
            initializeBoxScoreSorting();
        }
    })
}

/**
 * Game Play-By-Play Page
 */
async function refreshPlayByPlay(payload) {
    const page = document.querySelector("[data-game-playbyplay-page]");

    if (!page) {
        return;
    }

    const league = page.dataset.league;
    const gameId = page.dataset.gameId;

    if (!isMatchingLeague(league, payload.league)) {
        return;
    }

    await refreshPartial({
        selector: "[data-game-playbyplay-page]",
        url: `/game/playbyplay/content/${encodeURIComponent(league)}/${encodeURIComponent(gameId)}?t=${Date.now()}`,
        beforeReplace: () => ({
            filter: document.querySelector("[data-play-filter].active")?.dataset.playFilter ?? "all",
            followLatest: isNearLatestPlay(),
            playIds: getPlayIds()
        }),
        afterReplace: (replacement, state) => {
            initializePlayByPlayFilters();

            restorePlayFilter(state.filter);

            highlightNewPlays(state.playIds);

            if (state.followLatest) {
                scrollToLatestPlay();
            }
        }
    });
}

/**
 * Helpers
 */
function isMatchingLeague(pageLeague, updatedLeague) {
    if (!pageLeague || !updatedLeague) {
        return false;
    }

    return pageLeague.toLowerCase() === updatedLeague.toLowerCase();
}

/**
 * Reconnection Refresh
 */
async function refreshCurrentPage() {
    const gameSummary = document.querySelector("[data-game-summary-page]");

    if (gameSummary) {
        await refreshGameDetails({
            league: gameSummary.dataset.league,
        });

        return;
    }

    const boxScore = document.querySelector("[data-game-boxscore-page]");

    if (boxScore) {
        await refreshBoxScore({
            league: boxScore.dataset.league,
        });

        return;
    }

    const playByPlay = document.querySelector("[data-game-playbyplay-page]");

    if (playByPlay) {
        await refreshPlayByPlay({
            league: playByPlay.dataset.league,
        });

        return;
    }

    const gamesPage = document.querySelector(".games-page");

    if (gamesPage) {
        if (gamesPage.dataset.isToday !== "true") {
            return;
        }

        const sections = gamesPage.querySelectorAll("[id^='league-']");

        await Promise.all(
            Array.from(sections).map(section => {
                const league = section.id.replace("league-", "");

                return refreshGamesLeague({
                    league: league,
                });
            })
        );

        return;
    }

    const leaguePage = document.querySelector("[id^='league-games-']");

    if (leaguePage) {
        const league = leaguePage.id.replace("league-games-", "");

        await refreshLeaguePage({
            league: league,
        });
    }
}

/**
 * SignalR Connection
 */
async function start() {
    try {
        await connection.start();

        console.log("SignalR Connected");
    } catch (err) {
        console.error(err);

        setTimeout(start, 5000);
    }
}

connection.onreconnecting(() => {
    console.log("Reconnecting...");
});

connection.onreconnected(async () => {
    console.log("Reconnected");

    await refreshCurrentPage();
});

start();