package erp.system.notification.service;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.notification.dto.NotificationResponse;
import erp.system.notification.entity.Notification;
import erp.system.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    public Page<NotificationResponse> getMyNotifications(Long employeeId, Pageable pageable) {
        return notificationRepository.findByRecipient_EmployeeIdOrderByCreatedAtDesc(employeeId, pageable)
                .map(NotificationResponse::from);
    }

    public long getUnreadCount(Long employeeId) {
        return notificationRepository.countByRecipient_EmployeeIdAndReadFalse(employeeId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long employeeId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));
        if (!notification.getRecipient().getEmployeeId().equals(employeeId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        notification.markRead();
    }

    @Transactional
    public void markAllAsRead(Long employeeId) {
        notificationRepository.findByRecipient_EmployeeIdAndReadFalse(employeeId)
                .forEach(Notification::markRead);
    }

    @Transactional
    public void notify(Long recipientId, String type, String title, String content, String linkUrl) {
        Employee recipient = employeeRepository.findById(recipientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .content(content)
                .linkUrl(linkUrl)
                .build());
    }

    @Transactional
    public void notifyAdmins(String type, String title, String content, String linkUrl) {
        employeeRepository.findAllByRoleCode(Employee.ROLE_ADMIN).forEach(admin ->
                notificationRepository.save(Notification.builder()
                        .recipient(admin)
                        .type(type)
                        .title(title)
                        .content(content)
                        .linkUrl(linkUrl)
                        .build())
        );
    }

    @Transactional
    public void notifyAllExceptSelf(Long actorId, String type, String title, String content,
                                     String employeeLinkUrl, String adminLinkUrl) {
        employeeRepository.findAll().forEach(recipient -> {
            if (recipient.getEmployeeId().equals(actorId)) {
                return;
            }
            notificationRepository.save(Notification.builder()
                    .recipient(recipient)
                    .type(type)
                    .title(title)
                    .content(content)
                    .linkUrl(recipient.isAdmin() ? adminLinkUrl : employeeLinkUrl)
                    .build());
        });
    }
}
