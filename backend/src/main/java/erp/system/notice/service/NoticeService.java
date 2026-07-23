package erp.system.notice.service;

import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.service.AuditLogService;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.notice.dto.NoticeCreateRequest;
import erp.system.notice.dto.NoticeResponse;
import erp.system.notice.dto.NoticeSummaryResponse;
import erp.system.notice.dto.NoticeUpdateRequest;
import erp.system.notice.entity.Notice;
import erp.system.notice.entity.NoticeView;
import erp.system.notice.repository.NoticeRepository;
import erp.system.notice.repository.NoticeViewRepository;
import erp.system.notification.entity.Notification;
import erp.system.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final EmployeeRepository employeeRepository;
    private final NoticeViewRepository noticeViewRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public Page<NoticeSummaryResponse> getList(String keyword, Pageable pageable) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword : null;
        return noticeRepository.search(normalizedKeyword, pageable).map(NoticeSummaryResponse::from);
    }

    @Transactional
    public NoticeResponse getById(Long noticeId, Long viewerId) {
        Notice notice = findActive(noticeId);
        if (viewerId != null && !noticeViewRepository.existsByNotice_NoticeIdAndEmployee_EmployeeId(noticeId, viewerId)) {
            Employee viewer = employeeRepository.findById(viewerId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));
            noticeViewRepository.save(NoticeView.builder().notice(notice).employee(viewer).build());
            notice.increaseViewCount();
        }
        return NoticeResponse.from(notice);
    }

    @Transactional
    public NoticeResponse create(Long writerId, NoticeCreateRequest request) {
        Employee writer = employeeRepository.findById(writerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));

        Notice notice = Notice.builder()
                .writer(writer)
                .title(request.title())
                .content(request.content())
                .pinned(request.pinned())
                .build();

        Notice saved = noticeRepository.save(notice);

        notificationService.notifyAllExceptSelf(
                writerId,
                Notification.TYPE_NOTICE_CREATED,
                "새 공지사항",
                "\"" + request.title() + "\" 공지사항이 등록되었습니다.",
                "/notices/view",
                "/notices"
        );

        auditLogService.log(writerId, AuditLog.ACTION_NOTICE_CREATE, "공지사항 등록: " + request.title(), null);

        return NoticeResponse.from(saved);
    }

    @Transactional
    public NoticeResponse update(Long noticeId, NoticeUpdateRequest request, Long actorId) {
        Notice notice = findActive(noticeId);
        notice.update(request.title(), request.content(), request.pinned());
        auditLogService.log(actorId, AuditLog.ACTION_NOTICE_UPDATE, "공지사항 수정: " + request.title(), null);
        return NoticeResponse.from(notice);
    }

    @Transactional
    public void delete(Long noticeId, Long actorId) {
        Notice notice = findActive(noticeId);
        String title = notice.getTitle();
        notice.markDeleted();
        auditLogService.log(actorId, AuditLog.ACTION_NOTICE_DELETE, "공지사항 삭제: " + title, null);
    }

    private Notice findActive(Long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
    }
}
