package erp.system.employee.repository;

import erp.system.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee,Long>, JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByEmployeeNoOrEmail(String employeeNo, String email);

    List<Employee> findAllByRoleCode(String roleCode);

    Optional<Employee> findByKakaoId(String kakaoId);

    boolean existsByEmployeeNo(String employeeNo);

    boolean existsByEmail(String email);

    @Query(value = "SELECT MAX(CAST(SUBSTRING(employee_no, 6) AS UNSIGNED)) FROM employee WHERE employee_no LIKE CONCAT('E', :year, '%')", nativeQuery = true)
    Integer findMaxEmployeeNoSequence(@Param("year") String year);
}
