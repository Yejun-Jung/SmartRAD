package erp.system.employee.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record EmployeeBulkCreateRequest(
        @NotEmpty(message = "등록할 직원 목록이 비어 있습니다.") List<EmployeeCreateRequest> items
) {
}
