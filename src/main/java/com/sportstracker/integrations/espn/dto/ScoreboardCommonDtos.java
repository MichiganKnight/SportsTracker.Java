package com.sportstracker.integrations.espn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

public final class ScoreboardCommonDtos {
    private ScoreboardCommonDtos() {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EspnLogoDto(String href, Integer width, Integer height, String alt, List<String> rel) {
        public EspnLogoDto {
            rel = rel == null ? List.of() : List.copyOf(rel);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RecordDto(String name, String abbreviation, String type, String summary, String displayValue) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StatusDto(StatusTypeDto type, Integer period, String displayClock) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StatusTypeDto(String id, String name, String state, Boolean completed, String description, String detail, String shortDetail) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamDto(String id, String location, String name, String nickname, String displayName, String abbreviation, String color, String alternateColor, String logo, List<EspnLogoDto> logos) {
        public TeamDto {
            logos = logos == null ? List.of() : List.copyOf(logos);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VenueDto(String id, String fullName, AddressDto Address, Boolean indoor) {

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AddressDto(String city, String state) {

    }
}
