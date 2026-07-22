package erp.system.assistant.client;

import java.util.List;

public record GeminiRequest(
        List<GeminiContent> contents,
        GeminiSystemInstruction systemInstruction,
        GeminiGenerationConfig generationConfig
) {
}
