package erp.system.leave.service;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.leave.dto.LeavePolicyCreateRequest;
import erp.system.leave.dto.LeavePolicyResponse;
import erp.system.leave.entity.LeavePolicy;
import erp.system.leave.repository.LeavePolicyRepository;
import erp.system.position.entity.Position;
import erp.system.position.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeavePolicyService {

    private final LeavePolicyRepository leavePolicyRepository;
    private final PositionRepository positionRepository;

    public List<LeavePolicyResponse> getAll() {
        return leavePolicyRepository.findAll().stream()
                .map(LeavePolicyResponse::from)
                .toList();
    }

    @Transactional
    public LeavePolicyResponse create(LeavePolicyCreateRequest request) {
        Position position = positionRepository.findById(request.positionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.POSITION_NOT_FOUND));

        LeavePolicy leavePolicy = LeavePolicy.builder()
                .position(position)
                .annualLeaveDays(request.annualLeaveDays())
                .maxCarryOverDays(request.maxCarryOverDays())
                .halfDayAllowed(request.halfDayAllowed())
                .note(request.note())
                .build();

        return LeavePolicyResponse.from(leavePolicyRepository.save(leavePolicy));
    }

    @Transactional
    public void delete(Long leavePolicyId) {
        if (!leavePolicyRepository.existsById(leavePolicyId)) {
            throw new BusinessException(ErrorCode.LEAVE_POLICY_NOT_FOUND);
        }
        leavePolicyRepository.deleteById(leavePolicyId);
    }
}
