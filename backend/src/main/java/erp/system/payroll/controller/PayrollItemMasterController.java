package erp.system.payroll.controller;

import erp.system.payroll.dto.PayrollItemActiveUpdateRequest;
import erp.system.payroll.dto.PayrollItemMasterCreateRequest;
import erp.system.payroll.dto.PayrollItemMasterResponse;
import erp.system.payroll.service.PayrollItemMasterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll-items")
@RequiredArgsConstructor
public class PayrollItemMasterController {

    private final PayrollItemMasterService payrollItemMasterService;

    @GetMapping
    public List<PayrollItemMasterResponse> getAll() {
        return payrollItemMasterService.getAll();
    }

    @PostMapping
    public ResponseEntity<PayrollItemMasterResponse> create(@Valid @RequestBody PayrollItemMasterCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollItemMasterService.create(request));
    }

    @PatchMapping("/{id}/active")
    public PayrollItemMasterResponse updateActive(@PathVariable Long id, @Valid @RequestBody PayrollItemActiveUpdateRequest request) {
        return payrollItemMasterService.updateActive(id, request.active());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        payrollItemMasterService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
