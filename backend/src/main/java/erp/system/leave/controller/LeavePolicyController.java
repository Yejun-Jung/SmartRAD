package erp.system.leave.controller;

import erp.system.leave.dto.LeavePolicyCreateRequest;
import erp.system.leave.dto.LeavePolicyResponse;
import erp.system.leave.service.LeavePolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-policies")
@RequiredArgsConstructor
public class LeavePolicyController {

    private final LeavePolicyService leavePolicyService;

    @GetMapping
    public List<LeavePolicyResponse> getAll() {
        return leavePolicyService.getAll();
    }

    @PostMapping
    public ResponseEntity<LeavePolicyResponse> create(@Valid @RequestBody LeavePolicyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leavePolicyService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leavePolicyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
