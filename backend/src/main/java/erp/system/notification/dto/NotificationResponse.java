package erp.system.notification.dto;

import erp.system.notification.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long notificationId,
        String type,
        String title,
        String content,
        String linkUrl,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getNotificationId(),
                notification.getType(),
                notification.getTitle(),
                notification.getContent(),
                notification.getLinkUrl(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
