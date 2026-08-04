package com.c2c.backend.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
@Entity
@Getter
@Setter
@Table(name = "incident_events")
public class IncidentEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 1000)
    private String incidentText;
    @Column(nullable = false, length = 2)
    private String region; // ISO country code
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    @Column(nullable = false)
    private Double confidenceScore;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(length = 500, unique = true)
    private String sourceUrl; // null for manually-submitted incidents; set for news-ingested ones, used for dedup
    public enum RiskLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}