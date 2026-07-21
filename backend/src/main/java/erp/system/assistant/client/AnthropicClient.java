package erp.system.assistant.client;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class AnthropicClient {

    private final RestClient restClient = RestClient.create("https://api.anthropic.com");
    private final String apiKey;
    private final String model;

    public AnthropicClient(
            @Value("${anthropic.api-key:}") String apiKey,
            @Value("${anthropic.model}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean isConfigured() {
        return StringUtils.hasText(apiKey);
    }

    public String ask(String systemPrompt, String userMessage) {
        if (!isConfigured()) {
            throw new BusinessException(ErrorCode.ASSISTANT_NOT_CONFIGURED);
        }

        AnthropicRequest request = new AnthropicRequest(
                model,
                1024,
                systemPrompt,
                List.of(new AnthropicMessage("user", userMessage))
        );

        try {
            AnthropicResponse response = restClient.post()
                    .uri("/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AnthropicResponse.class);

            if (response == null || response.content() == null || response.content().isEmpty()) {
                throw new BusinessException(ErrorCode.ASSISTANT_REQUEST_FAILED);
            }
            return response.content().get(0).text();
        } catch (RestClientException e) {
            throw new BusinessException(ErrorCode.ASSISTANT_REQUEST_FAILED);
        }
    }
}
