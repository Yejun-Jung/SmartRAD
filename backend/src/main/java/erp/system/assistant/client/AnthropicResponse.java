package erp.system.assistant.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AnthropicResponse(List<AnthropicContentBlock> content) {
}
