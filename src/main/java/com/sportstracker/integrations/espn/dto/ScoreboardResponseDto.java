package com.sportstracker.integrations.espn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ScoreboardResponseDto(List<ScoreboardLeagueDto> leagues, List<ScoreboardEventDto> events) {
    public ScoreboardResponseDto  {
        leagues = leagues == null ? List.of() : List.copyOf(leagues);
        events = events == null ? List.of() : List.copyOf(events);
    }
}
