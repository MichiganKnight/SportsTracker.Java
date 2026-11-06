package com.sportstracker.integrations.espn;

import com.sportstracker.config.EspnProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.net.URI;
import java.util.Objects;

public class EspnClient {
    private static final Logger logger = LoggerFactory.getLogger(EspnClient.class);

    private final RestClient restClient;
    private final EspnProperties properties;

    public EspnClient(RestClient restClient, EspnProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public String get(String endpoint) {
        return get(EspnApiHost.SITE, endpoint);
    }

    public String get(EspnApiHost host, String endpoint) {
        Objects.requireNonNull(host, "API Host Cannot Be Null");

        String path = normalizeEndpoint(endpoint);
        URI requestUri = buildUri(host, path);

        logger.debug("Requesting ESPN: {}", requestUri);

        try {
            String response = restClient.get().uri(requestUri).retrieve().body(String.class);

            if (response == null || response.isBlank()) {
                throw new EspnClientException("ESPN Returned an Empty Response", null, path);
            }

            logger.debug("ESPN Response Received: {}", response.length());

            return response;
        } catch (RestClientResponseException exception) {
            int statusCode = exception.getStatusCode().value();

            logger.warn("ESPN Request Failed: Http {} - {}", statusCode, path);

            throw new EspnClientException("ESPN Returned HTTP " + statusCode, statusCode, path, exception);
        } catch (RestClientException exception) {
            logger.error("ESPN Connection Failed: {}", path, exception);

            throw new EspnClientException("Unable to Complete ESPN Request", null, path, exception);
        }
    }

    private URI buildUri(EspnApiHost host, String endpoint) {
        URI baseURL = switch (host) {
            case SITE -> properties.siteBaseUrl();
            case CORE -> properties.coreBaseUri();
        };

        String base = baseURL.toString();

        if (!base.endsWith("/")) {
            base += "/";
        }

        return URI.create(base + endpoint);
    }

    private String normalizeEndpoint(String endpoint) {
        if (endpoint == null || endpoint.isBlank()) {
            throw new IllegalArgumentException("ESPN Endpoint Cannot Be Empty");
        }

        String normalized = endpoint.strip();

        if (normalized.startsWith("/") || normalized.contains("://") || normalized.startsWith("//") || normalized.contains("#") || normalized.contains("\\") || normalized.chars().anyMatch(Character::isISOControl)) {
            throw new IllegalArgumentException("Invalid ESPN Endpoint: " + endpoint);
        }

        URI parsed;

        try {
            parsed = URI.create(normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid ESPN Endpoint: " + endpoint, exception);
        }

        if (parsed.isAbsolute() || parsed.getRawAuthority() != null || parsed.getRawFragment() != null) {
            throw new IllegalArgumentException("ESPN Endpoint Must be Relative");
        }

        return normalized;
    }
}
