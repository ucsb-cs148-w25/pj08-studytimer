package com.example.timewise.dto;

import java.util.Map;

public class EventDTO {
    private String summary;
    private String description;
    private Map<String, String> start;
    private Map<String, String> end;

    // Getters and Setters

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Map<String, String> getStart() {
        return start;
    }

    public void setStart(Map<String, String> start) {
        this.start = start;
    }

    public Map<String, String> getEnd() {
        return end;
    }

    public void setEnd(Map<String, String> end) {
        this.end = end;
    }
}