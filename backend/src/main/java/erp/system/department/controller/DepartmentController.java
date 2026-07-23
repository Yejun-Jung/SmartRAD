package erp.system.department.controller;

import erp.system.department.dto.DepartmentCreateRequest;
import erp.system.department.dto.DepartmentResponse;
import erp.system.department.dto.DepartmentStatsResponse;
import erp.system.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public List<DepartmentResponse> getAll() {
        return departmentService.getAll();
    }

    @GetMapping("/stats")
    public List<DepartmentStatsResponse> getStats() {
        return departmentService.getStats();
    }

    @PostMapping
    public ResponseEntity<DepartmentResponse> create(@Valid @RequestBody DepartmentCreateRequest request,
                                                      @AuthenticationPrincipal Long requesterId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.create(request, requesterId));
    }

    @PutMapping("/{id}")
    public DepartmentResponse update(@PathVariable Long id, @Valid @RequestBody erp.system.department.dto.DepartmentUpdateRequest request,
                                      @AuthenticationPrincipal Long requesterId) {
        return departmentService.update(id, request, requesterId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @RequestParam(required = false) Long reassignToDepartmentId,
                        @AuthenticationPrincipal Long requesterId) {
        departmentService.delete(id, reassignToDepartmentId, requesterId);
    }
}
