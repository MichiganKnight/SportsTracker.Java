package com.sportstracker.integrations.espn;

public class EspnClientException extends RuntimeException {
    private final Integer statusCode;
    private final String endpoint;

    public EspnClientException(String message, Integer statusCode, String endpoint) {
        super(message);

        this.statusCode = statusCode;
        this.endpoint = endpoint;
    }

    public EspnClientException(String message, Integer statusCode, String endpoint, Throwable cause) {
        super(message, cause);

        this.statusCode = statusCode;
        this.endpoint = endpoint;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public boolean isForbidden() {
        return statusCode != null && statusCode == 403;
    }

    public boolean isNotFound() {
        return statusCode != null && statusCode == 404;
    }

    public boolean isRateLimited() {
        return statusCode != null && statusCode == 429;
    }

    public boolean isServerError() {
        return statusCode != null && statusCode >= 500;
    }
}
