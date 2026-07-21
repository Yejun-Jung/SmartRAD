package erp.system.assistant.controller;

import erp.system.assistant.dto.ChatRequest;
import erp.system.assistant.dto.ChatResponse;
import erp.system.assistant.service.AssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantService assistantService;

    @PostMapping("/chat")
    public ChatResponse chat(@AuthenticationPrincipal Long employeeId, @Valid @RequestBody ChatRequest request) {
        return assistantService.ask(employeeId, request.message());
    }
}
