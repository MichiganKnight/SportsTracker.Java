(() => {
    "use strict";

    const playbackCache = new WeakMap();

    function getPlaybackData(container) {
        if (playbackCache.has(container)) {
            return playbackCache.get(container);
        }

        const dataElement = container.querySelector("[data-playback-data]");

        if (!dataElement) {
            return null;
        }

        try {
            const plays = JSON.parse(dataElement.textContent);

            const data = {
                plays,
                index: Number(container.dataset.initialIndex || 0),
                lastSituation: null,
                playing: false,
                speed: 1,
                timer: null
            };

            playbackCache.set(container, data);

            return data;
        } catch (error) {
            console.error("Football Playback Data is Invalid:", error);

            return null;
        }
    }

    function setText(root, selector, value) {
        const element = root.querySelector(selector);

        if (element) {
            element.textContent = value ?? "-";
        }
    }

    function setVisible(element, visible) {
        if (element) {
            element.style.display = visible ? "" : "none";
        }
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function getPossessionName(field, possessionId) {
        if (!possessionId) {
            return "Unknown";
        }

        if (String(possessionId) === field.dataset.awayTeam) {
            return field.dataset.awayAbbreviation;
        }

        if (String(possessionId) === field.dataset.homeTeam) {
            return field.dataset.homeAbbreviation;
        }

        return "Unknown";
    }

    function updateField(field, situation) {
        const ball = field.querySelector("[data-football-ball]");
        const gain = field.querySelector("[data-football-gain]");
        const redZone = field.querySelector("[data-football-redzone]");

        const possession = situation?.possession ?? situation?.possessionTeamId;

        const normalizeId = value => String(value ?? "").trim().toLowerCase();

        const possessionId = normalizeId(possession);
        const awayId = normalizeId(field.dataset.awayTeam);
        const homeId = normalizeId(field.dataset.homeTeam);

        const isAway = possessionId !== "" && possessionId === awayId;
        const isHome = possessionId !== "" && possessionId === homeId;

        const yardsToGoal = Number(situation?.yardsToEndzone);

        if (!situation || situation.yardsToEndzone == null || !Number.isFinite(yardsToGoal)) {
            setVisible(ball, false);
            setVisible(gain, false);
            setVisible(redZone, false);

            setText(field, "[data-football-possession]", "-");
            setText(field, "[data-football-down]", "-");
            setText(field, "[data-football-yards]", "-");

            return;
        }

        if (!isAway && !isHome) {
            console.warn("Unable to Determine Possession Team:", {
                possessionId,
                awayId,
                homeId
            });

            setVisible(ball, false);
            setVisible(gain, false);

            return;
        }

        const attacksRight = isAway;

        const position = clamp(attacksRight ? 100 - yardsToGoal : yardsToGoal, 0, 100);

        let gainPosition = null;

        if (situation.distance != null) {
            const distance = Number(situation.distance);

            if (Number.isFinite(distance)) {
                const yardsToGain = distance === 0 ? yardsToGoal : distance;

                gainPosition = clamp(position + (attacksRight ? yardsToGain : -yardsToGain), 0, 100);
            }
        }

        if (ball) {
            ball.style.left = `${position}%`;
            ball.title = situation.downDistanceText || situation.shortDownDistanceText || "Ball Position";

            setVisible(ball, true);
        }

        if (gain) {
            if (gainPosition !== null) {
                gain.style.left = `${gainPosition}%`;

                setVisible(gain, true);
            } else {
                setVisible(gain, false);
            }
        }

        setText(field, "[data-football-possession]", getPossessionName(field, possession));
        setText(field, "[data-football-down]", situation.downDistanceText || situation.shortDownDistanceText || "-");
        setText(field, "[data-football-yards]", yardsToGoal);

        setVisible(redZone, situation.isRedZone === true);
    }

    function getPlayPossession(play) {
        return String(play?.situation?.possession ?? play?.situation?.possessionTeamId ?? "").trim().toLowerCase();
    }

    function getScoringLabel(play) {
        if (!play?.isScoringPlay) return null;

        const description = String(play.description ?? "").toLowerCase();

        if (description.includes("touchdown")) {
            return "Touchdown"
        }

        if (description.includes("field goal")) {
            return "Field Goal";
        }

        if (description.includes("safety")) {
            return "Safety";
        }

        if (description.includes("extra point")) {

        }

        if (description.includes("two-point") || description.includes("2-point")) {
            return "Two-Point Conversion";
        }

        return "Scoring Play";
    }

    function updatePlayEvents(container, play, previousPlay) {
        const scoringBadge = container.querySelector("[data-playback-scoring]");
        const possessionBadge = container.querySelector("[data-playback-possession-change]");

        const scoringLabel = getScoringLabel(play);

        if (scoringBadge) {
            scoringBadge.hidden = scoringLabel === null;
            scoringBadge.textContent = scoringLabel ?? "";
        }

        const previousPossession = getPlayPossession(previousPlay);
        const currentPossession = getPlayPossession(play);

        const possessionChanged = previousPossession !== "" && currentPossession !== "" && previousPossession !== currentPossession;

        if (possessionBadge) {
            possessionBadge.hidden = !possessionChanged;
        }

        container.classList.toggle("football-playback-is-scoring", scoringLabel !== null);
        container.classList.toggle("football-playback-possession-changed", possessionChanged);
    }

    function setFieldAnimation(field, enabled, speed) {
        const duration = enabled ? Math.min(700, 900 / speed) : 0;

        field.style.setProperty(
            "--football-playback-animation-duration",
            `${duration}ms`
        );
    }

    function renderPlay(container, index, animate = false) {
        const data = getPlaybackData(container);

        if (!data || data.plays.length === 0) {
            return;
        }

        const previousIndex = data.index;
        const previousPlay = data.plays[previousIndex];

        data.index = clamp(index, 0, data.plays.length - 1);

        const seek = container.querySelector("[data-playback-seek]");

        if (seek) {
            seek.value = String(data.index);
        }

        const play = data.plays[data.index];

        const adjacentPlay = data.index > 0 ? data.plays[data.index - 1] : null;

        updatePlayEvents(container, play, adjacentPlay);

        const field = container.closest("[data-football-field]");

        if (!field) {
            return;
        }

        const previousPossession = getPlayPossession(previousPlay);
        const currentPossession = getPlayPossession(play);

        const samePossession = previousPossession !== "" && previousPossession === currentPossession;

        const shouldAnimate = animate && Math.abs(data.index - previousIndex) === 1 && samePossession && Boolean(previousPlay?.situation) && Boolean(play.situation);

        setFieldAnimation(field, shouldAnimate, data.speed);

        const quarter = play.quarter ? `Q${play.quarter}` : "Quarter Unknown";

        setText(container, "[data-playback-clock]", `${quarter} - ${play.clock || "-"}`);
        setText(container, "[data-playback-count]", `Play ${data.index + 1} of ${data.plays.length}`);
        setText(container, "[data-playback-drive]", `Drive ${play.driveNumber}`);
        setText(container, "[data-playback-description]", play.description);

        const away = field.dataset.awayAbbreviation;
        const home = field.dataset.homeAbbreviation;

        setText(container, "[data-playback-score]", `${away}: ${play.awayScore ?? "-"} | ${home}: ${play.homeScore ?? "-"}`);

        if (play.situation) {
            data.lastSituation = play.situation;

            updateField(field, play.situation);

            const scoringLabel = getScoringLabel(play);

            setText(container, "[data-playback-status]", scoringLabel ? `${scoringLabel} — Field Position at the Start of This Play` : "Showing Field Position at the Start of This Play");
        } else {
            updateField(field, null);

            setText(container, "[data-playback-status]", "Field Position Unavailable for This Play");
        }

        for (const button of container.querySelectorAll("[data-playback-action]")) {
            const action = button.dataset.playbackAction;

            button.disabled = (data.index === 0 && (action === "first" || action === "previous")) || (data.index === data.plays.length - 1 && (action === "next" || action === "last"));
        }

        const previousDrive = findPreviousDriveIndex(data.plays, data.index);
        const nextDrive = findNextDriveIndex(data.plays, data.index);

        const previousDriveButton = container.querySelector(
            '[data-playback-action="previous-drive"]'
        );

        const nextDriveButton = container.querySelector(
            '[data-playback-action="next-drive"]'
        );

        if (previousDriveButton) {
            previousDriveButton.disabled = previousDrive === null;
        }

        if (nextDriveButton) {
            nextDriveButton.disabled = nextDrive === null;
        }

        updatePlaybackControls(container);
    }

    const BASE_PLAY_INTERVAL = 2000;

    function updatePlaybackControls(container) {
        const data = getPlaybackData(container);

        if (!data) {
            return;
        }

        const currentPlay = container.querySelector("[data-playback-current-play]");

        if (currentPlay) {
            currentPlay.textContent = `Play ${data.index + 1}`;
        }

        const label = container.querySelector("[data-playback-toggle-label]");
        const icon = container.querySelector("[data-playback-toggle-icon]");
        const toggle = container.querySelector('[data-playback-action="toggle"]');

        if (label) {
            label.textContent = data.playing ? "Pause" : "Play";
        }

        if (icon) {
            icon.classList.toggle("bi-play-fill", !data.playing);
            icon.classList.toggle("bi-pause-fill", data.playing);
        }

        if (toggle) {
            toggle.setAttribute("aria-pressed", String(data.playing));
            toggle.setAttribute("aria-label", data.playing ? "Pause" : "Play");
            toggle.disabled = data.plays.length <= 1;
        }

        const seek = container.querySelector("[data-playback-seek]");

        if (seek) {
            seek.max = String(Math.max(0, data.plays.length - 1));
            seek.value = String(data.index);

            const percent = data.plays.length <= 1 ? 100 : data.index / (data.plays.length - 1) * 100;

            seek.style.setProperty("--playback-progress", `${percent}%`);
            seek.setAttribute("aria-valuetext", `Play ${data.index + 1} of ${data.plays.length}`);
        }
    }

    function pausePlayback(container) {
        const data = getPlaybackData(container);

        if (!data) return;

        if (data.timer !== null) {
            clearTimeout(data.timer);

            data.timer = null;
        }

        data.playing = false;

        updatePlaybackControls(container);
    }

    function scheduleNextPlay(container) {
        const data = getPlaybackData(container);

        if (!data || !data.playing) return;

        if (data.timer !== null) {
            clearTimeout(data.timer);

            data.timer = null;
        }

        if (data.index >= data.plays.length - 1) {
            pausePlayback(container);

            return;
        }

        data.timer = setTimeout(() => {
            data.timer = null;

            if (!data.playing || !container.isConnected) {
                pausePlayback(container);

                return;
            }

            renderPlay(container, data.index + 1, true);
            scheduleNextPlay(container);
        }, BASE_PLAY_INTERVAL / data.speed);
    }

    function startPlayback(container) {
        const data = getPlaybackData(container);

        if (!data || data.plays.length <= 1) {
            return;
        }

        if (data.playing) {
            return;
        }

        if (data.index >= data.plays.length - 1) {
            renderPlay(container, 0);
        }

        data.playing = true;

        updatePlaybackControls(container);
        scheduleNextPlay(container);
    }

    function togglePlayback(container) {
        const data = getPlaybackData(container);

        if (!data) return;

        if (data.playing) {
            pausePlayback(container);
        } else {
            startPlayback(container);
        }
    }

    function getDriveNumber(play) {
        const number = Number(play?.driveNumber);

        return Number.isFinite(number) && number > 0 ? number : null;
    }

    function getDriveStartIndices(plays) {
        const starts = [];
        let previousDrive = null;

        for (let i = 0; i < plays.length; i++) {
            const drive = getDriveNumber(plays[i]);

            if (drive === null) {
                continue;
            }

            if (drive !== previousDrive) {
                starts.push(i);
                previousDrive = drive;
            }
        }

        return starts;
    }

    function findPreviousDriveIndex(plays, currentIndex) {
        const starts = getDriveStartIndices(plays);

        return starts.filter(index => index < currentIndex).at(-1) ?? null;
    }

    function findNextDriveIndex(plays, currentIndex) {
        const starts = getDriveStartIndices(plays);

        return starts.find(index => index > currentIndex) ?? null;
    }

    function handlePlaybackClick(event) {
        const button = event.target.closest("[data-playback-action]");

        if (!button) {
            return;
        }

        const container = button.closest("[data-football-playback]");

        if (!container) {
            return;
        }

        const data = getPlaybackData(container);

        if (!data || data.plays.length === 0) {
            return;
        }

        const action = button.dataset.playbackAction;

        if (action === "toggle") {
            togglePlayback(container);

            return;
        }

        pausePlayback(container);

        let nextIndex = data.index;

        switch (action) {
            case "first":
                nextIndex = 0;
                break;

            case "previous":
                nextIndex--;
                break;

            case "next":
                nextIndex++;
                break;

            case "last":
                nextIndex = data.plays.length - 1;
                break;

            case "previous-drive":
                nextIndex = findPreviousDriveIndex(data.plays, data.index);
                break;

            case "next-drive":
                nextIndex = findNextDriveIndex(data.plays, data.index);
                break;

            default:
                return;
        }

        if (nextIndex !== null) {
            renderPlay(container, nextIndex);
        }
    }

    document.addEventListener("click", handlePlaybackClick);

    document.addEventListener("input", event => {
        const target = event.target;

        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        if (!target.matches("[data-playback-seek]")) {
            return;
        }

        const container = target.closest("[data-football-playback]");

        if (!container) {
            return;
        }

        const index = Number.parseInt(target.value, 10);

        if (!Number.isInteger(index)) {
            return;
        }

        pausePlayback(container);
        renderPlay(container, index);
    });

    document.addEventListener("change", event => {
        const speedSelect = event.target.closest("[data-playback-speed]");

        if (!speedSelect) {
            return;
        }

        const container = speedSelect.closest("[data-football-playback]");

        if (!container) {
            return;
        }

        const data = getPlaybackData(container);

        if (!data) {
            return;
        }

        const speed = Number(speedSelect.value);

        if (![0.5, 1, 2, 4].includes(speed)) {
            return;
        }

        data.speed = speed;

        if (data.playing) {
            scheduleNextPlay(container);
        }
    });

    function initializePlaybacks(root = document) {
        const containers = root.querySelectorAll("[data-football-playback]");

        for (const container of containers) {
            if (container.dataset.playbackInitialized === "true") {
                continue;
            }

            container.dataset.playbackInitialized = "true";

            const data = getPlaybackData(container);

            if (data) {
                renderPlay(container, data.index);
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => initializePlaybacks());
    } else {
        initializePlaybacks();
    }

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) return;

        document.querySelectorAll("[data-football-playback]").forEach(container => {
            pausePlayback(container);
        });
    });

    window.SportsTrackerFootballPlayback = {
        initialize: initializePlaybacks,

        captureState(root = document) {
            const container = root.querySelector("[data-football-playback]");

            if (!container) {
                return null;
            }

            const data = getPlaybackData(container);

            if (!data || data.plays.length === 0) {
                return null;
            }

            return {
                playId: data.plays[data.index]?.id ?? null,
                index: data.index
            };
        },

        restoreState(state, root = document) {
            if (!state) {
                return;
            }

            const container = root.querySelector("[data-football-playback]");

            if (!container) {
                return;
            }

            const data = getPlaybackData(container);

            if (!data || data.plays.length === 0) {
                return;
            }

            let index = -1;

            if (state.playId != null) {
                index = data.plays.findIndex(play => play.id === state.playId);
            }

            if (index < 0) {
                index = clamp(state.index, 0, data.plays.length - 1);
            }

            pausePlayback(container);
            renderPlay(container, index);
        }
    };
})();