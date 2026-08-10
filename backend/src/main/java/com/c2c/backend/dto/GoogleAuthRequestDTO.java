package com.c2c.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequestDTO {
    @NotBlank
    private String idToken;
}
