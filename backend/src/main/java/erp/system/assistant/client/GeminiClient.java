package erp.system.assistant.client;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Component
@ConditionalOnProperty(name = "assistant.provider", havingValue = "gemini", matchIfMissing = true)
public class GeminiClient implements AiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private static final int MAX_OUTPUT_TOKENS = 512;

    private final RestClient restClient = RestClient.create("https://generativelanguage.googleapis.com");
    private final String apiKey;
    private final String model;

    public GeminiClient(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(apiKey);
    }

    @Override
    public String ask(String systemPrompt, String userMessage) {
        if (!isConfigured()) {
            throw new BusinessException(ErrorCode.ASSISTANT_NOT_CONFIGURED);
        }

        GeminiRequest request = new GeminiRequest(
                List.of(new GeminiContent("user", List.of(new GeminiPart(userMessage)))),
                new GeminiSystemInstruction(List.of(new GeminiPart(systemPrompt))),
                new GeminiGenerationConfig(MAX_OUTPUT_TOKENS)
        );

        try {
            GeminiResponse response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .build(model))
                    .header("X-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(GeminiResponse.class);

            if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
                throw new BusinessException(ErrorCode.ASSISTANT_REQUEST_FAILED);
            }
            List<GeminiPart> parts = response.candidates().get(0).content().parts();
            if (parts == null || parts.isEmpty()) {
                throw new BusinessException(ErrorCode.ASSISTANT_REQUEST_FAILED);
            }
            return parts.get(0).text();
        } catch (RestClientResponseException e) {
            log.warn("Gemini API request failed: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.ASSISTANT_REQUEST_FAILED);
        } catch (RestClientException e) {
            log.warn("Gemini API request failed", e);
            throw new BusinessException(ErrorCode.ASSISTANT_REQUEST_FAILED);
        }
    }
}
