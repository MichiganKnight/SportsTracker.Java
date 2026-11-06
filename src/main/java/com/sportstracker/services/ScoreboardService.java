package com.sportstracker.services;

import com.sportstracker.enums.League;
import com.sportstracker.integrations.espn.EspnClient;
import com.sportstracker.integrations.espn.EspnClientException;
import com.sportstracker.integrations.espn.EspnEndpoints;
import com.sportstracker.integrations.espn.dto.ScoreboardResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.util.Objects;

@Service
public class ScoreboardService {
    private static final Logger logger = LoggerFactory.getLogger(ScoreboardService.class);

    private final EspnClient espnClient;
    private final JsonMapper jsonMapper;

    public ScoreboardService(EspnClient espnClient, JsonMapper jsonMapper) {
        this.espnClient = espnClient;
        this.jsonMapper = jsonMapper;
    }

    public ScoreboardResponseDto getScoreboard(League league) {
        return fetch(EspnEndpoints.scoreboard(league));
    }

    public ScoreboardResponseDto getScoreboard(League league, LocalDate date) {
        return fetch(EspnEndpoints.scoreboard(Objects.requireNonNull(league), date));
    }

    public ScoreboardResponseDto getScoreboard(League league, int season, int seasonType) {
        return fetch(EspnEndpoints.scoreboard(Objects.requireNonNull(league), season, seasonType));
    }

    public ScoreboardResponseDto getScoreboard(League league, int season, int seasonType, int week) {
        return fetch(EspnEndpoints.scoreboard(Objects.requireNonNull(league), season, seasonType, week));
    }

    private ScoreboardResponseDto fetch(String endpoint) {
        String json = espnClient.get(endpoint);

        try {
            ScoreboardResponseDto response = jsonMapper.readValue(json, ScoreboardResponseDto.class);

            if (response == null) {
                throw new EspnClientException("ESPN Scoreboard Response Was Null", null, endpoint);
            }

            logger.debug("ESPN Scoreboard Loaded: {} Events", response.events().size());

            return response;
        } catch (JacksonException exception) {
            logger.warn("Unable to Deserialize ESPN Scoreboard: {}", endpoint, exception);

            throw new EspnClientException("Invalid ESPN Scoreboard JSON", null, endpoint, exception);
        }
    }
}
