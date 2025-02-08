const API_BASE_URL = "http://localhost:8080/api/tasks"; // Adjust based on backend URL

export const fetchTasks = async () => {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        return await response.json();
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};

export const createTask = async (task) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error("Failed to create task");
        return await response.json();
    } catch (error) {
        console.error("Error creating task:", error);
        return null;
    }
};

export const updateTask = async (task) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${task.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error("Failed to update task");
        return await response.json();
    } catch (error) {
        console.error("Error updating task:", error);
        return null;
    }
};

export const deleteTask = async (taskId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete task");
    } catch (error) {
        console.error("Error deleting task:", error);
    }
};
