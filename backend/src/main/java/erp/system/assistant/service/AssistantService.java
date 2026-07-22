package erp.system.assistant.service;

import erp.system.assistant.client.AiClient;
import erp.system.assistant.dto.ChatResponse;
import erp.system.assistant.dto.SummarizeResponse;
import erp.system.attendance.dto.AttendanceResponse;
import erp.system.attendance.service.AttendanceService;
import erp.system.employee.dto.EmployeeResponse;
import erp.system.employee.service.EmployeeService;
import erp.system.leave.dto.EmployeeLeaveBalanceResponse;
import erp.system.leave.service.EmployeeLeaveBalanceService;
import erp.system.payroll.dto.PayrollResponse;
import erp.system.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssistantService {

    private static final int RECENT_PAYROLL_COUNT = 3;

    private final AiClient aiClient;
    private final EmployeeService employeeService;
    private final EmployeeLeaveBalanceService employeeLeaveBalanceService;
    private final PayrollService payrollService;
    private final AttendanceService attendanceService;

    private static final String SUMMARIZE_SYSTEM_PROMPT =
            "당신은 SmartHR 사내 인사관리 시스템의 요약 도우미입니다. "
                    + "입력된 텍스트를 한국어로 1~2문장, 최대 80자 이내로 간결하게 요약하세요. "
                    + "요약 문장만 출력하고 다른 설명은 덧붙이지 마세요.";

    public ChatResponse ask(Long employeeId, String message) {
        String systemPrompt = buildSystemPrompt(employeeId);
        String reply = aiClient.ask(systemPrompt, message);
        return new ChatResponse(reply);
    }

    public SummarizeResponse summarize(String text) {
        String summary = aiClient.ask(SUMMARIZE_SYSTEM_PROMPT, text);
        return new SummarizeResponse(summary.trim());
    }

    private String buildSystemPrompt(Long employeeId) {
        EmployeeResponse employee = employeeService.getById(employeeId, employeeId, false);
        List<EmployeeLeaveBalanceResponse> leaveBalances = employeeLeaveBalanceService.getByEmployee(employeeId);
        List<PayrollResponse> recentPayrolls = payrollService.getList(employeeId, null).stream()
                .sorted(Comparator.comparing(PayrollResponse::payrollYearMonth).reversed())
                .limit(RECENT_PAYROLL_COUNT)
                .toList();
        List<AttendanceResponse> thisMonthAttendance = attendanceService.getMyMonthly(employeeId, YearMonth.now());

        StringBuilder sb = new StringBuilder();
        sb.append("당신은 SmartHR 사내 인사관리 시스템의 AI 비서입니다. ");
        sb.append("아래 제공된 직원 본인의 데이터만 근거로 한국어로 간결하게 답변하세요. ");
        sb.append("제공되지 않은 정보를 추측하거나 지어내지 마세요. 모르면 모른다고 답하세요.\n\n");

        sb.append("[직원 정보]\n");
        sb.append("이름: ").append(employee.name()).append(", 사번: ").append(employee.employeeNo()).append('\n');
        sb.append("부서: ").append(nullSafe(employee.departmentName())).append(", 직급: ").append(nullSafe(employee.positionName())).append('\n');
        sb.append("입사일: ").append(nullSafe(employee.hireDate())).append(", 재직상태: ").append(nullSafe(employee.employeeStatusCode())).append("\n\n");

        sb.append("[휴가 잔여 현황]\n");
        if (leaveBalances.isEmpty()) {
            sb.append("등록된 휴가 정보가 없습니다.\n");
        } else {
            for (EmployeeLeaveBalanceResponse balance : leaveBalances) {
                sb.append(balance.leaveTypeName())
                        .append(": 총 ").append(balance.totalDays())
                        .append("일 중 ").append(balance.usedDays())
                        .append("일 사용, 잔여 ").append(balance.remainDays())
                        .append("일 (만료일: ").append(nullSafe(balance.expireDate())).append(")\n");
            }
        }
        sb.append('\n');

        sb.append("[최근 급여 명세서]\n");
        if (recentPayrolls.isEmpty()) {
            sb.append("등록된 급여 내역이 없습니다.\n");
        } else {
            for (PayrollResponse payroll : recentPayrolls) {
                sb.append(payroll.payrollYearMonth())
                        .append(": 실지급액 ").append(payroll.realPayAmount())
                        .append("원, 상태 ").append(payroll.payrollStatusCode())
                        .append(", 지급일 ").append(nullSafe(payroll.paymentDate())).append('\n');
            }
        }
        sb.append('\n');

        sb.append("[이번 달 근태 기록]\n");
        if (thisMonthAttendance.isEmpty()) {
            sb.append("이번 달 근태 기록이 없습니다.\n");
        } else {
            for (AttendanceResponse attendance : thisMonthAttendance) {
                sb.append(attendance.workDate())
                        .append(": ").append(nullSafe(attendance.attendanceStatusCode()))
                        .append(", 지각 ").append(nullSafe(attendance.lateMinutes())).append("분")
                        .append(", 조퇴 ").append(nullSafe(attendance.earlyLeaveMinutes())).append("분\n");
            }
        }

        return sb.toString();
    }

    private String nullSafe(Object value) {
        return value == null ? "정보 없음" : value.toString();
    }
}
