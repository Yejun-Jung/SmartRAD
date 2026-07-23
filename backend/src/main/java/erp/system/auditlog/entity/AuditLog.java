package erp.system.auditlog.entity;

import erp.system.common.entity.CreatedAtEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "audit_log")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditLog extends CreatedAtEntity {

    public static final String ACTION_EMPLOYEE_CREATE = "EMPLOYEE_CREATE";
    public static final String ACTION_EMPLOYEE_BULK_CREATE = "EMPLOYEE_BULK_CREATE";
    public static final String ACTION_EMPLOYEE_UPDATE = "EMPLOYEE_UPDATE";
    public static final String ACTION_EMPLOYEE_DELETE = "EMPLOYEE_DELETE";
    public static final String ACTION_DEPARTMENT_CREATE = "DEPARTMENT_CREATE";
    public static final String ACTION_DEPARTMENT_UPDATE = "DEPARTMENT_UPDATE";
    public static final String ACTION_DEPARTMENT_DELETE = "DEPARTMENT_DELETE";
    public static final String ACTION_PAYROLL_BASE_SALARY_UPDATE = "PAYROLL_BASE_SALARY_UPDATE";
    public static final String ACTION_PAYROLL_BULK_EMPLOYMENT_TYPE = "PAYROLL_BULK_EMPLOYMENT_TYPE";
    public static final String ACTION_PAYROLL_BULK_BASIC_REGISTER = "PAYROLL_BULK_BASIC_REGISTER";
    public static final String ACTION_APPOINTMENT_CREATE = "APPOINTMENT_CREATE";
    public static final String ACTION_APPOINTMENT_DELETE = "APPOINTMENT_DELETE";
    public static final String ACTION_CERTIFICATE_CREATE = "CERTIFICATE_CREATE";
    public static final String ACTION_CERTIFICATE_APPROVE = "CERTIFICATE_APPROVE";
    public static final String ACTION_CERTIFICATE_REJECT = "CERTIFICATE_REJECT";
    public static final String ACTION_CERTIFICATE_ISSUE = "CERTIFICATE_ISSUE";
    public static final String ACTION_EVENT_SUPPORT_APPROVE = "EVENT_SUPPORT_APPROVE";
    public static final String ACTION_EVENT_SUPPORT_REJECT = "EVENT_SUPPORT_REJECT";
    public static final String ACTION_EVENT_SUPPORT_PAY = "EVENT_SUPPORT_PAY";
    public static final String ACTION_LEAVE_REQUEST_CREATE = "LEAVE_REQUEST_CREATE";
    public static final String ACTION_LEAVE_REQUEST_APPROVE = "LEAVE_REQUEST_APPROVE";
    public static final String ACTION_LEAVE_REQUEST_REJECT = "LEAVE_REQUEST_REJECT";
    public static final String ACTION_LEAVE_TYPE_CREATE = "LEAVE_TYPE_CREATE";
    public static final String ACTION_LEAVE_BALANCE_GRANT = "LEAVE_BALANCE_GRANT";
    public static final String ACTION_LEAVE_POLICY_CREATE = "LEAVE_POLICY_CREATE";
    public static final String ACTION_LEAVE_POLICY_DELETE = "LEAVE_POLICY_DELETE";
    public static final String ACTION_NOTICE_CREATE = "NOTICE_CREATE";
    public static final String ACTION_NOTICE_UPDATE = "NOTICE_UPDATE";
    public static final String ACTION_NOTICE_DELETE = "NOTICE_DELETE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_log_id")
    private Long auditLogId;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "target_description", nullable = false, length = 500)
    private String targetDescription;

    @Column(name = "detail", length = 1000)
    private String detail;

    @Builder
    public AuditLog(Long actorId, String actorName, String actionType, String targetDescription, String detail) {
        this.actorId = actorId;
        this.actorName = actorName;
        this.actionType = actionType;
        this.targetDescription = targetDescription;
        this.detail = detail;
    }
}
