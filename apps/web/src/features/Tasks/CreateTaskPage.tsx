import { useState, type FormEvent } from "react";
import {
  isTaskPriority,
  TaskPriority,
  UserRole,
  type CreateTaskRequestDto,
  type Task,
  type TaskAssigneeDto,
} from "@familytodo/shared-types";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { QueryStateWrapper } from "../../components/QueryStateWrapper";
import { ApiRequestError } from "../../lib/apiClient";
import { AppRoute } from "../../routes/AppRoute";
import { useCreateTask, useTaskAssignees } from "./useTasks";
import styles from "./CreateTaskPage.module.css";

type TaskField =
  | "title"
  | "assigneeId"
  | "priority"
  | "rewardPoints"
  | "estimateMinutes"
  | "dueDate"
  | "dueTime"
  | "reminderDate"
  | "reminderTime";

type TaskFieldErrors = Partial<Record<TaskField, string>>;

const taskFieldOrder: TaskField[] = [
  "title",
  "assigneeId",
  "priority",
  "rewardPoints",
  "estimateMinutes",
  "dueDate",
  "dueTime",
  "reminderDate",
  "reminderTime",
];

const taskFieldIds: Record<TaskField, string> = {
  title: "task-title",
  assigneeId: "task-assignee",
  priority: "task-priority-low",
  rewardPoints: "task-reward-points",
  estimateMinutes: "task-estimate",
  dueDate: "task-due-date",
  dueTime: "task-due-time",
  reminderDate: "task-reminder-date",
  reminderTime: "task-reminder-time",
};

const priorityOptions = [
  { value: TaskPriority.Low, label: "Low" },
  { value: TaskPriority.Normal, label: "Normal" },
  { value: TaskPriority.High, label: "High" },
];

function getString(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function getLocalDateTime(
  formData: FormData,
  dateField: "dueDate" | "reminderDate",
  timeField: "dueTime" | "reminderTime",
  errors: TaskFieldErrors,
): string | undefined {
  const dateValue = getString(formData, dateField);
  const timeValue = getString(formData, timeField);
  if (!dateValue && !timeValue) {
    return undefined;
  }

  if (!dateValue) {
    errors[dateField] = "Choose a date.";
  }
  if (!timeValue) {
    errors[timeField] = "Choose a time.";
  }
  if (!dateValue || !timeValue) {
    return undefined;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const date = new Date(`${dateValue}T${timeValue}`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    errors[timeField] = "Choose a valid time for the selected date.";
    return undefined;
  }

  return date.toISOString();
}

function getSubmissionError(error: Error): string {
  if (!(error instanceof ApiRequestError)) {
    return "Unable to connect. Please try again.";
  }

  if (error.code === "INVALID_TASK_ASSIGNEE") {
    return "That assignee is no longer available. Choose another person.";
  }
  if (error.code === "INVALID_TASK_REQUEST") {
    return "Some task details are invalid. Review the form and try again.";
  }

  return error.message;
}

export function CreateTaskPage() {
  const assigneesQuery = useTaskAssignees();

  return (
    <QueryStateWrapper
      loadingMessage="Loading eligible assignees"
      query={assigneesQuery}
    >
      {(assignees) => <CreateTaskForm assignees={assignees} />}
    </QueryStateWrapper>
  );
}

function CreateTaskForm({ assignees }: { assignees: TaskAssigneeDto[] }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const createMutation = useCreateTask();
  const [fieldErrors, setFieldErrors] = useState<TaskFieldErrors>({});
  const [createdTask, setCreatedTask] = useState<Task | null>(null);

  function clearFieldError(field: TaskField) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    createMutation.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = getString(formData, "title").trim();
    const assigneeId = getString(formData, "assigneeId");
    const priorityValue = getString(formData, "priority");
    const rewardPointsValue = getString(formData, "rewardPoints");
    const estimateValue = getString(formData, "estimateMinutes");
    const errors: TaskFieldErrors = {};

    if (!title) {
      errors.title = "Enter a task title.";
    } else if (title.length > 120) {
      errors.title = "Task titles can be up to 120 characters.";
    }

    if (!assignees.some((assignee) => assignee.id === assigneeId)) {
      errors.assigneeId = "Choose an eligible assignee.";
    }

    const priority = isTaskPriority(priorityValue) ? priorityValue : undefined;
    if (!priority) {
      errors.priority = "Choose a task priority.";
    }

    const rewardPoints = Number(rewardPointsValue);
    if (
      !rewardPointsValue ||
      !Number.isInteger(rewardPoints) ||
      rewardPoints < 0
    ) {
      errors.rewardPoints = "Enter a whole number, zero or higher.";
    }

    const estimateMinutes =
      estimateValue === "" ? undefined : Number(estimateValue);
    if (
      estimateMinutes !== undefined &&
      (!Number.isInteger(estimateMinutes) || estimateMinutes <= 0)
    ) {
      errors.estimateMinutes = "Enter a positive number of whole minutes.";
    }

    const dueAt = getLocalDateTime(formData, "dueDate", "dueTime", errors);
    const reminderAt = getLocalDateTime(
      formData,
      "reminderDate",
      "reminderTime",
      errors,
    );

    if (Object.keys(errors).length > 0 || !priority) {
      setFieldErrors(errors);
      createMutation.reset();
      const firstInvalidField = taskFieldOrder.find((field) => errors[field]);
      if (firstInvalidField) {
        document.getElementById(taskFieldIds[firstInvalidField])?.focus();
      }
      return;
    }

    setFieldErrors({});
    const description = getString(formData, "description").trim();
    const request: CreateTaskRequestDto = {
      title,
      assigneeId,
      priority,
      rewardPoints,
      requiresApproval: formData.get("requiresApproval") === "on",
      ...(description ? { description } : {}),
      ...(estimateMinutes !== undefined ? { estimateMinutes } : {}),
      ...(dueAt ? { dueAt } : {}),
      ...(reminderAt ? { reminderAt } : {}),
    };

    createMutation.mutate(request, {
      onSuccess: setCreatedTask,
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === 401) {
          setUser(null);
          navigate(AppRoute.Login, { replace: true });
        } else if (error instanceof ApiRequestError && error.status >= 500) {
          navigate(AppRoute.Error, { replace: true });
        }
      },
    });
  }

  const isPending = createMutation.isPending;
  const serverError = createMutation.error
    ? getSubmissionError(createMutation.error)
    : null;

  if (createdTask) {
    return (
      <div className={styles.page}>
        <section className={styles.successCard} role="status">
          <h1 className={styles.pageTitle}>Task created</h1>
          <p className={styles.successMessage}>
            <strong>{createdTask.title}</strong> is assigned to{" "}
            {createdTask.assignee.displayName}.
          </p>
          <div className={styles.actions}>
            <button
              className={styles.secondaryButton}
              onClick={() => {
                createMutation.reset();
                setFieldErrors({});
                setCreatedTask(null);
              }}
              type="button"
            >
              Create another
            </button>
            <Link className={styles.primaryButton} to={AppRoute.Tasks}>
              Back to Tasks
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} to={AppRoute.Tasks}>
        Back to Tasks
      </Link>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Create task</h1>
        <p className={styles.intro}>
          Add a task and choose who will take care of it.
        </p>
      </header>

      <form
        aria-busy={isPending}
        className={styles.form}
        noValidate
        onSubmit={handleSubmit}
      >
        <section className={styles.section} aria-labelledby="task-details-title">
          <h2 className={styles.sectionTitle} id="task-details-title">
            Task details
          </h2>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="task-title">
                Title <span aria-hidden="true">*</span>
              </label>
              <input
                aria-describedby={
                  fieldErrors.title ? "task-title-error" : "task-title-hint"
                }
                aria-invalid={Boolean(fieldErrors.title)}
                autoComplete="off"
                id="task-title"
                maxLength={120}
                name="title"
                disabled={isPending}
                onChange={() => clearFieldError("title")}
                required
                type="text"
              />
              <p className={styles.hint} id="task-title-hint">
                Use a short, clear name (up to 120 characters).
              </p>
              {fieldErrors.title && (
                <p
                  className={styles.fieldError}
                  id="task-title-error"
                  role="alert"
                >
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                name="description"
                disabled={isPending}
                placeholder="Add helpful details (optional)"
                rows={4}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="task-assignee">
                Assign to <span aria-hidden="true">*</span>
              </label>
              <select
                aria-describedby={
                  fieldErrors.assigneeId ? "task-assignee-error" : undefined
                }
                aria-invalid={Boolean(fieldErrors.assigneeId)}
                defaultValue=""
                id="task-assignee"
                name="assigneeId"
                disabled={isPending}
                onChange={() => clearFieldError("assigneeId")}
                required
              >
                <option disabled value="">
                  Choose an assignee
                </option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.displayName} (
                    {assignee.role === UserRole.Parent ? "Parent" : "Child"})
                  </option>
                ))}
              </select>
              {fieldErrors.assigneeId && (
                <p
                  className={styles.fieldError}
                  id="task-assignee-error"
                  role="alert"
                >
                  {fieldErrors.assigneeId}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="task-settings-title">
          <h2 className={styles.sectionTitle} id="task-settings-title">
            Task settings
          </h2>

          <fieldset
            aria-describedby={
              fieldErrors.priority ? "task-priority-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.priority)}
            className={styles.priorityFieldset}
            disabled={isPending}
          >
            <legend>Priority</legend>
            <div className={styles.priorityOptions}>
              {priorityOptions.map(({ value, label }) => (
                <label className={styles.priorityOption} key={value}>
                  <input
                    defaultChecked={value === TaskPriority.Normal}
                    id={`task-priority-${value.toLowerCase()}`}
                    name="priority"
                    onChange={() => clearFieldError("priority")}
                    required
                    type="radio"
                    value={value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.priority && (
              <p
                className={styles.fieldError}
                id="task-priority-error"
                role="alert"
              >
                {fieldErrors.priority}
              </p>
            )}
          </fieldset>

          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="task-reward-points">Reward points</label>
              <input
                aria-describedby={
                  fieldErrors.rewardPoints ? "task-reward-error" : undefined
                }
                aria-invalid={Boolean(fieldErrors.rewardPoints)}
                defaultValue={0}
                id="task-reward-points"
                min={0}
                name="rewardPoints"
                disabled={isPending}
                onChange={() => clearFieldError("rewardPoints")}
                required
                step={1}
                type="number"
              />
              {fieldErrors.rewardPoints && (
                <p
                  className={styles.fieldError}
                  id="task-reward-error"
                  role="alert"
                >
                  {fieldErrors.rewardPoints}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="task-estimate">Estimate (minutes)</label>
              <input
                aria-describedby={
                  fieldErrors.estimateMinutes
                    ? "task-estimate-error"
                    : "task-estimate-hint"
                }
                aria-invalid={Boolean(fieldErrors.estimateMinutes)}
                id="task-estimate"
                min={1}
                name="estimateMinutes"
                disabled={isPending}
                onChange={() => clearFieldError("estimateMinutes")}
                placeholder="Optional"
                step={1}
                type="number"
              />
              <p className={styles.hint} id="task-estimate-hint">
                Enter a whole number of minutes.
              </p>
              {fieldErrors.estimateMinutes && (
                <p
                  className={styles.fieldError}
                  id="task-estimate-error"
                  role="alert"
                >
                  {fieldErrors.estimateMinutes}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="task-schedule-title">
          <h2 className={styles.sectionTitle} id="task-schedule-title">
            Schedule
          </h2>
          <p className={styles.hint}>
            Times use your device&apos;s local time in 24-hour format.
          </p>
          <div className={styles.twoColumns}>
            <div className={styles.scheduleGroup}>
              <h3 className={styles.scheduleTitle}>Due</h3>
              <div className={styles.dateTimeFields}>
                <div className={styles.field}>
                  <label htmlFor="task-due-date">Due date</label>
                  <input
                    aria-describedby={
                      fieldErrors.dueDate ? "task-due-date-error" : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.dueDate)}
                    disabled={isPending}
                    id="task-due-date"
                    name="dueDate"
                    onChange={() => clearFieldError("dueDate")}
                    type="date"
                  />
                  {fieldErrors.dueDate && (
                    <p
                      className={styles.fieldError}
                      id="task-due-date-error"
                      role="alert"
                    >
                      {fieldErrors.dueDate}
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="task-due-time">Due time</label>
                  <input
                    aria-describedby={
                      fieldErrors.dueTime ? "task-due-time-error" : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.dueTime)}
                    disabled={isPending}
                    id="task-due-time"
                    lang="en-GB"
                    name="dueTime"
                    onChange={() => clearFieldError("dueTime")}
                    type="time"
                  />
                  {fieldErrors.dueTime && (
                    <p
                      className={styles.fieldError}
                      id="task-due-time-error"
                      role="alert"
                    >
                      {fieldErrors.dueTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.scheduleGroup}>
              <h3 className={styles.scheduleTitle}>Reminder</h3>
              <div className={styles.dateTimeFields}>
                <div className={styles.field}>
                  <label htmlFor="task-reminder-date">Reminder date</label>
                  <input
                    aria-describedby={
                      fieldErrors.reminderDate
                        ? "task-reminder-date-error"
                        : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.reminderDate)}
                    disabled={isPending}
                    id="task-reminder-date"
                    name="reminderDate"
                    onChange={() => clearFieldError("reminderDate")}
                    type="date"
                  />
                  {fieldErrors.reminderDate && (
                    <p
                      className={styles.fieldError}
                      id="task-reminder-date-error"
                      role="alert"
                    >
                      {fieldErrors.reminderDate}
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="task-reminder-time">Reminder time</label>
                  <input
                    aria-describedby={
                      fieldErrors.reminderTime
                        ? "task-reminder-time-error"
                        : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.reminderTime)}
                    disabled={isPending}
                    id="task-reminder-time"
                    lang="en-GB"
                    name="reminderTime"
                    onChange={() => clearFieldError("reminderTime")}
                    type="time"
                  />
                  {fieldErrors.reminderTime && (
                    <p
                      className={styles.fieldError}
                      id="task-reminder-time-error"
                      role="alert"
                    >
                      {fieldErrors.reminderTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="task-approval-title">
          <h2 className={styles.sectionTitle} id="task-approval-title">
            Approval
          </h2>
          <label className={styles.checkboxOption}>
            <input
              disabled={isPending}
              name="requiresApproval"
              type="checkbox"
            />
            <span>Requires approval when completed</span>
          </label>
        </section>

        {serverError && (
          <p className={styles.formError} role="alert">
            {serverError}
          </p>
        )}

        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Creating task..." : "Create task"}
          </button>
          <Link className={styles.cancelLink} to={AppRoute.Tasks}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
