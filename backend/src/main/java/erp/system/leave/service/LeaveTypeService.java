package erp.system.leave.service;

import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.service.AuditLogService;
import erp.system.leave.dto.LeaveTypeCreateRequest;
import erp.system.leave.dto.LeaveTypeResponse;
import erp.system.leave.entity.LeaveType;
import erp.system.leave.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final AuditLogService auditLogService;

    public List<LeaveTypeResponse> getAll() {
        return leaveTypeRepository.findAll().stream()
                .map(LeaveTypeResponse::from)
                .toList();
    }

    @Transactional
    public LeaveTypeResponse create(LeaveTypeCreateRequest request, Long actorId) {
        LeaveType leaveType = LeaveType.builder()
                .leaveTypeName(request.leaveTypeName())
                .paidYn(request.paidYn())
                .defaultDays(request.defaultDays())
                .note(request.note())
                .build();

        LeaveType saved = leaveTypeRepository.save(leaveType);
        auditLogService.log(actorId, AuditLog.ACTION_LEAVE_TYPE_CREATE, "휴가유형 등록: " + saved.getLeaveTypeName(), null);
        return LeaveTypeResponse.from(saved);
    }
}
