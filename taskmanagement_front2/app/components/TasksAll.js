import React, { useEffect, useContext, useState } from "react"
import TaskCardOpen from "./TaskCardOpen";
import TaskCardTodo from "./TaskCardTodo";
import TaskCardDoing from "./TaskCardDoing";
import TaskCardDone from "./TaskCardDone";
import TaskCardClosed from "./TaskCardClosed";
  
function TasksAll({ tasks, appdetails, onTaskEdit }){
    const [tasklist, setTaskList] = useState([]);

    useEffect(() => {
            setTaskList(tasks);
    }, [tasks])


    return (
        <>
            <div className="board">
                <div className="column">
                    <h2>Open</h2>
                    {
                        tasklist
                        .filter((task) => task.task_state === 'open')
                        .map((task) => (
                            <TaskCardOpen key={task.task_id} task={task} permit_group={appdetails.app_permit_open} appid={appdetails.app_acronym} onTaskEdit={onTaskEdit} />
                        ))
                    }
                </div>

                <div className="column">
                    <h2>To-Do</h2>
                    {
                        tasklist
                        .filter((task) => task.task_state === 'todo')
                        .map((task) => (
                            <TaskCardTodo key={task.task_id} task={task} permit_group={appdetails.app_permit_todolist} appid={appdetails.app_acronym} onTaskEdit={onTaskEdit} />
                        ))
                    }
                </div>

                <div className="column">
                    <h2>Doing</h2>
                    {
                        tasklist
                        .filter((task) => task.task_state === 'doing')
                        .map((task) => (
                            <TaskCardDoing key={task.task_id} task={task} permit_group={appdetails.app_permit_doing} appid={appdetails.app_acronym} onTaskEdit={onTaskEdit} />
                        ))
                    }
                </div>

                <div className="column">
                    <h2>Done</h2>
                    {
                        tasklist
                        .filter((task) => task.task_state === 'done')
                        .map((task) => (
                            <TaskCardDone key={task.task_id} task={task} permit_group={appdetails.app_permit_done} appid={appdetails.app_acronym} onTaskEdit={onTaskEdit} />
                        ))
                    }
                </div>

                <div className="column">
                    <h2>Closed</h2>
                    {
                        tasklist
                        .filter((task) => task.task_state === 'closed')
                        .map((task) => (
                            <TaskCardClosed key={task.task_id} task={task} />
                        ))
                    }
                </div>
            </div>
        </>
    )
}

export default TasksAll