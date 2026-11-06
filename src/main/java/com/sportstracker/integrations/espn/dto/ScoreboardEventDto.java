package com.sportstracker.integrations.espn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ScoreboardEventDto(String id, String name, String date, String endDate, Boolean neutralSite, List<ScoreboardCompetitionDto> competitions) {
    public ScoreboardEventDto {
        competitions = competitions == null ? List.of() : List.copyOf(competitions);
    }
}
