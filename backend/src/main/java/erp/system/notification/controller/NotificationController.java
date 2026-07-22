package erp.system.notification.controller;

import erp.system.notification.dto.NotificationResponse;
import erp.system.notification.dto.NotificationUnreadCountResponse;
import erp.system.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public Page<NotificationResponse> getMyNotifications(@AuthenticationPrincipal Long employeeId, Pageable pageable) {
        return notificationService.getMyNotifications(employeeId, pageable);
    }

    @GetMapping("/me/unread-count")
    public NotificationUnreadCountResponse getUnreadCount(@AuthenticationPrincipal Long employeeId) {
        return new NotificationUnreadCountResponse(notificationService.getUnreadCount(employeeId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal Long employeeId) {
        notificationService.markAsRead(id, employeeId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal Long employeeId) {
        notificationService.markAllAsRead(employeeId);
        return ResponseEntity.noContent().build();
    }
}
