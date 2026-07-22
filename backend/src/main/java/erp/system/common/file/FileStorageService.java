package erp.system.common.file;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("파일 업로드 디렉터리를 생성하지 못했습니다.", e);
        }
    }

    public StoredFile store(MultipartFile file) {
        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
        );
        String storedName = UUID.randomUUID() + "_" + originalName;

        try {
            Files.copy(file.getInputStream(), root.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        return new StoredFile("/uploads/" + storedName, originalName);
    }

    public record StoredFile(String url, String originalName) {
    }
}
