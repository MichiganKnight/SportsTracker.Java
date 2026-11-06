package com.sportstracker.metadata;

import com.sportstracker.enums.League;
import com.sportstracker.enums.Sport;

public record LeagueInfo(League league, Sport sport, String espnSport, String espnLeague, String displayName, String icon, String logo, String darkLogo, int displayOrder) {
}
