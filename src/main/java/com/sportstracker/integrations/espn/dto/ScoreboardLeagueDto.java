package com.sportstracker.integrations.espn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import tools.jackson.databind.JsonNode;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ScoreboardLeagueDto(String id, String name, String abbreviation, Season season, String calendarType, Boolean calendarIsWhitelist, String calendarStartDate, String calendarEndDate, JsonNode calendar, List<ScoreboardCommonDtos.EspnLogoDto> logos) {
    public ScoreboardLeagueDto {
        logos = logos == null ? List.of() : List.copyOf(logos);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Season(Integer year, String displayName, SeasonType type) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SeasonType(String id, Integer type, String name, String abbreviation) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CalendarPeriod(String label, String value, String startDate, String endDate, List<CalendarEntry> entries) {
        public CalendarPeriod {
            entries = entries == null ? List.of() : List.copyOf(entries);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CalendarEntry(String Label, String alternateLabel, String detail, String value, String startDate, String endDate) {

    }
}
