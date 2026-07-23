package erp.system.leave.service;

import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.service.AuditLogService;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.leave.dto.EmployeeLeaveBalanceGrantRequest;
import erp.system.leave.dto.EmployeeLeaveBalanceResponse;
import erp.system.leave.entity.EmployeeLeaveBalance;
import erp.system.leave.entity.LeaveType;
import erp.system.leave.repository.EmployeeLeaveBalanceRepository;
import erp.system.leave.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeLeaveBalanceService {

    private static final String ANNUAL_LEAVE_TYPE_NAME = "연차";
    private static final int BASE_ANNUAL_LEAVE_DAYS = 14;

    private final EmployeeLeaveBalanceRepository employeeLeaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final AuditLogService auditLogService;

    public List<EmployeeLeaveBalanceResponse> getByEmployee(Long employeeId) {
        return employeeLeaveBalanceRepository.findAllByEmployee_EmployeeId(employeeId).stream()
                .map(EmployeeLeaveBalanceResponse::from)
                .toList();
    }

    @Transactional
    public EmployeeLeaveBalanceResponse grant(EmployeeLeaveBalanceGrantRequest request, Long actorId) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));
        LeaveType leaveType = leaveTypeRepository.findById(request.leaveTypeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LEAVE_TYPE_NOT_FOUND));

        EmployeeLeaveBalance balance = EmployeeLeaveBalance.builder()
                .employee(employee)
                .leaveType(leaveType)
                .totalDays(request.totalDays())
                .expireDate(request.expireDate())
                .build();

        EmployeeLeaveBalanceResponse response = EmployeeLeaveBalanceResponse.from(employeeLeaveBalanceRepository.save(balance));
        auditLogService.log(
                actorId,
                AuditLog.ACTION_LEAVE_BALANCE_GRANT,
                "휴가 잔여일수 등록: " + employee.getName() + " (" + leaveType.getLeaveTypeName() + " " + request.totalDays() + "일)",
                null
        );
        return response;
    }

    @Transactional
    public void grantDefaultAnnualLeave(Employee employee) {
        LeaveType leaveType = leaveTypeRepository.findByLeaveTypeName(ANNUAL_LEAVE_TYPE_NAME)
                .orElseThrow(() -> new BusinessException(ErrorCode.LEAVE_TYPE_NOT_FOUND));

        LocalDate baseDate = employee.getHireDate() != null ? employee.getHireDate() : LocalDate.now();

        EmployeeLeaveBalance balance = EmployeeLeaveBalance.builder()
                .employee(employee)
                .leaveType(leaveType)
                .totalDays(resolveAnnualLeaveDays(employee))
                .expireDate(baseDate.plusYears(1))
                .build();

        employeeLeaveBalanceRepository.save(balance);
    }

    private BigDecimal resolveAnnualLeaveDays(Employee employee) {
        int level = employee.getPosition() != null && employee.getPosition().getLevel() != null
                ? employee.getPosition().getLevel()
                : 1;
        return BigDecimal.valueOf(BASE_ANNUAL_LEAVE_DAYS + level);
    }
}
