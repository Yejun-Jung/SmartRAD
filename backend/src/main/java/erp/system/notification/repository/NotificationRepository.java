package erp.system.notification.repository;

import erp.system.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipient_EmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);

    long countByRecipient_EmployeeIdAndReadFalse(Long employeeId);

    List<Notification> findByRecipient_EmployeeIdAndReadFalse(Long employeeId);
}
