import React, { useState, useEffect } from "react";
import { Task as TaskType } from "@/state/api";

type EditTaskModalProps = {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: number, updatedData: any) => void;
};

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onUpdateTask }) => {
  const [updatedData, setUpdatedData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    tags: "",
  });

  // Populate modal fields with the selected task data when the modal opens
  useEffect(() => {
    if (task) {
      setUpdatedData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
        tags: task.tags || "", // Add tags field
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (task) {
      onUpdateTask(task.id, updatedData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={updatedData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          />
        </div>

        {/* Description Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={updatedData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          ></textarea>
        </div>

        {/* Priority Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            value={updatedData.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* Due Date Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={updatedData.dueDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          />
        </div>

        {/* Tags Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={updatedData.tags}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
