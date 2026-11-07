package com.sportstracker.integrations.espn.mappers;

import com.sportstracker.enums.GameStatus;
import com.sportstracker.enums.League;
import com.sportstracker.integrations.espn.dto.ScoreboardResponseDto;
import com.sportstracker.models.game.Game;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class ScoreboardMapperTest {
    private final JsonMapper mapper = JsonMapper.builder().build();

    @Test
    public void shouldMapNflGame() throws IOException {
        ScoreboardResponseDto response = loadNflFixture();

        List<Game> games = ScoreboardMapper.toGames(response, League.NFL);

        Assertions.assertEquals(1, games.size());

        Game game = games.getFirst();

        Assertions.assertEquals("123456789", game.id());
        Assertions.assertEquals(League.NFL, game.league());
        Assertions.assertEquals(GameStatus.IN_PROGRESS, game.status());

        Assertions.assertEquals(14, game.homeScore());
        Assertions.assertEquals(21, game.awayScore());

        Assertions.assertEquals("CHI", game.homeTeam().abbreviation());
        Assertions.assertEquals("GB", game.awayTeam().abbreviation());

        Assertions.assertTrue(game.isLive());
        Assertions.assertFalse(game.isFinal());
    }

    @Test
    public void shouldMapVenueAndTeamRecord() throws IOException {
        Game game = ScoreboardMapper.toGames(loadNflFixture(), League.NFL).getFirst();

        Assertions.assertNotNull(game.venue());
        Assertions.assertEquals("Soldier Field", game.venue().name());
        Assertions.assertEquals("Chicago", game.homeTeam().location());
        Assertions.assertEquals("5-3", game.homeTeam().record().summary());
    }

    @Test
    public void shouldReturnNoGamesForEmptyScoreboard() {
        ScoreboardResponseDto response = new ScoreboardResponseDto(List.of(), List.of());

        Assertions.assertTrue(ScoreboardMapper.toGames(response, League.NHL).isEmpty());
    }

    @Test
    public void shouldFormatNflOvertime() {
        String label = GameResultFormatter.getLabel(League.NFL, true, 5, "STATUS_FINAL_OVERTIME", "Final/OT", "Final", null, 24, 27);

        Assertions.assertEquals("FINAL / OT", label);

        Assertions.assertEquals(GameStatus.FINAL_OVERTIME, GameResultFormatter.getStatus("STATUS_FINAL_OVERTIME", label));
    }

    @Test
    public void shouldFormatNhlShootout() {
        String label = GameResultFormatter.getLabel(League.NHL, true, 5, "STATUS_FINAL_SHOOTOUT", "Final/SO", "Final", null, 3, 2);

        Assertions.assertEquals("FINAL / SO", label);
    }

    @Test
    public void shouldFormatMlbExtraInnings() {
        String label = GameResultFormatter.getLabel(League.MLB, true, 11, "STATUS_FINAL", "Final", "Final", null, 5, 4);

        Assertions.assertEquals("FINAL / 11", label);
    }

    @Test
    public void shouldMapDelayedStatus() {
        Assertions.assertEquals(GameStatus.DELAYED, GameResultFormatter.getStatus("STATUS_DELAYED", null));
    }

    private ScoreboardResponseDto loadNflFixture() throws IOException {
        try (var stream = getClass().getResourceAsStream("/fixtures/espn/nfl-scoreboard.json")) {
            Assertions.assertNotNull(stream, "NFL Fixture Not Found");

            String json = new String(stream.readAllBytes(), StandardCharsets.UTF_8);

            return mapper.readValue(json, ScoreboardResponseDto.class);
        }
    }
}
