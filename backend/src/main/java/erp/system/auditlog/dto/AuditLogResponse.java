package erp.system.auditlog.dto;

import erp.system.auditlog.entity.AuditLog;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long auditLogId,
        Long actorId,
        String actorName,
        String actionType,
        String targetDescription,
        String detail,
        LocalDateTime createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getAuditLogId(),
                log.getActorId(),
                log.getActorName(),
                log.getActionType(),
                log.getTargetDescription(),
                log.getDetail(),
                log.getCreatedAt()
        );
    }
}
