package erp.system.leave.controller;

import erp.system.leave.dto.LeaveTypeCreateRequest;
import erp.system.leave.dto.LeaveTypeResponse;
import erp.system.leave.service.LeaveTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-types")
@RequiredArgsConstructor
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    @GetMapping
    public List<LeaveTypeResponse> getAll() {
        return leaveTypeService.getAll();
    }

    @PostMapping
    public ResponseEntity<LeaveTypeResponse> create(@Valid @RequestBody LeaveTypeCreateRequest request,
                                                     @AuthenticationPrincipal Long requesterId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveTypeService.create(request, requesterId));
    }
}
