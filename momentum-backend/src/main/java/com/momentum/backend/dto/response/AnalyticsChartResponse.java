package com.momentum.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsChartResponse {
    private List<String> labels;
    private List<Dataset> datasets;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Dataset {
        private String label;
        private List<Double> data;
    }
}
