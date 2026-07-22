package erp.system.assistant.dto;

import jakarta.validation.constraints.NotBlank;

public record SummarizeRequest(@NotBlank String text) {
}
