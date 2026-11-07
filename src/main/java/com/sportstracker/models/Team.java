package com.sportstracker.models;

import com.sportstracker.enums.League;

public record Team(String id, League league, String name, String location, String nickname, String abbreviation, String displayName, String color, String alternateColor, Logo logo, TeamRecord record) {

}
