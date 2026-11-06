package com.sportstracker.integrations.espn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import tools.jackson.databind.JsonNode;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ScoreboardCompetitionDto(String id, List<ScoreboardCompetitorDto> competitors, ScoreboardCommonDtos.StatusDto status, JsonNode situation, ScoreboardCommonDtos.VenueDto venue) {
    public ScoreboardCompetitionDto {
        competitors = competitors == null ? List.of() : List.copyOf(competitors);
    }
}
