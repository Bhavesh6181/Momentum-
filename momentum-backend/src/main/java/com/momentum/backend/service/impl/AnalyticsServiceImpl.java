package com.momentum.backend.service.impl;

import com.momentum.backend.dto.response.AnalyticsChartResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.repository.StudySessionRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.AnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public AnalyticsServiceImpl(
            StudySessionRepository studySessionRepository,
            UserRepository userRepository,
            Clock clock
    ) {
        this.studySessionRepository = studySessionRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsChartResponse getWeeklyHours(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now(clock);
        LocalDate sinceDate = today.minusDays(6);
        OffsetDateTime since = sinceDate.atStartOfDay(clock.getZone()).toOffsetDateTime();

        List<Object[]> results = studySessionRepository.findWeeklyHoursGroupedByDate(user.getId(), since);
        Map<String, Double> dataMap = new HashMap<>();
        for (Object[] row : results) {
            String dateStr = row[0].toString();
            double hours = ((Number) row[1]).doubleValue();
            dataMap.put(dateStr, hours);
        }

        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 0; i < 7; i++) {
            LocalDate d = sinceDate.plusDays(i);
            String dateStr = d.format(formatter);
            labels.add(dateStr);
            data.add(dataMap.getOrDefault(dateStr, 0.0));
        }

        return AnalyticsChartResponse.builder()
                .labels(labels)
                .datasets(List.of(
                        AnalyticsChartResponse.Dataset.builder()
                                .label("Study Hours")
                                .data(data)
                                .build()
                ))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsChartResponse getMonthlyProgress(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now(clock);
        LocalDate firstDay = today.withDayOfMonth(1);
        OffsetDateTime since = firstDay.atStartOfDay(clock.getZone()).toOffsetDateTime();

        List<Object[]> results = studySessionRepository.findWeeklyHoursGroupedByDate(user.getId(), since);
        Map<String, Double> dataMap = new HashMap<>();
        for (Object[] row : results) {
            String dateStr = row[0].toString();
            double hours = ((Number) row[1]).doubleValue();
            dataMap.put(dateStr, hours);
        }

        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        int lengthOfMonth = today.lengthOfMonth();
        for (int i = 0; i < lengthOfMonth; i++) {
            LocalDate d = firstDay.plusDays(i);
            String dateStr = d.format(formatter);
            labels.add(dateStr);
            data.add(dataMap.getOrDefault(dateStr, 0.0));
        }

        return AnalyticsChartResponse.builder()
                .labels(labels)
                .datasets(List.of(
                        AnalyticsChartResponse.Dataset.builder()
                                .label("Monthly Study Progress")
                                .data(data)
                                .build()
                ))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsChartResponse getCategoryDistribution(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Object[]> results = studySessionRepository.findHoursGroupedBySubject(user.getId());
        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();

        for (Object[] row : results) {
            labels.add(row[0].toString());
            data.add(((Number) row[1]).doubleValue());
        }

        return AnalyticsChartResponse.builder()
                .labels(labels)
                .datasets(List.of(
                        AnalyticsChartResponse.Dataset.builder()
                                .label("Hours by Subject")
                                .data(data)
                                .build()
                ))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsChartResponse getMostActiveMember(UUID groupId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate sinceDate = today.minusDays(6);
        OffsetDateTime since = sinceDate.atStartOfDay(clock.getZone()).toOffsetDateTime();

        List<Object[]> results = studySessionRepository.findMostActiveGroupMember(groupId, since);
        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();

        if (!results.isEmpty()) {
            Object[] top = results.get(0);
            labels.add(top[1].toString()); // Username
            data.add(((Number) top[2]).doubleValue()); // Study Hours
        }

        return AnalyticsChartResponse.builder()
                .labels(labels)
                .datasets(List.of(
                        AnalyticsChartResponse.Dataset.builder()
                                .label("Most Active Member Hours")
                                .data(data)
                                .build()
                ))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsChartResponse getProductiveHours(UUID groupId) {
        List<Object[]> results = studySessionRepository.findProductiveHours(groupId);
        Map<Integer, Double> dataMap = new HashMap<>();
        for (Object[] row : results) {
            int hour = ((Number) row[0]).intValue();
            double count = ((Number) row[1]).doubleValue();
            dataMap.put(hour, count);
        }

        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();

        for (int h = 0; h < 24; h++) {
            labels.add(String.format("%02d:00", h));
            data.add(dataMap.getOrDefault(h, 0.0));
        }

        return AnalyticsChartResponse.builder()
                .labels(labels)
                .datasets(List.of(
                        AnalyticsChartResponse.Dataset.builder()
                                .label("Productive Hours Session Count")
                                .data(data)
                                .build()
                ))
                .build();
    }
}
