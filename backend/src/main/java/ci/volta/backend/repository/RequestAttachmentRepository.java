package ci.volta.backend.repository;

import ci.volta.backend.model.RequestAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestAttachmentRepository extends JpaRepository<RequestAttachment, String> {

    List<RequestAttachment> findByRequestId(String requestId);
}
