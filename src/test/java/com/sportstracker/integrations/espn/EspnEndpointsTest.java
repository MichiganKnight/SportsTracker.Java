package com.sportstracker.integrations.espn;

import com.sportstracker.enums.League;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

public class EspnEndpointsTest {
    @Test
    public void nflScoreboardShouldGenerateCorrectEndpoint() {
        String endpoint = EspnEndpoints.scoreboard(League.NFL);

        Assertions.assertEquals("apis/site/v2/sports/football/nfl/scoreboard", endpoint);
    }

    @Test
    void nbaScoreboardShouldGenerateCorrectEndpoint() {
        String endpoint = EspnEndpoints.scoreboard(League.NBA);

        Assertions.assertEquals("apis/site/v2/sports/basketball/nba/scoreboard", endpoint);
    }

    @Test
    void scoreboardDateShouldUseEspnFormat() {
        LocalDate date = LocalDate.of(2026, 11, 6);

        String endpoint = EspnEndpoints.scoreboard(League.NFL, date);

        Assertions.assertEquals("apis/site/v2/sports/football/nfl/scoreboard?dates=20261106", endpoint);
    }

    @Test
    void scoreboardShouldSupportSeasonAndWeek() {
        String endpoint = EspnEndpoints.scoreboard(League.CFB, 2026, 2, 10);

        Assertions.assertEquals("apis/site/v2/sports/football/college-football/scoreboard?dates=2026&seasontype=2&week=10", endpoint);
    }

    @Test
    void gameSummaryShouldGenerateCorrectEndpoint() {
        String endpoint = EspnEndpoints.gameSummary(League.NFL, "401772510");

        Assertions.assertEquals("apis/site/v2/sports/football/nfl/summary?event=401772510", endpoint);
    }

    @Test
    void athleteDetailsShouldGenerateCorrectEndpoint() {
        String endpoint = EspnEndpoints.athleteDetails(League.NBA, "12345");

        Assertions.assertEquals("apis/common/v3/sports/basketball/nba/athletes/12345", endpoint);
    }

    @Test
    void searchShouldEncodeSpaces() {
        String endpoint = EspnEndpoints.search("Green Bay Packers", 25);

        Assertions.assertEquals("apis/search/v2?query=Green%20Bay%20Packers&limit=25", endpoint);
    }

    @Test
    void nullDateShouldThrowException() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> EspnEndpoints.scoreboard(League.NFL, (LocalDate) null));
    }

    @Test
    void blankGameIdShouldThrowException() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> EspnEndpoints.gameSummary(League.NFL, " "));
    }
}
