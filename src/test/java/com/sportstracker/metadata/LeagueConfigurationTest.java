package com.sportstracker.metadata;

import com.sportstracker.enums.League;
import com.sportstracker.enums.Sport;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class LeagueConfigurationTest {
    @Test
    public void shouldContainAllSevenLeagues() {
        Assertions.assertEquals(7, LeagueConfiguration.all().size());
    }

    @Test
    public void everyLeagueShouldHaveConfiguration() {
        for (League league : League.values()) {
            LeagueInfo info = LeagueConfiguration.get(league);

            Assertions.assertNotNull(info);
            Assertions.assertEquals(league, info.league());
            Assertions.assertNotNull(info.espnSport());
            Assertions.assertFalse(info.espnSport().isBlank());
            Assertions.assertFalse(info.espnLeague().isBlank());
        }
    }

    @Test
    public void nflShouldBeFootball() {
        LeagueInfo info = LeagueConfiguration.get(League.NFL);

        Assertions.assertEquals(Sport.FOOTBALL, info.sport());
        Assertions.assertEquals("football", info.espnSport());
        Assertions.assertEquals("nfl", info.espnLeague());
    }

    @Test
    public void collegeBasketballShouldUseCorrectEspnLeague() {
        LeagueInfo info = LeagueConfiguration.get(League.CBB);

        Assertions.assertEquals("mens-college-basketball", info.espnLeague());
    }

    @Test
    public void configurationShouldBeImmutable() {
        Assertions.assertThrows(UnsupportedOperationException.class, () -> LeagueConfiguration.getLeagues().clear());
    }
}
