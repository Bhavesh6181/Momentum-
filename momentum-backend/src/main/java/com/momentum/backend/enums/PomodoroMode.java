package com.momentum.backend.enums;

public enum PomodoroMode {
    FOCUS_25_5("25_5"),
    FOCUS_50_10("50_10"),
    CUSTOM("CUSTOM");

    private final String value;

    PomodoroMode(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PomodoroMode fromValue(String text) {
        for (PomodoroMode m : PomodoroMode.values()) {
            if (m.value.equalsIgnoreCase(text) || m.name().equalsIgnoreCase(text)) {
                return m;
            }
        }
        throw new IllegalArgumentException("Unknown Pomodoro mode: " + text);
    }
}
