package erp.system.auth.service;

import erp.system.auth.dto.KakaoLinkRequest;
import erp.system.auth.dto.KakaoLoginRequest;
import erp.system.auth.dto.KakaoLoginResponse;
import erp.system.auth.dto.LoginRequest;
import erp.system.auth.dto.LoginResponse;
import erp.system.auth.dto.ResetPasswordRequest;
import erp.system.auth.jwt.JwtTokenProvider;
import erp.system.auth.kakao.KakaoApiClient;
import erp.system.auth.kakao.KakaoUserInfo;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final KakaoApiClient kakaoApiClient;

    public LoginResponse login(LoginRequest request) {
        Employee employee = employeeRepository.findByEmployeeNoOrEmail(request.email(), request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), employee.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!employee.isLoginable()) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        }

        String accessToken = jwtTokenProvider.createToken(employee.getEmployeeId(), employee.getEmployeeNo(), employee.getRoleCode());
        return LoginResponse.of(accessToken, employee);
    }

    public KakaoLoginResponse kakaoLogin(KakaoLoginRequest request) {
        String kakaoId = resolveKakaoId(request.kakaoAccessToken());

        return employeeRepository.findByKakaoId(kakaoId)
                .filter(Employee::isLoginable)
                .map(employee -> {
                    String accessToken = jwtTokenProvider.createToken(employee.getEmployeeId(), employee.getEmployeeNo(), employee.getRoleCode());
                    return KakaoLoginResponse.linked(accessToken, employee);
                })
                .orElseGet(KakaoLoginResponse::notLinked);
    }

    @Transactional
    public KakaoLoginResponse kakaoLink(KakaoLinkRequest request) {
        String kakaoId = resolveKakaoId(request.kakaoAccessToken());

        if (employeeRepository.findByKakaoId(kakaoId).isPresent()) {
            throw new BusinessException(ErrorCode.KAKAO_ALREADY_LINKED);
        }

        Employee employee = employeeRepository.findByEmployeeNoOrEmail(request.employeeNo(), request.employeeNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));

        if (employee.getKakaoId() != null) {
            throw new BusinessException(ErrorCode.EMPLOYEE_ALREADY_LINKED);
        }
        if (!employee.isLoginable()) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        }

        employee.linkKakao(kakaoId);

        String accessToken = jwtTokenProvider.createToken(employee.getEmployeeId(), employee.getEmployeeNo(), employee.getRoleCode());
        return KakaoLoginResponse.linked(accessToken, employee);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Employee employee = employeeRepository.findByEmployeeNoOrEmail(request.employeeNo(), request.employeeNo())
                .filter(e -> request.email().equalsIgnoreCase(e.getEmail()))
                .filter(e -> request.birthDate().equals(e.getBirthDate()))
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND, "입력하신 정보와 일치하는 계정을 찾을 수 없습니다."));

        employee.changePassword(passwordEncoder.encode(request.newPassword()));
    }

    private String resolveKakaoId(String kakaoAccessToken) {
        KakaoUserInfo userInfo = kakaoApiClient.getUserInfo(kakaoAccessToken);
        return String.valueOf(userInfo.id());
    }

    public LoginResponse refreshToken(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));

        if (!employee.isLoginable()) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        }

        String accessToken = jwtTokenProvider.createToken(employee.getEmployeeId(), employee.getEmployeeNo(), employee.getRoleCode());
        return LoginResponse.of(accessToken, employee);
    }
}
