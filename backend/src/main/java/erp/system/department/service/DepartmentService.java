package erp.system.department.service;

import erp.system.attendance.entity.Attendance;
import erp.system.attendance.repository.AttendanceRepository;
import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.service.AuditLogService;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.department.dto.DepartmentCreateRequest;
import erp.system.department.dto.DepartmentResponse;
import erp.system.department.dto.DepartmentStatsResponse;
import erp.system.department.dto.DepartmentUpdateRequest;
import erp.system.department.entity.Department;
import erp.system.department.repository.DepartmentRepository;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.notification.entity.Notification;
import erp.system.notification.service.NotificationService;
import erp.system.payroll.entity.Payroll;
import erp.system.payroll.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private static final DateTimeFormatter YEAR_MONTH_KEY = DateTimeFormatter.ofPattern("yyyyMM");

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollRepository payrollRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    public List<DepartmentStatsResponse> getStats() {
        List<Department> departments = departmentRepository.findAll();

        Map<Long, List<Employee>> employeesByDept = employeeRepository.findAll().stream()
                .filter(e -> !Employee.STATUS_RESIGNED.equals(e.getEmployeeStatusCode()))
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(e -> e.getDepartment().getDepartmentId()));

        YearMonth currentYearMonth = YearMonth.now();
        List<Payroll> currentPayrolls = payrollRepository.findAllByPayrollYearMonth(currentYearMonth.format(YEAR_MONTH_KEY));
        Map<Long, List<Payroll>> payrollsByDept = currentPayrolls.stream()
                .filter(p -> p.getEmployee() != null && p.getEmployee().getDepartment() != null)
                .collect(Collectors.groupingBy(p -> p.getEmployee().getDepartment().getDepartmentId()));

        List<Attendance> currentAttendances = attendanceRepository.findAllByWorkDateBetween(
                currentYearMonth.atDay(1), currentYearMonth.atEndOfMonth());
        Map<Long, List<Attendance>> attendancesByDept = currentAttendances.stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getDepartment() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getDepartment().getDepartmentId()));

        LocalDate today = LocalDate.now();

        return departments.stream()
                .map(dept -> buildStats(dept, employeesByDept, payrollsByDept, attendancesByDept, today))
                .toList();
    }

    private DepartmentStatsResponse buildStats(Department department,
                                                Map<Long, List<Employee>> employeesByDept,
                                                Map<Long, List<Payroll>> payrollsByDept,
                                                Map<Long, List<Attendance>> attendancesByDept,
                                                LocalDate today) {
        List<Employee> deptEmployees = employeesByDept.getOrDefault(department.getDepartmentId(), List.of());
        var tenureStats = deptEmployees.stream()
                .map(Employee::getHireDate)
                .filter(Objects::nonNull)
                .mapToDouble(hireDate -> ChronoUnit.DAYS.between(hireDate, today) / 365.0)
                .average();
        Double averageTenureYears = tenureStats.isPresent() ? tenureStats.getAsDouble() : null;

        List<Payroll> deptPayrolls = payrollsByDept.getOrDefault(department.getDepartmentId(), List.of());
        BigDecimal payrollTotal = deptPayrolls.stream()
                .map(p -> p.getRealPayAmount() != null ? p.getRealPayAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal payrollAverage = deptPayrolls.isEmpty()
                ? BigDecimal.ZERO
                : payrollTotal.divide(BigDecimal.valueOf(deptPayrolls.size()), 0, RoundingMode.HALF_UP);

        List<Attendance> deptAttendances = attendancesByDept.getOrDefault(department.getDepartmentId(), List.of());
        Double attendanceIssueRate = deptAttendances.isEmpty() ? null : deptAttendances.stream()
                .filter(a -> (a.getLateMinutes() != null && a.getLateMinutes() > 0) || Attendance.STATUS_ABSENT.equals(a.getAttendanceStatusCode()))
                .count() * 100.0 / deptAttendances.size();

        return new DepartmentStatsResponse(
                department.getDepartmentId(),
                deptEmployees.size(),
                averageTenureYears,
                payrollTotal,
                payrollAverage,
                attendanceIssueRate
        );
    }

    @Transactional
    public DepartmentResponse create(DepartmentCreateRequest request, Long actorId) {
        Department parent = resolveParent(request.parentDepartmentId());

        Department department = Department.builder()
                .departmentName(request.departmentName())
                .parentDepartment(parent)
                .build();

        Department saved = departmentRepository.save(department);

        if (parent != null) {
            notificationService.notifyDepartmentMembers(
                    parent.getDepartmentId(),
                    Notification.TYPE_DEPARTMENT_CREATED,
                    "하위 부서 추가",
                    "\"" + parent.getDepartmentName() + "\" 부서에 \"" + saved.getDepartmentName() + "\" 하위 부서가 추가되었습니다.",
                    "/profile"
            );
        }

        auditLogService.log(
                actorId,
                AuditLog.ACTION_DEPARTMENT_CREATE,
                "부서 생성: " + saved.getDepartmentName() + (parent != null ? " (상위 부서: " + parent.getDepartmentName() + ")" : ""),
                null
        );

        return DepartmentResponse.from(saved);
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentUpdateRequest request, Long actorId) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

        if (Objects.equals(id, request.parentDepartmentId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "자기 자신을 상위 부서로 지정할 수 없습니다.");
        }

        Department parent = resolveParent(request.parentDepartmentId());

        // 순환 참조 방지를 위해 parent가 현재 부서의 하위 부서인지 검사하는 로직이 필요할 수 있지만,
        // 간단한 1 depth 에서는 위 체크로 충분하거나, 향후 트리를 순회하는 검증이 추가될 수 있음

        erp.system.employee.entity.Employee head = null;
        if (request.departmentHeadId() != null) {
            head = employeeRepository.findById(request.departmentHeadId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, "해당 직원을 찾을 수 없습니다."));
            if (head.getDepartment() == null || !head.getDepartment().getDepartmentId().equals(id)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "해당 부서에 소속된 직원만 부서장으로 지정할 수 있습니다.");
            }
        }

        String previousName = department.getDepartmentName();
        Long previousParentId = department.getParentDepartment() != null
                ? department.getParentDepartment().getDepartmentId() : null;

        department.update(request.departmentName(), parent, head);

        boolean nameChanged = !previousName.equals(request.departmentName());
        Long newParentId = parent != null ? parent.getDepartmentId() : null;
        boolean parentChanged = !Objects.equals(previousParentId, newParentId);

        if (nameChanged) {
            notificationService.notifyDepartmentMembers(
                    id,
                    Notification.TYPE_DEPARTMENT_UPDATED,
                    "부서명 변경",
                    "소속 부서명이 \"" + previousName + "\"에서 \"" + request.departmentName() + "\"(으)로 변경되었습니다.",
                    "/profile"
            );
        }
        if (parentChanged) {
            String newParentName = parent != null ? parent.getDepartmentName() : "없음";
            notificationService.notifyDepartmentMembers(
                    id,
                    Notification.TYPE_DEPARTMENT_UPDATED,
                    "소속 부서 이동",
                    "\"" + department.getDepartmentName() + "\" 부서의 상위 부서가 \"" + newParentName + "\"(으)로 변경되었습니다.",
                    "/profile"
            );
        }

        if (nameChanged || parentChanged) {
            auditLogService.log(
                    actorId,
                    AuditLog.ACTION_DEPARTMENT_UPDATE,
                    "부서 수정: " + previousName + (nameChanged ? " → " + request.departmentName() : ""),
                    null
            );
        }

        return DepartmentResponse.from(department);
    }

    @Transactional
    public void delete(Long id, Long reassignToDepartmentId, Long actorId) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

        if (departmentRepository.existsByParentDepartment_DepartmentId(id)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "하위 부서가 존재하여 삭제할 수 없습니다.");
        }

        List<Employee> members = employeeRepository.findAllByDepartment_DepartmentId(id);
        if (!members.isEmpty()) {
            if (reassignToDepartmentId == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "소속된 직원이 있어 삭제할 수 없습니다. 이동할 부서를 선택해주세요.");
            }
            if (reassignToDepartmentId.equals(id)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "삭제할 부서와 동일한 부서로는 이동할 수 없습니다.");
            }
            Department target = departmentRepository.findById(reassignToDepartmentId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

            String previousDeptName = department.getDepartmentName();
            members.forEach(member -> {
                member.applyAppointment(target, null);
                notificationService.notify(
                        member,
                        Notification.TYPE_DEPARTMENT_UPDATED,
                        "소속 부서 변경",
                        "\"" + previousDeptName + "\" 부서가 삭제되어 \"" + target.getDepartmentName() + "\" 부서로 소속이 변경되었습니다.",
                        "/profile"
                );
            });
        }

        department.markDeleted();

        auditLogService.log(
                actorId,
                AuditLog.ACTION_DEPARTMENT_DELETE,
                "부서 삭제: " + department.getDepartmentName(),
                null
        );
    }

    private Department resolveParent(Long parentDepartmentId) {
        if (parentDepartmentId == null) {
            return null;
        }
        return departmentRepository.findById(parentDepartmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
    }
}
