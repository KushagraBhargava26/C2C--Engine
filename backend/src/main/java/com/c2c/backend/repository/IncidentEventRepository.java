package com.c2c.backend.repository;
import com.c2c.backend.entity.IncidentEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
public interface IncidentEventRepository extends JpaRepository<IncidentEvent, Long> {
    Page<IncidentEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<IncidentEvent> findByRegion(String region);
    List<IncidentEvent> findByRegionAndCreatedAtAfter(String region, java.time.Instant since);
    List<IncidentEvent> findByCreatedAtAfter(Instant since);
    boolean existsBySourceUrl(String sourceUrl);
}