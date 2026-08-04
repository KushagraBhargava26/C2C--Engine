package com.c2c.backend.service;

import com.c2c.backend.client.PythonAnalysisClient;
import com.c2c.backend.dto.IncidentResponseDTO;
import com.c2c.backend.dto.PagedIncidentResponseDTO;
import com.c2c.backend.dto.PythonAnalysisRequest;
import com.c2c.backend.dto.PythonAnalysisResponse;
import com.c2c.backend.entity.Country;
import com.c2c.backend.entity.IncidentEvent;
import com.c2c.backend.repository.CountryRepository;
import com.c2c.backend.repository.ExposureLinkRepository;
import com.c2c.backend.repository.IncidentEventRepository;
import com.c2c.backend.repository.MarketSectorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private static final Map<String, String> COUNTRY_NAMES = Map.of(
            "IN", "India",
            "US", "United States",
            "CN", "China"
    );

    private final PythonAnalysisClient pythonClient;
    private final IncidentEventRepository incidentRepo;
    private final CountryRepository countryRepo;
    private final MarketSectorRepository sectorRepo;
    private final ExposureLinkRepository exposureRepo;

    public IncidentService(
            PythonAnalysisClient pythonClient,
            IncidentEventRepository incidentRepo,
            CountryRepository countryRepo,
            MarketSectorRepository sectorRepo,
            ExposureLinkRepository exposureRepo) {
        this.pythonClient = pythonClient;
        this.incidentRepo = incidentRepo;
        this.countryRepo = countryRepo;
        this.sectorRepo = sectorRepo;
        this.exposureRepo = exposureRepo;
    }

    public IncidentResponseDTO processNewIncident(String incidentText, String sourceRegion) {
        return processNewIncident(incidentText, sourceRegion, null);
    }

    public IncidentResponseDTO processNewIncident(String incidentText, String sourceRegion, String sourceUrl) {
        // Step 1: Call Python for sentiment/risk analysis
        PythonAnalysisRequest request = new PythonAnalysisRequest(
                incidentText, sourceRegion, Instant.now().toString());
        PythonAnalysisResponse analysis = pythonClient.analyze(request);

        // Step 2: Save the incident to DB
        IncidentEvent incident = new IncidentEvent();
        incident.setIncidentText(incidentText);
        incident.setRegion(sourceRegion);
        incident.setRiskLevel(IncidentEvent.RiskLevel.valueOf(analysis.getRiskLevel()));
        incident.setConfidenceScore(analysis.getConfidenceScore());
        incident.setCreatedAt(Instant.now());
        incident.setSourceUrl(sourceUrl);
        IncidentEvent saved = incidentRepo.save(incident);

        // Step 3: Ensure the country exists (create if not)
        countryRepo.findByIsoCode(sourceRegion)
                .orElseGet(() -> {
                    Country c = new Country();
                    c.setIsoCode(sourceRegion);
                    c.setName(COUNTRY_NAMES.getOrDefault(sourceRegion, sourceRegion));
                    return countryRepo.save(c);
                });

        return toDTO(saved);
    }

    public boolean isArticleAlreadyProcessed(String sourceUrl) {
        return incidentRepo.existsBySourceUrl(sourceUrl);
    }

    public PagedIncidentResponseDTO getIncidents(Pageable pageable) {
        Page<IncidentEvent> result = incidentRepo.findAllByOrderByCreatedAtDesc(pageable);
        List<IncidentResponseDTO> content = result.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new PagedIncidentResponseDTO(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }

    private IncidentResponseDTO toDTO(IncidentEvent incident) {
        return new IncidentResponseDTO(
                incident.getId(),
                incident.getIncidentText(),
                incident.getRegion(),
                incident.getRiskLevel().name(),
                incident.getConfidenceScore(),
                incident.getCreatedAt()
        );
    }
}