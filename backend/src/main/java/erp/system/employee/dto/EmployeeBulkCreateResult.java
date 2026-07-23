package erp.system.employee.dto;

public record EmployeeBulkCreateResult(
        int rowIndex,
        String name,
        boolean success,
        String employeeNo,
        String failureReason
) {
}
