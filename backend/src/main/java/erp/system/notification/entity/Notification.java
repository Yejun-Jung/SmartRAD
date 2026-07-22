package erp.system.notification.entity;

import erp.system.common.entity.CreatedAtEntity;
import erp.system.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "notification")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends CreatedAtEntity {

    public static final String TYPE_LEAVE_REQUESTED = "LEAVE_REQUESTED";
    public static final String TYPE_LEAVE_APPROVED = "LEAVE_APPROVED";
    public static final String TYPE_LEAVE_REJECTED = "LEAVE_REJECTED";
    public static final String TYPE_ATTENDANCE_CORRECTION = "ATTENDANCE_CORRECTION";
    public static final String TYPE_NOTICE_CREATED = "NOTICE_CREATED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Employee recipient;

    @Column(name = "type", nullable = false, length = 30)
    private String type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, length = 500)
    private String content;

    @Column(name = "link_url", length = 200)
    private String linkUrl;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Builder
    public Notification(Employee recipient, String type, String title, String content, String linkUrl) {
        this.recipient = recipient;
        this.type = type;
        this.title = title;
        this.content = content;
        this.linkUrl = linkUrl;
        this.read = false;
    }

    public void markRead() {
        this.read = true;
    }
}
