package ci.volta.backend.service;

import ci.volta.backend.model.WebhookEndpoint;
import ci.volta.backend.repository.WebhookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);

    private final WebhookRepository webhookRepository;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ExecutorService executor = Executors.newFixedThreadPool(2);

    public WebhookService(WebhookRepository webhookRepository) {
        this.webhookRepository = webhookRepository;
    }

    public WebhookEndpoint register(String url, String event) {
        WebhookEndpoint endpoint = new WebhookEndpoint();
        endpoint.id = "wh-" + UUID.randomUUID().toString().substring(0, 8);
        endpoint.url = url;
        endpoint.event = (event == null || event.isBlank()) ? "*" : event;
        endpoint.active = true;
        endpoint.createdAt = Instant.now().toString();
        return webhookRepository.save(endpoint);
    }

    /** Sends the event payload to every active endpoint subscribed to it. */
    public void dispatch(String event, Map<String, Object> data) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("event", event);
        payload.put("timestamp", Instant.now().toString());
        payload.put("data", data);
        String body = mapper.writeValueAsString(payload);
        webhookRepository.findByActiveTrue().stream()
                .filter(e -> "*".equals(e.event) || event.equals(e.event))
                .forEach(e -> executor.submit(() -> send(e, event, body)));
    }

    private void send(WebhookEndpoint endpoint, String event, String body) {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint.url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("X-Volta-Event", event)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            log.info("Webhook {} -> {} : HTTP {}", event, endpoint.url, response.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.warn("Webhook {} -> {} failed: {}", event, endpoint.url, e.getMessage());
        }
    }
}
