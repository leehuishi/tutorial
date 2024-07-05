import React, { useEffect, useContext } from "react"

  
function TasksAll(){
    return (
        <>
            <div className="board">
                <div className="column">
                    <h2>Open</h2>
                    {/* {tasks
                    .filter(task => task.category === 'todo')
                    .map(task => (
                        <Task key={task.id} task={task} moveTask={moveTask} />
                    ))} */}
                </div>

                <div className="column">
                    <h2>To-Do</h2>
                    {/* {tasks
                    .filter(task => task.category === 'inProgress')
                    .map(task => (
                        <Task key={task.id} task={task} moveTask={moveTask} />
                    ))} */}
                </div>

                <div className="column">
                    <h2>Doing</h2>
                    {/* {tasks
                    .filter(task => task.category === 'inProgress')
                    .map(task => (
                        <Task key={task.id} task={task} moveTask={moveTask} />
                    ))} */}
                </div>

                <div className="column">
                    <h2>Done</h2>
                    {/* {tasks
                    .filter(task => task.category === 'inProgress')
                    .map(task => (
                        <Task key={task.id} task={task} moveTask={moveTask} />
                    ))} */}
                </div>

                <div className="column">
                    <h2>Closed</h2>
                    {/* {tasks
                    .filter(task => task.category === 'inProgress')
                    .map(task => (
                        <Task key={task.id} task={task} moveTask={moveTask} />
                    ))} */}
                </div>
            </div>
        </>
    )
}

export default TasksAll