package com.c2c.backend.service;

import com.c2c.backend.client.NewsApiClient;
import com.c2c.backend.dto.NewsApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NewsIngestionService {

    private static final Logger logger = LoggerFactory.getLogger(NewsIngestionService.class);

    // Region -> NewsAPI query. Extend this map as you track more countries.
    private static final Map<String, String> REGION_QUERIES = Map.of(
            "US", "\"United States\" AND (sanctions OR tariffs OR conflict)",
            "CN", "China AND (sanctions OR tariffs OR trade OR conflict)",
            "IN", "India AND (sanctions OR conflict OR trade)"
    );

    private final NewsApiClient newsApiClient;
    private final IncidentService incidentService;

    public NewsIngestionService(NewsApiClient newsApiClient, IncidentService incidentService) {
        this.newsApiClient = newsApiClient;
        this.incidentService = incidentService;
    }

    @Scheduled(fixedRate = 1800000) // every 30 minutes
    public void ingestNews() {
        logger.info("Starting scheduled news ingestion...");
        int totalIngested = 0;

        for (Map.Entry<String, String> entry : REGION_QUERIES.entrySet()) {
            String region = entry.getKey();
            String query = entry.getValue();

            try {
                NewsApiResponse response = newsApiClient.fetchArticles(query);
                if (response == null || response.getArticles() == null) {
                    logger.warn("No response/articles for region {}", region);
                    continue;
                }

                for (NewsApiResponse.Article article : response.getArticles()) {
                    if (article.getUrl() == null) continue;
                    if (incidentService.isArticleAlreadyProcessed(article.getUrl())) continue;

                    String text = buildIncidentText(article);
                    if (text.isBlank()) continue;

                    try {
                        incidentService.processNewIncident(text, region, article.getUrl());
                        totalIngested++;
                    } catch (Exception e) {
                        logger.error("Failed to process article for region {}: {}", region, article.getUrl(), e);
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to fetch news for region {}", region, e);
            }
        }

        logger.info("News ingestion complete. {} new incidents created.", totalIngested);
    }

    private String buildIncidentText(NewsApiResponse.Article article) {
        String title = article.getTitle() != null ? article.getTitle() : "";
        String description = article.getDescription() != null ? article.getDescription() : "";
        String combined = (title + ". " + description).trim();
        // IncidentEvent.incidentText is capped at 1000 chars
        return combined.length() > 1000 ? combined.substring(0, 1000) : combined;
    }
}