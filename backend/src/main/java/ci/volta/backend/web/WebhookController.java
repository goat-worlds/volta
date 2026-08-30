package ci.volta.backend.web;

import ci.volta.backend.model.WebhookEndpoint;
import ci.volta.backend.repository.WebhookRepository;
import ci.volta.backend.service.WebhookService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    public record WebhookRequest(String url, String event) {
    }

    private final WebhookRepository webhookRepository;
    private final WebhookService webhookService;

    public WebhookController(WebhookRepository webhookRepository, WebhookService webhookService) {
        this.webhookRepository = webhookRepository;
        this.webhookService = webhookService;
    }

    @GetMapping
    public List<WebhookEndpoint> list() {
        return webhookRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WebhookEndpoint create(@RequestBody WebhookRequest body) {
        return webhookService.register(body.url(), body.event());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        webhookRepository.deleteById(id);
    }

    @PostMapping("/{id}/test")
    public void test(@PathVariable String id) {
        WebhookEndpoint endpoint = webhookRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Webhook not found"));
        webhookService.dispatch("WEBHOOK_TEST", Map.of("webhookId", endpoint.id, "url", endpoint.url));
    }
}
