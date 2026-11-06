package com.sportstracker.integrations.espn;

import com.sportstracker.config.EspnClientConfig;
import com.sportstracker.config.EspnProperties;
import mockwebserver3.MockResponse;
import mockwebserver3.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;

public class EspnClientTest {
    private MockWebServer server;
    private EspnClient client;

    @BeforeEach
    public void setUp() throws IOException {
        server = new MockWebServer();
        server.start();

        URI baseUrl = server.url("/").uri();

        EspnProperties properties = new EspnProperties(baseUrl, baseUrl, Duration.ofSeconds(2), Duration.ofSeconds(2));

        RestClient restClient = new EspnClientConfig().espnRestClient(properties);

        client = new EspnClient(restClient, properties);
    }

    @AfterEach
    public void tearDown() throws IOException {
        server.close();
    }

    @Test
    public void successfulRequestShouldReturnJson() {
        server.enqueue(new MockResponse.Builder().code(200).body("{\"leagues\":[],\"events\":[]}").build());

        String response = client.get("apis/site/v2/sports/football/nfl/scoreboard");

        Assertions.assertEquals("{\"leagues\":[],\"events\":[]}", response);
    }

    @Test
    public void http403ShouldThrowForbiddenException() {
        server.enqueue(new MockResponse.Builder().code(403).body("Forbidden").build());

        EspnClientException exception = Assertions.assertThrows(EspnClientException.class, () -> client.get("apis/site/v2/test"));

        Assertions.assertEquals(403, exception.getStatusCode());
        Assertions.assertTrue(exception.isForbidden());
    }

    @Test
    public void http404ShouldThrowNotFoundException() {
        server.enqueue(new MockResponse.Builder().code(404).body("Not Found").build());

        EspnClientException exception = Assertions.assertThrows(EspnClientException.class, () -> client.get("apis/site/v2/missing"));

        Assertions.assertEquals(404, exception.getStatusCode());
        Assertions.assertTrue(exception.isNotFound());
    }

    @Test
    public void http429ShouldBeRecognizedAsRateLimited() {
        server.enqueue(new MockResponse.Builder().code(429).body("Too Many Requests").build());

        EspnClientException exception = Assertions.assertThrows(EspnClientException.class, () -> client.get("apis/site/v2/test"));

        Assertions.assertTrue(exception.isRateLimited());
    }

    @Test
    public void http500ShouldBeRecognizedAsServerError() {
        server.enqueue(new MockResponse.Builder().code(500).body("Internal Server Error").build());

        EspnClientException exception = Assertions.assertThrows(EspnClientException.class, () -> client.get("apis/site/v2/test"));

        Assertions.assertTrue(exception.isServerError());
    }

    @Test
    public void emptyResponseShouldThrowException() {
        server.enqueue(new MockResponse.Builder().code(200).body("").build());

        EspnClientException exception = Assertions.assertThrows(EspnClientException.class, () -> client.get("apis/site/v2/test"));

        Assertions.assertTrue(exception.getMessage().contains("Empty"));
    }

    @Test
    public void blankEndpointShouldBeRejected() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> client.get(" "));
    }

    @Test
    public void absoluteUrlShouldBeRejected() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> client.get("https://example.com/test"));
    }

    @Test
    public void encodedSpacesShouldBePreserved() throws InterruptedException {
        server.enqueue(new MockResponse.Builder().code(200).body("{\"results\":[]}").build());

        String endpoint = "apis/search/v2?query=Green%20Bay%20Packers&limit=25";

        Assertions.assertDoesNotThrow(() -> client.get(endpoint));

        var request = server.takeRequest();

        Assertions.assertNotNull(request);
        Assertions.assertEquals("/" + endpoint, request.getUrl().encodedPath() + "?" + request.getUrl().encodedQuery());
    }

    @Test
    public void coreHostShouldBeSupported() {
        server.enqueue(new MockResponse.Builder().code(200).body("{\"items\":[]}").build());

        String response = client.get(EspnApiHost.CORE, "v2/sports/football/leagues/nfl");

        Assertions.assertEquals("{\"items\":[]}", response);
    }
}
