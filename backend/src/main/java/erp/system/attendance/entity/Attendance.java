package erp.system.attendance.entity;

import erp.system.common.entity.BaseEntity;
import erp.system.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Entity
@Table(name = "attendance")
@SQLRestriction("deleted=false")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attendance extends BaseEntity {

    public static final String STATUS_NORMAL = "NORMAL";
    public static final String STATUS_LATE = "LATE";
    public static final String STATUS_EARLY_LEAVE = "EARLY_LEAVE";
    public static final String STATUS_ABSENT = "ABSENT";
    public static final String STATUS_OVERTIME = "OVERTIME";
    public static final String STATUS_NIGHT_WORK = "NIGHT_WORK";

    private static final LocalTime STANDARD_START_TIME = LocalTime.of(9, 0);
    private static final LocalTime STANDARD_END_TIME = LocalTime.of(18, 0);
    private static final LocalTime OVERTIME_STATUS_START_TIME = LocalTime.of(19, 0);
    private static final LocalTime NIGHT_WORK_STATUS_START_TIME = LocalTime.of(21, 0);
    private static final LocalTime NIGHT_WORK_START_TIME = LocalTime.of(22, 0);
    private static final int STANDARD_WORK_MINUTES = 480;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Long attendanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "work_minutes")
    private Integer workMinutes;

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes;

    @Column(name = "night_work_minutes")
    private Integer nightWorkMinutes;

    @Column(name = "late_minutes")
    private Integer lateMinutes;

    @Column(name = "early_leave_minutes")
    private Integer earlyLeaveMinutes;

    @Column(name = "attendance_status_code", length = 30)
    private String attendanceStatusCode;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Builder
    public Attendance(Employee employee, LocalDate workDate, LocalDateTime checkInTime, int lateMinutes, String attendanceStatusCode) {
        this.employee = employee;
        this.workDate = workDate;
        this.checkInTime = checkInTime;
        this.lateMinutes = lateMinutes;
        this.attendanceStatusCode = attendanceStatusCode;
    }

    public static Attendance checkIn(Employee employee, LocalDateTime checkInTime) {
        boolean isLate = checkInTime.toLocalTime().isAfter(STANDARD_START_TIME);
        long lateSeconds = Math.max(0, Duration.between(STANDARD_START_TIME, checkInTime.toLocalTime()).getSeconds());
        int lateMinutes = (int) Math.ceil(lateSeconds / 60.0);
        String status = isLate ? STATUS_LATE : STATUS_NORMAL;

        return Attendance.builder()
                .employee(employee)
                .workDate(checkInTime.toLocalDate())
                .checkInTime(checkInTime)
                .lateMinutes(lateMinutes)
                .attendanceStatusCode(status)
                .build();
    }

    public static Attendance manualEntry(Employee employee, LocalDate workDate, LocalDateTime checkInTime,
                                          LocalDateTime checkOutTime, String attendanceStatusCode) {
        Attendance attendance = new Attendance();
        attendance.employee = employee;
        attendance.workDate = workDate;
        attendance.applyManual(checkInTime, checkOutTime, attendanceStatusCode);
        return attendance;
    }

    public void applyManual(LocalDateTime checkInTime, LocalDateTime checkOutTime, String attendanceStatusCode) {
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.attendanceStatusCode = attendanceStatusCode;

        if (checkInTime != null && checkOutTime != null) {
            this.workMinutes = (int) Math.max(0, Duration.between(checkInTime, checkOutTime).toMinutes());
            this.lateMinutes = (int) Math.max(0, Duration.between(STANDARD_START_TIME, checkInTime.toLocalTime()).toMinutes());
            this.earlyLeaveMinutes = (int) Math.max(0, Duration.between(checkOutTime.toLocalTime(), STANDARD_END_TIME).toMinutes());
            this.overtimeMinutes = Math.max(0, this.workMinutes - STANDARD_WORK_MINUTES);
            this.nightWorkMinutes = calculateNightWorkMinutes(checkOutTime);
        } else {
            this.workMinutes = null;
            this.lateMinutes = null;
            this.earlyLeaveMinutes = null;
            this.overtimeMinutes = null;
            this.nightWorkMinutes = null;
        }
    }

    public void checkOut(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
        this.workMinutes = (int) Math.max(0, Duration.between(this.checkInTime, checkOutTime).toMinutes());
        this.overtimeMinutes = Math.max(0, this.workMinutes - STANDARD_WORK_MINUTES);
        this.earlyLeaveMinutes = (int) Math.max(0, Duration.between(checkOutTime.toLocalTime(), STANDARD_END_TIME).toMinutes());
        this.nightWorkMinutes = calculateNightWorkMinutes(checkOutTime);

        boolean isNightWorkCheckout = checkOutTime.toLocalTime().isAfter(NIGHT_WORK_STATUS_START_TIME);
        boolean isOvertimeCheckout = checkOutTime.toLocalTime().isAfter(OVERTIME_STATUS_START_TIME);

        if (this.earlyLeaveMinutes > 0) {
            this.attendanceStatusCode = STATUS_EARLY_LEAVE;
        } else if (isNightWorkCheckout) {
            this.attendanceStatusCode = STATUS_NIGHT_WORK;
        } else if (isOvertimeCheckout) {
            this.attendanceStatusCode = STATUS_OVERTIME;
        } else {
            this.attendanceStatusCode = STATUS_NORMAL;
        }
    }

    public void updateReason(String reason, String attachmentUrl, String attachmentName) {
        this.reason = reason;
        this.attachmentUrl = attachmentUrl;
        this.attachmentName = attachmentName;
    }

    private int calculateNightWorkMinutes(LocalDateTime checkOutTime) {
        LocalDateTime nightWorkStart = LocalDateTime.of(checkOutTime.toLocalDate(), NIGHT_WORK_START_TIME);
        if (checkOutTime.isBefore(nightWorkStart)) {
            return 0;
        }
        return (int) Duration.between(nightWorkStart, checkOutTime).toMinutes();
    }
}
