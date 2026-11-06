package com.sportstracker.integrations.espn;

import com.sportstracker.enums.League;
import com.sportstracker.metadata.LeagueConfiguration;
import com.sportstracker.metadata.LeagueInfo;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class EspnEndpoints {
    private static final DateTimeFormatter ESPN_DATE = DateTimeFormatter.BASIC_ISO_DATE;

    private EspnEndpoints() {

    }

    public static String scoreboard(League league) {
        return site(league, "scoreboard");
    }

    public static String scoreboard(League league, LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Date Cannot Be Null");
        }

        return site(league, "scoreboard?dates=" + date.format(ESPN_DATE));
    }

    public static String scoreboard(League league, int season, int seasonType) {
        return site(league, "scoreboard?dates=" + season + "&seasontype=" + seasonType);
    }

    public static String scoreboard(League league, int season, int seasonType, int week) {
        return site(league, "scoreboard?dates=" + season + "&seasontype=" + seasonType + "&week=" + week);
    }

    public static String standings(League league, int season, int seasonType) {
        LeagueInfo info = LeagueConfiguration.get(league);

        return "apis/v2/sports/" + info.espnSport() + "/" + info.espnLeague() + "/standings?season=" + season + "&seasontype=" + seasonType;
    }

    public static String rankings(League league) {
        return site(league, "rankings");
    }

    public static String leagueNews(League league, int limit) {
        return site(league, "news?limit=" + limit);
    }

    public static String gameDetails(League league, String gameId) {
        return site(league, "scoreboard/" + encode(gameId));
    }

    public static String gameSummary(League league, String gameId) {
        return site(league, "summary?event=" + encode(gameId));
    }

    public static String teams(League league) {
        return site(league, "teams");
    }

    public static String teamDetails(League league, String teamId) {
        return site(league, "teams/" + encode(teamId));
    }

    public static String teamSchedule(League league, String teamId) {
        return site(league, "teams/" + encode(teamId) + "/schedule");
    }

    public static String teamRoster(League league, String teamId) {
        return site(league, "teams/" + encode(teamId) + "/roster");
    }

    public static String athleteDetails(League league, String athleteId) {
        return athlete(league, athleteId, null);
    }

    public static String athleteOverview(League league, String athleteId) {
        return athlete(league, athleteId, "overview");
    }

    public static String athleteStats(League league, String athleteId) {
        return athlete(league, athleteId, "stats");
    }

    public static String athleteGameLog(League league, String athleteId) {
        return athlete(league, athleteId, "gamelog");
    }

    public static String athleteSplits(League league, String athleteId) {
        return athlete(league, athleteId, "splits");
    }

    public static String search(String query, int limit) {
        return "apis/search/v2?query=" + encode(query) + "&limit=" + limit;
    }

    private static String site(League league, String path) {
        LeagueInfo info = LeagueConfiguration.get(league);

        return "apis/site/v2/sports/" + info.espnSport() + "/" + info.espnLeague() + "/" + path;
    }

    private static String athlete(League league, String athleteId, String path) {
        LeagueInfo info = LeagueConfiguration.get(league);

        String endpoint = "apis/common/v3/sports/" + info.espnSport() + "/" + info.espnLeague() + "/athletes/" + encode(athleteId);

        if (path != null && !path.isBlank()) {
            endpoint += "/" + path;
        }

        return endpoint;
    }

    private static String encode(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Endpoint Parameter Cannot Be Empty");
        }

        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
