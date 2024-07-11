import React, { useEffect, useContext } from "react"
import { useNavigate,useParams } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import axios from "axios"
import Axiosinstance from "../../AxiosInstance"
import { CSSTransition } from "react-transition-group";
import Modal from 'react-modal';

function InCreateTask({ isOpen2, closeModal2, appid2, app_permit_create2, onTaskAdd }){
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate();

    const initialState = {
        taskname: {
            value: "",
            hasErrors: false,
            message: "",
        },
        taskdesc: {
            value: "",
            hasErrors: false,
            message: ""
        },
        taskplan: {
            option: [],
            value: ""
        },
        submitCount: 0
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "tasknameImmediately":
                draft.taskname.hasErrors = false
                draft.taskname.value = action.value
                return
            case "tasknameAfterDelay":
                if(draft.taskname.value.length < 1){
                    draft.taskname.hasErrors = true
                    draft.taskname.message = "Task name is required"
                }
                return
            case "taskdescImmediately":
                draft.taskdesc.hasErrors = false
                draft.taskdesc.value = action.value
                return
            case "taskplanImmediately":
                draft.taskplan.value = action.value
                return
            case "submitForm":
                if(!draft.taskname.hasErrors && !draft.taskdesc.hasErrors){
                    draft.submitCount++
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "Invalid inputs"})
                }
                return
            case "resetValue":
                draft.taskname.value="";
                draft.taskdesc.value="";
                draft.taskplan.value="";
                return
            case "setPlanList":
                draft.taskplan.option = action.value
                return
            default:
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)

    //=============================================================================
    //=============================================================================

    //=============================================================================
    //check if user is in create grp
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            if(isOpen2){
                try{
                    const url2 = "/user/checkinggrp/" + app_permit_create2
                    const response = await Axiosinstance.get(url2)

                    if(response.data.success){
                        const data = response.data.data
                        if(!data.isInGrp){
                            appDispatch({ type: "flashMessageError", value: "Update in access rights."})
                            navigate('/home');
                        }
                    }
                }
                catch(e){
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }
            }
        }
        fetchData()
    }, [isOpen2])
    //=============================================================================
    //=============================================================================


    //=============================================================================
    //delay check
    //=============================================================================
    //delay check for appname (to make sure user finish typing)
    useEffect(() => {
        if(state.taskname.value){
            const delay = setTimeout(() => dispatch({type: "tasknameAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.taskname.value])
    
    //=============================================================================
    //=============================================================================


    //=============================================================================
    //for modal
    //=============================================================================
    const customStyles = {
        content: {
            top: '40%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width: '80%',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh', // Adjust as needed
            overflowY: 'auto'
        },
    };

    //=============================================================================
    //=============================================================================

    //=============================================================================
    //get plan list when modal is open
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            if(isOpen2){
                try{
                    const url5 = "/plan/all/" + appid2
                    const response = await Axiosinstance.get(url5)
                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "setPlanList", value: data})
                    }
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "Update in access rights."})
                        navigate('/home');
                    }
                    else{
                        appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                    }
                }
            }
        }
        fetchData()
    }, [isOpen2])
    //=============================================================================
    //=============================================================================


    //=============================================================================
    //submit create task
    //=============================================================================
    useEffect(() => {
        if(state.submitCount){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function fetchResults(){
                try{
                    const bodydata = {
                        "task_name": state.taskname.value,
                        "task_desc": state.taskdesc.value,
                        "task_plan": state.taskplan.value,
                        "task_app_acronym": appid2
                    }
                    

                    //submit request 
                    const response = await Axiosinstance.post('/task/new/', bodydata) //create plan
                    console.log("Task was successfully created.")

                    appDispatch({ type: "flashMessage", value: "Task created successfully"})

                    const new_task = response.data.data;

                    onTaskAdd(new_task);

                    dispatch({type: "resetValue"})
                    closeModal2();
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "Update in access rights."})
                        navigate('/home');
                    }
                    else{
                        console.log("There was a problem or the request was cancelled")
                        appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                    }
                }

            }
            fetchResults()
            return () => ourRequest.cancel()
        }
    }, [state.submitCount])
    
   
    //=============================================================================
    //=============================================================================




    //=============================================================================
    async function handleSubmit(e){
        e.preventDefault()
        dispatch({type: "tasknameImmediately", value: state.taskname.value})
        dispatch({type: "taskdescImmediately", value: state.taskdesc.value})
        dispatch({type: "taskplanImmediately", value: state.taskplan.value})

        dispatch({type: "submitForm"})
    }

    //=============================================================================

    return (
        <Modal isOpen={isOpen2} onRequestClose={closeModal2} style={customStyles} contentLabel="Create Task Modal" ariaHideApp={false}>   
            <div style={{ textAlign: 'right' }}>
                <button className="btn btn-secondary" onClick={closeModal2}>x</button>
            </div>
            
            <h1 style={{ textAlign: 'center', paddingBottom: '20px'}}>Create Task</h1>
            <hr />

            <div className="table-container">
                <table width="100%">
                    <tbody>
                        <tr>
                            <td width="30%" style={{ borderRight: "1px solid" }}>
                                <form onSubmit={handleSubmit} style={{marginRight: "10px"}}>
                                    
                                    <div className="form-group row" style={{marginRight:"10px"}}>
                                        <label htmlFor="taskid_create" className="col-sm-3 col-form-label">ID:</label>

                                        <div className="col-sm-7">
                                            <input id="taskid_create" name="taskid" className="form-control" type="text" autoComplete="off" placeholder="AUTO GENERATED" readOnly />
                                        </div>
                                    </div>


                                    <div className="form-group row" style={{marginRight:"10px"}}>
                                        <label htmlFor="taskowner_create" className="col-sm-3 col-form-label">Owner:</label>

                                        <div className="col-sm-7">
                                            <input id="taskowner_create" name="taskowner" className="form-control" type="text" autoComplete="off" placeholder="AUTO GENERATED" readOnly />
                                        </div>
                                    </div>

                                    <div className="form-group row" style={{marginRight:"10px"}}>
                                        <label htmlFor="taskname_create" className="col-sm-3 col-form-label">Name:</label>

                                        <div className="col-sm-7">
                                            <textarea onChange={e => dispatch({type: "tasknameImmediately", value: e.target.value})} value={state.taskname.value} id="taskname_create" name="taskname" className="form-control" autoComplete="off" rows="2">Enter task name.</textarea>
                                            <CSSTransition style={{marginTop: "10px"}} in={state.taskname.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                                <div className="alert alert-danger small">{state.taskname.message}</div>
                                            </CSSTransition>
                                        </div>
                                    </div>

                                    <div className="form-group row" style={{marginRight:"10px"}}>
                                        <label htmlFor="taskdesc_create" className="col-sm-3 col-form-label">Description:</label>

                                        <div className="col-sm-7">
                                            <textarea onChange={e => dispatch({type: "taskdescImmediately", value: e.target.value})} value={state.taskdesc.value} id="taskdesc_create" name="taskdesc" className="form-control" autoComplete="off" rows="2">Enter task description.</textarea>
                                            
                                        </div>
                                    </div>

                                    <div className="form-group row" style={{marginRight:"10px"}}>
                                        <label htmlFor="taskdesc_create" className="col-sm-3 col-form-label">Plan:</label>

                                        <div className="col-sm-7">
                                        {state.taskplan.option.length > 0 ? 
                                                (
                                                    <select id="taskplan_create" value={state.taskplan.value} onChange={e => dispatch({type: "taskplanImmediately", value: e.target.value})} className="form-control" name="taskplan">
                                                        <option value="">Select...</option>
                                                        {state.taskplan.option.map((option, index) => (<option key={option.planname} value={option.planname}>{option.planname}</option>))}
                                                    </select>
                                                ) 
                                                : 
                                                (
                                                    <p className="form-control">No options available.</p>
                                                ) 
                                            }
                                        </div>
                                    </div>


                                    <div className="form-group row">
                                        <div className="col-sm-10 offset-sm-2 text-right">
                                            <button type="submit" className="btn btn-success">Submit</button>
                                        </div>
                                    </div>

                                </form>
                            </td>

                            <td width="50%">

                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Modal>
    )
}

export default InCreateTask