package erp.system.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MyCertificateIssueCreateRequest(
        @NotBlank(message = "증명서 종류는 필수입니다.") String certificateType,
        @Size(max = 500) String purpose,
        @Size(max = 1000) String memo
) {
}
