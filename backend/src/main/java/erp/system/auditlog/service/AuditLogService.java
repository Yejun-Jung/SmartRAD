package erp.system.auditlog.service;

import erp.system.auditlog.dto.AuditLogResponse;
import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.repository.AuditLogRepository;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public void log(Long actorId, String actionType, String targetDescription, String detail) {
        String actorName = actorId != null
                ? employeeRepository.findById(actorId).map(Employee::getName).orElse("알 수 없음")
                : "시스템";
        auditLogRepository.save(AuditLog.builder()
                .actorId(actorId)
                .actorName(actorName)
                .actionType(actionType)
                .targetDescription(targetDescription)
                .detail(detail)
                .build());
    }

    public Page<AuditLogResponse> getList(String actionType, Long actorId, LocalDate from, LocalDate to, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            var predicate = cb.conjunction();
            if (StringUtils.hasText(actionType)) {
                predicate = cb.and(predicate, cb.equal(root.get("actionType"), actionType));
            }
            if (actorId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("actorId"), actorId));
            }
            if (from != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
            }
            if (to != null) {
                predicate = cb.and(predicate, cb.lessThan(root.get("createdAt"), to.plusDays(1).atStartOfDay()));
            }
            return predicate;
        };
        return auditLogRepository.findAll(spec, pageable).map(AuditLogResponse::from);
    }
}
