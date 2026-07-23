package erp.system.appointment.service;

import erp.system.appointment.dto.EmployeeAppointmentCreateRequest;
import erp.system.appointment.dto.EmployeeAppointmentResponse;
import erp.system.appointment.entity.EmployeeAppointment;
import erp.system.appointment.repository.EmployeeAppointmentRepository;
import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.service.AuditLogService;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.common.util.SoftDeleteAware;
import erp.system.department.entity.Department;
import erp.system.department.repository.DepartmentRepository;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.notification.entity.Notification;
import erp.system.notification.service.NotificationService;
import erp.system.position.entity.Position;
import erp.system.position.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeAppointmentService {

    private final EmployeeAppointmentRepository employeeAppointmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    private static String appointmentTypeLabel(String appointmentType) {
        return switch (appointmentType) {
            case EmployeeAppointment.TYPE_TRANSFER -> "부서 이동";
            case EmployeeAppointment.TYPE_PROMOTION -> "직급 승진";
            case EmployeeAppointment.TYPE_DEMOTION -> "직급 강등";
            case EmployeeAppointment.TYPE_RESIGNATION -> "퇴사";
            case EmployeeAppointment.TYPE_REINSTATEMENT -> "복직";
            default -> appointmentType;
        };
    }

    public List<EmployeeAppointmentResponse> getByEmployee(Long employeeId) {
        return employeeAppointmentRepository.findAllByEmployee_EmployeeIdOrderByEffectiveDateDesc(employeeId).stream()
                .map(EmployeeAppointmentResponse::from)
                .toList();
    }

    public Page<EmployeeAppointmentResponse> getList(Long employeeId, String appointmentType, YearMonth yearMonth,
                                                       String keyword, Pageable pageable) {
        Specification<EmployeeAppointment> spec = (root, query, cb) -> {
            var predicate = cb.conjunction();
            if (employeeId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("employee").get("employeeId"), employeeId));
            }
            if (StringUtils.hasText(appointmentType)) {
                predicate = cb.and(predicate, cb.equal(root.get("appointmentType"), appointmentType));
            }
            if (yearMonth != null) {
                LocalDate start = yearMonth.atDay(1);
                LocalDate end = yearMonth.atEndOfMonth();
                predicate = cb.and(predicate, cb.between(root.get("effectiveDate"), start, end));
            }
            if (StringUtils.hasText(keyword)) {
                predicate = cb.and(predicate, cb.like(root.get("employee").get("name"), "%" + keyword + "%"));
            }
            return predicate;
        };

        return employeeAppointmentRepository.findAll(spec, pageable).map(EmployeeAppointmentResponse::from);
    }

    @Transactional
    public EmployeeAppointmentResponse create(EmployeeAppointmentCreateRequest request, Long actorId) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));

        Department fromDepartment = employee.getDepartment();
        Position fromPosition = employee.getPosition();

        Department toDepartment = request.toDepartmentId() != null
                ? departmentRepository.findById(request.toDepartmentId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND))
                : fromDepartment;

        Position toPosition = request.toPositionId() != null
                ? positionRepository.findById(request.toPositionId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.POSITION_NOT_FOUND))
                : fromPosition;

        String fromJobTitle = employeeAppointmentRepository
                .findFirstByEmployee_EmployeeIdOrderByEffectiveDateDescEmployeeAppointmentIdDesc(employee.getEmployeeId())
                .map(EmployeeAppointment::getToJobTitle)
                .orElse(null);

        EmployeeAppointment appointment = EmployeeAppointment.builder()
                .employee(employee)
                .appointmentType(request.appointmentType())
                .appointmentDate(request.appointmentDate())
                .effectiveDate(request.effectiveDate())
                .fromDepartment(fromDepartment)
                .toDepartment(toDepartment)
                .fromPositionName(fromPosition != null ? fromPosition.getPositionName() : null)
                .toPositionName(toPosition != null ? toPosition.getPositionName() : null)
                .fromJobTitle(fromJobTitle)
                .toJobTitle(request.toJobTitle())
                .reason(request.reason())
                .memo(request.memo())
                .build();

        employeeAppointmentRepository.save(appointment);

        employee.applyAppointment(toDepartment, toPosition);
        if (EmployeeAppointment.TYPE_RESIGNATION.equals(request.appointmentType())) {
            employee.resign(request.effectiveDate());
        }

        notificationService.notify(
                employee.getEmployeeId(),
                Notification.TYPE_APPOINTMENT_CREATED,
                "인사 발령 등록",
                request.effectiveDate() + "자로 [" + appointmentTypeLabel(request.appointmentType()) + "] 발령이 등록되었습니다.",
                "/profile"
        );

        auditLogService.log(
                actorId,
                AuditLog.ACTION_APPOINTMENT_CREATE,
                "인사 발령 등록: " + employee.getName() + " (" + appointmentTypeLabel(request.appointmentType()) + ")",
                null
        );

        return EmployeeAppointmentResponse.from(appointment);
    }

    @Transactional
    public void delete(Long id, Long actorId) {
        EmployeeAppointment appointment = employeeAppointmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPOINTMENT_NOT_FOUND));
        Employee employee = SoftDeleteAware.resolve(appointment.getEmployee(), Employee::getName);
        String description = "인사 발령 삭제: " + (employee != null ? employee.getName() : "알 수 없음")
                + " (" + appointmentTypeLabel(appointment.getAppointmentType()) + ")";
        appointment.markDeleted();
        auditLogService.log(actorId, AuditLog.ACTION_APPOINTMENT_DELETE, description, null);
    }
}
