package com.sportstracker.models.game;

import com.sportstracker.enums.GameStatus;
import com.sportstracker.enums.League;
import com.sportstracker.models.Team;
import com.sportstracker.models.Venue;

import java.time.Instant;

public record Game(String id, League league, Instant startTime, GameStatus status, String statusText, String resultLabel, Team homeTeam, Team awayTeam, int homeScore, int awayScore, Venue venue, boolean neutralSite) {
    public boolean isUpcoming() {
        return status.isUpcoming();
    }

    public boolean isLive() {
        return status.isLive();
    }

    public boolean isFinal() {
        return status.isFinal();
    }

    public boolean isDelayed() {
        return status.isDelayed();
    }

    public boolean isCancelled() {
        return status.isCancelled();
    }

    public String statusBadge() {
        return switch (status) {
            case IN_PROGRESS -> "LIVE";
            case HALFTIME -> "HALFTIME";

            case FINAL -> "FINAL";
            case FINAL_OVERTIME -> "OVERTIME";
            case FINAL_SHOOTOUT -> "SHOOTOUT";

            case DELAYED -> "DELAYED";
            case POSTPONED -> "POSTPONED";
            case SUSPENDED -> "SUSPENDED";
            case CANCELLED -> "CANCELLED";

            case PREGAME -> "PREGAME";
            case SCHEDULED -> statusText == null ? "" : statusText;
        };
    }
}
