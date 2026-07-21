package erp.system.assistant.client;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnthropicRequest(
        String model,
        @JsonProperty("max_tokens") int maxTokens,
        String system,
        List<AnthropicMessage> messages
) {
}
