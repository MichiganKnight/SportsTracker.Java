package com.sportstracker.integrations.espn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ScoreboardCompetitorDto(String id, String homeAway, ScoreboardCommonDtos.TeamDto team, Integer order, GolfAthleteDto athlete, String score, List<ScoreboardCommonDtos.RecordDto> records, List<GolfLineScoreDto> linescores) {
    public ScoreboardCompetitorDto {
        records = records == null ? List.of() : List.copyOf(records);
        linescores = linescores == null ? List.of() : List.copyOf(linescores);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GolfAthleteDto(String fullName, String displayName, String shortName, GolfFlagDto flag) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GolfFlagDto(String href, String alt) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GolfLineScoreDto(Double value, String displayValue, Integer period, GolfScoreTypeDto scoreType, List<GolfLineScoreDto> linescores) {
        public GolfLineScoreDto {
            linescores = linescores == null ? List.of() : List.copyOf(linescores);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GolfScoreTypeDto(String displayValue) {

    }
}
