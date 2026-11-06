package com.sportstracker.services;

import com.sportstracker.enums.League;
import com.sportstracker.integrations.espn.EspnClient;
import com.sportstracker.integrations.espn.EspnClientException;
import com.sportstracker.integrations.espn.EspnEndpoints;
import com.sportstracker.integrations.espn.dto.ScoreboardResponseDto;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.mockito.Mockito.*;

public class ScoreboardServiceTest {
    private EspnClient espnClient;
    private ScoreboardService service;

    @BeforeEach
    public void setUp() {
        espnClient = mock(EspnClient.class);
        service = new ScoreboardService(espnClient, JsonMapper.builder().build());
    }

    @Test
    public void shouldDeserializeNflScoreboard() throws IOException {
        String json = loadFixture("nfl-scoreboard.json");

        when(espnClient.get(EspnEndpoints.scoreboard(League.NFL))).thenReturn(json);

        ScoreboardResponseDto scoreboard = service.getScoreboard(League.NFL);

        Assertions.assertNotNull(scoreboard);
        Assertions.assertEquals(1, scoreboard.leagues().size());
        Assertions.assertEquals(1, scoreboard.events().size());

        var league = scoreboard.leagues().getFirst();

        Assertions.assertEquals("NFL", league.abbreviation());
        Assertions.assertEquals(2026, league.season().year());

        var event = scoreboard.events().getFirst();

        Assertions.assertEquals("123456789", event.id());
        Assertions.assertEquals("Green Bay Packers at Chicago Bears", event.name());

        Assertions.assertEquals(1, event.competitions().size());
    }

    @Test
    void shouldDeserializeHomeAndAwayTeams() throws IOException {
        String json = loadFixture("nfl-scoreboard.json");

        when(espnClient.get(EspnEndpoints.scoreboard(League.NFL))).thenReturn(json);

        var scoreboard = service.getScoreboard(League.NFL);

        var competitors = scoreboard.events()
                .getFirst()
                .competitions()
                .getFirst()
                .competitors();

        Assertions.assertEquals(2, competitors.size());

        var home = competitors.stream()
                .filter(c -> "home".equals(c.homeAway()))
                .findFirst()
                .orElseThrow();

        var away = competitors.stream()
                .filter(c -> "away".equals(c.homeAway()))
                .findFirst()
                .orElseThrow();

        Assertions.assertEquals("CHI", home.team().abbreviation());
        Assertions.assertEquals("14", home.score());

        Assertions.assertEquals("GB", away.team().abbreviation());
        Assertions.assertEquals("21", away.score());
    }

    @Test
    void shouldPreserveGameSituation() throws IOException {
        String json = loadFixture("nfl-scoreboard.json");

        when(espnClient.get(EspnEndpoints.scoreboard(League.NFL))).thenReturn(json);

        var competition = service.getScoreboard(League.NFL)
                .events()
                .getFirst()
                .competitions()
                .getFirst();

        Assertions.assertNotNull(competition.situation());
        Assertions.assertEquals(2, competition.situation().get("down").intValue());

        Assertions.assertEquals(7, competition.situation().get("distance").intValue());
    }

    @Test
    void emptyScoreboardShouldReturnEmptyLists() {
        when(espnClient.get(EspnEndpoints.scoreboard(League.NHL))).thenReturn("{}");

        var scoreboard = service.getScoreboard(League.NHL);

        Assertions.assertNotNull(scoreboard);
        Assertions.assertTrue(scoreboard.events().isEmpty());
        Assertions.assertTrue(scoreboard.leagues().isEmpty());
    }

    @Test
    void invalidJsonShouldThrowEspnClientException() {
        when(espnClient.get(EspnEndpoints.scoreboard(League.MLB))).thenReturn("{ invalid json");

        EspnClientException exception = Assertions.assertThrows(EspnClientException.class, () -> service.getScoreboard(League.MLB));

        Assertions.assertTrue(exception.getMessage().contains("Invalid"));
    }

    @Test
    void httpFailureShouldPropagate() {

        when(espnClient.get(EspnEndpoints.scoreboard(League.NBA))).thenThrow(new EspnClientException("ESPN Returned HTTP 403", 403, EspnEndpoints.scoreboard(League.NBA)));

        EspnClientException exception = Assertions.assertThrows(EspnClientException.class, () -> service.getScoreboard(League.NBA));

        Assertions.assertTrue(exception.isForbidden());
    }

    @Test
    void datedScoreboardShouldUseCorrectEndpoint() {
        LocalDate date = LocalDate.of(2026, 11, 6);

        when(espnClient.get(EspnEndpoints.scoreboard(League.NFL, date))).thenReturn("{\"events\":[]}");

        service.getScoreboard(League.NFL, date);

        verify(espnClient).get("apis/site/v2/sports/football/nfl/scoreboard?dates=20261106");
    }

    @Test
    void seasonWeekShouldUseCorrectEndpoint() {
        when(espnClient.get(EspnEndpoints.scoreboard(League.CFB, 2026, 2, 10))).thenReturn("{\"events\":[]}");

        service.getScoreboard(League.CFB, 2026, 2, 10);

        verify(espnClient).get(EspnEndpoints.scoreboard(League.CFB, 2026, 2, 10));
    }

    private String loadFixture(String filename) throws IOException {
        try (var stream = getClass().getResourceAsStream("/fixtures/espn/" + filename)) {
            Assertions.assertNotNull(stream, "Missing Fixture: " + filename);

            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
