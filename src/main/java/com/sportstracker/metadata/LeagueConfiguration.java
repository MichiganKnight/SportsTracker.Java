package com.sportstracker.metadata;

import com.sportstracker.enums.League;
import com.sportstracker.enums.Sport;

import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

public final class LeagueConfiguration {
    private static final Map<League, LeagueInfo> LEAGUES;

    static {
        Map<League, LeagueInfo> leagues = new EnumMap<>(League.class);

        leagues.put(League.NFL, new LeagueInfo(League.NFL, Sport.FOOTBALL, "football", "nfl", "NFL", "🏈", null, null, 0));
        leagues.put(League.CFB, new LeagueInfo(League.CFB, Sport.FOOTBALL, "football", "college-football", "College Football", "🎓", null, null, 1));
        leagues.put(League.NBA, new LeagueInfo(League.NBA, Sport.BASKETBALL, "basketball", "nba", "NBA", "🏀", null, null, 2));
        leagues.put(League.CBB, new LeagueInfo(League.CBB, Sport.BASKETBALL, "basketball", "mens-college-basketball", "College Basketball", "🎓", null, null, 3));
        leagues.put(League.MLB, new LeagueInfo(League.MLB, Sport.BASEBALL, "baseball", "mlb", "MLB", "⚾", null, null, 4));
        leagues.put(League.NHL, new LeagueInfo(League.NHL, Sport.HOCKEY, "hockey", "nhl", "NHL", "🏒", null, null, 5));
        leagues.put(League.PGA, new LeagueInfo(League.PGA, Sport.GOLF, "golf", "pga", "PGA Tour", "⛳", null, null, 6));

        LEAGUES = Collections.unmodifiableMap(leagues);
    }

    private LeagueConfiguration() {

    }

    public static Set<League> all() {
        return LEAGUES.keySet();
    }

    public static LeagueInfo get(League league) {
        LeagueInfo info = LEAGUES.get(league);

        if (info == null) {
            throw new IllegalArgumentException("League Not Configured: " + league);
        }

        return info;
    }

    public static Map<League, LeagueInfo> getLeagues() {
        return LEAGUES;
    }
}
