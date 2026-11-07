package com.sportstracker.integrations.espn.mappers;

import com.sportstracker.enums.League;
import com.sportstracker.integrations.espn.dto.ScoreboardCompetitionDto;
import com.sportstracker.integrations.espn.dto.ScoreboardCompetitorDto;
import com.sportstracker.integrations.espn.dto.ScoreboardEventDto;
import com.sportstracker.integrations.espn.dto.ScoreboardResponseDto;
import com.sportstracker.models.Logo;
import com.sportstracker.models.Team;
import com.sportstracker.models.TeamRecord;
import com.sportstracker.models.Venue;
import com.sportstracker.models.game.Game;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class ScoreboardMapper {
    private ScoreboardMapper() {

    }

    public static List<Game> toGames(ScoreboardResponseDto response, League league) {
        Objects.requireNonNull(response);
        Objects.requireNonNull(league);

        List<Game> games = new ArrayList<>();

        for (ScoreboardEventDto event : response.events()) {
            if (event.competitions().isEmpty()) {
                continue;
            }

            ScoreboardCompetitionDto competition = event.competitions().getFirst();

            if (league == League.PGA) {
                continue;
            }

            ScoreboardCompetitorDto home = findCompetitor(competition.competitors(), "home");
            ScoreboardCompetitorDto away = findCompetitor(competition.competitors(), "away");

            if (home == null || away == null || home.team() == null || away.team() == null) {
                continue;
            }

            games.add(mapTeamEvent(event, competition, home, away, league));
        }

        return List.copyOf(games);
    }

    private static Game mapTeamEvent(ScoreboardEventDto event, ScoreboardCompetitionDto competition, ScoreboardCompetitorDto home, ScoreboardCompetitorDto away, League league) {
        int homeScore = parseScore(home.score());
        int awayScore = parseScore(away.score());

        var status = competition.status();
        var statusType = status == null ? null : status.type();

        String statusName = statusType == null ? "STATUS_SCHEDULED" : statusType.name();

        boolean completed = statusType != null && (Boolean.TRUE.equals(statusType.completed()) || (statusName != null && statusName.startsWith("STATUS_FINAL")));

        String resultLabel = GameResultFormatter.getLabel(league, completed, status == null || status.period() == null ? 0 : status.period(), statusName, statusType == null ? null : statusType.shortDetail(), statusType == null ? null : statusType.description(), statusType == null ? null : statusType.detail(), homeScore, awayScore);

        Venue venue = null;

        if (competition.venue() != null) {
            var source = competition.venue();

            venue = new Venue(source.id(), source.fullName(), source.indoor());
        }

        return new Game(event.id(), league, parseDate(event.date()), GameResultFormatter.getStatus(statusName, resultLabel), statusType == null ? "" : statusType.shortDetail(), resultLabel, mapTeam(home, league), mapTeam(away, league), homeScore, awayScore, venue, Boolean.TRUE.equals(event.neutralSite()));
    }

    private static Team mapTeam(ScoreboardCompetitorDto competitor, League league) {
        var source = competitor.team();

        Logo logo = null;

        if (source.logo() != null && !source.logo().isBlank()) {
            logo = new Logo(source.logo(), 500, 500, source.displayName() + " Logo");
        } else if (!source.logos().isEmpty()) {
            var first = source.logos().getFirst();

            logo = new Logo(first.href(), first.width() == null ? 0 : first.width(), first.height() == null ? 0 : first.height(), first.alt());
        }

        TeamRecord record = null;

        if (!competitor.records().isEmpty()) {
            var first = competitor.records().getFirst();

            record = new TeamRecord(first.summary(), first.displayValue());
        }

        return new Team(source.id(), league, source.name(), source.location(), source.nickname(), source.abbreviation(), source.displayName(), source.color(), source.alternateColor(), logo, record);
    }

    private static Instant parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Instant.parse(value);
        } catch (DateTimeParseException exception) {
            try {
                return OffsetDateTime.parse(value, DateTimeFormatter.ISO_OFFSET_DATE_TIME).toInstant();
            } catch (DateTimeParseException ignored) {
                throw new IllegalArgumentException("Invalid ESPN Event Date: " + value, exception);
            }
        }
    }

    private static ScoreboardCompetitorDto findCompetitor(List<ScoreboardCompetitorDto> competitors, String homeAway) {
        return competitors.stream()
                .filter(c -> homeAway.equalsIgnoreCase(c.homeAway()))
                .findFirst()
                .orElse(null);
    }

    private static int parseScore(String score) {
        if (score == null || score.isBlank()) {
            return 0;
        }

        try {
            return Integer.parseInt(score.trim());
        } catch (NumberFormatException exception) {
            return 0;
        }
    }
}
