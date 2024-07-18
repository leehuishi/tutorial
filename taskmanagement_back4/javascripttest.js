const createTask = async () => {
    const response = await fetch('http://localhost:3502/CreateTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": "test_user",
            "password": "pa55word!",
            "Task_app_Acronym": "test_app",
            "Task_Name": "I Love Zoo",
            "Task_description": "Zoo is a wonderful place",
            "Task_plan": "sprint_1"
        })
    });

    const data = await response.json();
    console.log(data);
};

const getTasksByState = async () => {
    const response = await fetch('http://localhost:3502/GetTaskByState', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": "test_user",
            "password": "pa55word!",
            "Task_state": "doing"
        })
    });

    const data = await response.json();
    console.log(data);
};


const promoteTaskToDone = async () => {
    const task_id = 'APP_1'; // Replace with the actual task ID
    const response = await fetch(`http://localhost:3502/PromoteTask2Done`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": "test_user",
            "password": "pa55word!",
            "Task_id": "test_app_56"
        })
    });

    const data = await response.json();
    console.log(data);
};



createTask();
// getTasksByState();
// promoteTaskToDone();
