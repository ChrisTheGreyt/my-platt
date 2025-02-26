"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetTasksQuery, useGetAuthUserQuery } from '@/state/api';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { setUser } from '@/state/authSlice';
import "gantt-task-react/dist/index.css";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import Header from "@/components/Header";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  // ... rest of the original Timeline component code ...
};

export default Timeline; 