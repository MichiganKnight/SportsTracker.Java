function captureScores(leagueSection) {
    const scores = new Map();

    const games = leagueSection.querySelectorAll("[data-game-id]");

    games.forEach(game => {
        const gameId = game.dataset.gameId;
        const scoreElements = game.querySelectorAll("[data-team-score]");

        const gameScores = Array.from(scoreElements).map(element => Number.parseInt(element.textContent.trim(), 10) || 0);

        scores.set(gameId, gameScores);
    });

    return scores;
}

function findScoreChanges(oldScores, replacementSection) {
    const changedGames = [];
    const games = replacementSection.querySelectorAll("[data-game-id]");

    games.forEach(game => {
        const gameId = game.dataset.gameId;
        const oldScore = oldScores.get(gameId);

        if (!oldScore) {
            return;
        }

        const newScore = Array.from(game.querySelectorAll("[data-team-score]")).map(element => Number.parseInt(element.textContent.trim(), 10) || 0);

        if (oldScore.length !== newScore.length) {
            return;
        }

        const changedTeams = [];

        newScore.forEach((score, index) => {
            const previousScore = oldScore[index];

            if (score > previousScore) {
                changedTeams.push({
                    index: index,
                    difference: score - previousScore
                });
            }
        });

        if (changedTeams.length > 0) {
            changedGames.push({
                gameId: gameId,
                teams: changedTeams
            });
        }
    });

    return changedGames;
}

function animateScoreChanges(changedGames) {
    changedGames.forEach(change => {
        const card = document.querySelector(
            `[data-game-id="${change.gameId}"]`
        );

        if (!card) {
            return;
        }
        
        const scores = card.querySelectorAll("[data-team-score]");
        
        change.teams.forEach(team => {
            const score = scores[team.index];
            
            if (!score) {
                return;
            }
            
            score.classList.remove("score-changed");
            
            void score.offsetWidth;
            
            score.classList.add("score-changed");
            
            setTimeout(() => {
                score.classList.remove("score-changed");
            }, 1200);
        });
    });
}