package erp.system.certificate.controller;

import erp.system.certificate.dto.EmployeeCertificateIssueCreateRequest;
import erp.system.certificate.dto.EmployeeCertificateIssueRejectRequest;
import erp.system.certificate.dto.EmployeeCertificateIssueResponse;
import erp.system.certificate.dto.MyCertificateIssueCreateRequest;
import erp.system.certificate.service.EmployeeCertificateIssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificate-issues")
@RequiredArgsConstructor
public class EmployeeCertificateIssueController {

    private final EmployeeCertificateIssueService certificateIssueService;

    @GetMapping("/me")
    public List<EmployeeCertificateIssueResponse> getMine(@AuthenticationPrincipal Long employeeId) {
        return certificateIssueService.getByEmployee(employeeId);
    }

    @PostMapping("/me")
    public ResponseEntity<EmployeeCertificateIssueResponse> createMine(
            @AuthenticationPrincipal Long employeeId,
            @Valid @RequestBody MyCertificateIssueCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificateIssueService.createMine(employeeId, request));
    }

    @GetMapping
    public List<EmployeeCertificateIssueResponse> getByEmployee(@RequestParam Long employeeId) {
        return certificateIssueService.getByEmployee(employeeId);
    }

    @GetMapping("/search")
    public Page<EmployeeCertificateIssueResponse> getList(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String certificateType,
            @RequestParam(required = false) String approvalStatus,
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {
        return certificateIssueService.getList(employeeId, certificateType, approvalStatus, keyword, pageable);
    }

    @PostMapping
    public ResponseEntity<EmployeeCertificateIssueResponse> create(@Valid @RequestBody EmployeeCertificateIssueCreateRequest request,
                                                                    @AuthenticationPrincipal Long requesterId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificateIssueService.create(request, requesterId));
    }

    @PatchMapping("/{id}/approve")
    public EmployeeCertificateIssueResponse approve(@PathVariable Long id, @AuthenticationPrincipal Long requesterId) {
        return certificateIssueService.approve(id, requesterId);
    }

    @PatchMapping("/{id}/reject")
    public EmployeeCertificateIssueResponse reject(@PathVariable Long id, @Valid @RequestBody EmployeeCertificateIssueRejectRequest request,
                                                    @AuthenticationPrincipal Long requesterId) {
        return certificateIssueService.reject(id, request.memo(), requesterId);
    }

    @PatchMapping("/{id}/issue")
    public EmployeeCertificateIssueResponse issue(@PathVariable Long id, @AuthenticationPrincipal Long requesterId) {
        return certificateIssueService.issue(id, requesterId);
    }
}
