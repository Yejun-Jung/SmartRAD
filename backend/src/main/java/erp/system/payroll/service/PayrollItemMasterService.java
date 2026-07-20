package erp.system.payroll.service;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.payroll.dto.PayrollItemMasterCreateRequest;
import erp.system.payroll.dto.PayrollItemMasterResponse;
import erp.system.payroll.entity.PayrollItemMaster;
import erp.system.payroll.repository.PayrollItemMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayrollItemMasterService {

    private final PayrollItemMasterRepository payrollItemMasterRepository;

    public List<PayrollItemMasterResponse> getAll() {
        return payrollItemMasterRepository.findAll().stream()
                .map(PayrollItemMasterResponse::from)
                .toList();
    }

    @Transactional
    public PayrollItemMasterResponse create(PayrollItemMasterCreateRequest request) {
        PayrollItemMaster item = PayrollItemMaster.builder()
                .itemName(request.itemName())
                .itemTypeCode(request.itemTypeCode())
                .taxable(request.taxable())
                .fixed(request.fixed())
                .defaultAmount(request.defaultAmount())
                .rate(request.rate())
                .build();

        return PayrollItemMasterResponse.from(payrollItemMasterRepository.save(item));
    }

    @Transactional
    public void delete(Long payrollItemMasterId) {
        PayrollItemMaster item = findActive(payrollItemMasterId);
        item.markDeleted();
    }

    @Transactional
    public PayrollItemMasterResponse updateActive(Long payrollItemMasterId, boolean active) {
        PayrollItemMaster item = findActive(payrollItemMasterId);
        item.setActive(active);
        return PayrollItemMasterResponse.from(item);
    }

    private PayrollItemMaster findActive(Long payrollItemMasterId) {
        return payrollItemMasterRepository.findById(payrollItemMasterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYROLL_ITEM_NOT_FOUND));
    }
}
