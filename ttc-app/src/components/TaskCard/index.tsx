import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from 'react'

type Props = {
    task: Task
}

const TaskCard = ({ task }: Props) => {
  // Check if the attachment URL already includes the full S3 path
  const getFullImageUrl = (fileURL: string) => {
    if (fileURL.startsWith('http')) {
      return fileURL;
    }
    return `https://mp-s3-images.s3.us-east-1.amazonaws.com/${fileURL}`;
  };

  return (
    <div className="mb-3 rounde bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
        { task.attachments && task.attachments.length > 0 && (
            <div>
                <strong> Attachments:</strong>
                <div className="flex flex-wrap">
                    { task.attachments && task.attachments.length > 0 &&(
                        <Image
                            src={getFullImageUrl(task.attachments[0].fileURL)}
                            alt={task.attachments[0].fileName || "Task attachment"}
                            width={400}
                            height={200}
                            className="rounded-md"
                            priority={true}
                        />
                    )}
                </div>
            </div>
        )}
        <p>
            <strong> ID:</strong> { task.id }
        </p>
        <p>
            <strong> Title:</strong> { task.title }
        </p>
        <p>
            <strong> Description:</strong> { " " }
            { task.description || "No Descrption Provided" }
        </p>
        <p>
            <strong> Status:</strong> { task.status }
        </p>
        <p>
            <strong> Priority:</strong> { task.priority }
        </p>
        <p>
            <strong> Tags:</strong> { task.tags }
        </p>
        <p>
            <strong> Start Date:</strong> { " " }
            { task.startDate ? format( new Date( task.startDate ), "P" ) : "Not set" }
        </p>
        <p>
            <strong> Due Date:</strong> { " " }
            { task.dueDate ? format( new Date( task.dueDate ), "P" ) : "Not set" }

        </p>
        <p>
            <strong> Author:</strong> { " " }
            { task.author ? task.author.username : "Unknown" }
        </p>
        <p>
            <strong> Assignee:</strong> { " " }
            { task.assignee ? task.assignee.username : "Unassigned" }

        </p>
    </div>
  );
};

export default TaskCard