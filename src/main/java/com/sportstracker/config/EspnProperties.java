package com.sportstracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;
import java.time.Duration;

@ConfigurationProperties(prefix = "sportstracker.espn")
public record EspnProperties(URI siteBaseUrl, URI coreBaseUri, Duration connectTimeout, Duration readTimeout) {
}
