package com.example.timewise.dto;

public class TaskEventDTO {
    private String text; // This will be used for the task title.
    private String description;
    private String deadline; // in "YYYY-MM-DD" format

    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getDeadline() {
        return deadline;
    }
    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }
}
