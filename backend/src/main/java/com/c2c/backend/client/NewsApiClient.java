package com.c2c.backend.client;

import com.c2c.backend.dto.NewsApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class NewsApiClient {
    private final WebClient webClient;
    private final String apiKey;

    public NewsApiClient(
            @Value("${newsapi.key:}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://newsapi.org/v2")
                .build();
    }

    public NewsApiResponse fetchArticles(String query) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/everything")
                        .queryParam("q", query)
                        .queryParam("language", "en")
                        .queryParam("sortBy", "publishedAt")
                        .queryParam("pageSize", 10)
                        .queryParam("apiKey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(NewsApiResponse.class)
                .block();
    }
}