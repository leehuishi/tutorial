import React, { useRef, useEffect, useContext } from 'react';
import { useImmerReducer } from 'use-immer'
import axios from "axios"
import Axiosinstance from "../../AxiosInstance"
import DispatchContext from "../DispatchContext"
import Modal from 'react-modal';
import { useNavigate, Link } from "react-router-dom"
import NotesArea from './NotesArea';
import NotesArea2 from './NotesArea2';

const TaskCardTodo = ({ task, permit_group, appid, onTaskEdit }) => {
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate()

    const truncateLongtext = (rawtext, maxLength) => {
        if (rawtext.length > maxLength) {
            return rawtext.substring(0, maxLength) + '...'; // Adjust the maxLength as needed
        }
        return rawtext;
    };


    const initialState = {
        modalIsOpen: false,
        isin_grp: false,
        tasknotes: "",
        submitCount2: 0,
        displaytaskowner: task.task_owner
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "openModal":
                draft.modalIsOpen = true
                return
            case "closeModal":
                draft.modalIsOpen = false
                return
            case "userIsInGrp":
                draft.isin_grp = action.value
                return
            case "setTaskNotes":
                draft.tasknotes = action.value
                return
            case "AcknowledgeTask":
                draft.submitCount2++
                return
            case "updateTaskOwner":
                draft.displaytaskowner = action.value
                return
            default:
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)
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
    //check if user is in particular group
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            if(state.modalIsOpen){
                try{
                    const url2 = "/user/checkinggrp/" + permit_group
                    const response = await Axiosinstance.get(url2)
    
                    if(response.data.success){
                        const data = response.data.data
                        if(data.isInGrp){
                            dispatch({type: "userIsInGrp", value: data.isInGrp})
                        }
                    }
                    
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
        }
        fetchData()
    }, [state.modalIsOpen])
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //get notes when modal is open
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            if(state.modalIsOpen){
                try{
                    const url5 = "/task/notes/" + task.task_id
                    const response = await Axiosinstance.get(url5)
                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "setTaskNotes", value: data.task_notes})
                    }
                }
                catch(e){
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }
            }
        }
        fetchData()
    }, [state.modalIsOpen])
    //=============================================================================
    //=============================================================================


    //=============================================================================
    //update task state
    //=============================================================================
    useEffect(() => {
        if(state.submitCount2){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function updateResults(){
                try{
                    const bodydata = {
                        "task_state": task.task_state,
                        "task_id": task.task_id
                    }
                    

                    //submit request 
                    await Axiosinstance.put('task/state/', bodydata) //update state
                    console.log("Task was successfully updated.")

                    appDispatch({ type: "flashMessage", value: "Task was successfully updated."})

                    dispatch({type: "closeModal"})
                    
                    window.scrollTo(0, 0);

                    onTaskEdit();
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "Update not successful. Update in access rights."})
                        navigate('/home');
                    }
                    else{
                        console.log("There was a problem or the request was cancelled")
                        appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                    }
                }

            }
            updateResults()
            return () => ourRequest.cancel()
        }
    }, [state.submitCount2])
    //=============================================================================
    //=============================================================================
    async function handleSubmit2(e){
        e.preventDefault()
        dispatch({type: "AcknowledgeTask"})
    }

    //=============================================================================

    
    return (
        <>
            <div className="card" onClick={() => dispatch({type: "openModal"})}>
                <div className="card-link">
                    <h3 style={{textAlign: "center"}}>{task.task_plan}</h3>
                    <hr/>
                    <h3>{task.task_id}</h3>
                    <div className="row2"><span style={{marginRight: '5px'}}><b>Name: </b></span><p>{truncateLongtext(task.task_name, 30)}</p></div>
                    <div className="row2"><span style={{marginRight: '5px'}}><b>Description: </b></span><p>{truncateLongtext(task.task_description, 45)}</p></div>
                    <div className="row2"><span style={{marginRight: '5px'}}><b>Owner: </b></span><p>{state.displaytaskowner}</p></div>
                </div>
            </div>


            <Modal isOpen={state.modalIsOpen} onRequestClose={() => dispatch({type: "closeModal"})} style={customStyles} contentLabel="Create App Modal" ariaHideApp={false}>
                <div style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => dispatch({type: "closeModal"})}>x</button>
                </div>
                
                <h1 style={{ textAlign: 'center', paddingBottom: '20px'}}>To-Do Task</h1>
                <hr />

                <div className="table-container">
                    <table width="100%">
                        <tbody>
                            <tr>
                                <td width="30%" style={{ borderRight: "1px solid" }}>
                                    <form style={{marginRight: "10px"}}>
                                        
                                        <div className="form-group row" style={{marginRight:"10px"}}>
                                            <label htmlFor="taskid_update" className="col-sm-3 col-form-label">ID:</label>

                                            <div className="col-sm-7">
                                                <input id="taskid_update" name="taskid" className="form-control" type="text" autoComplete="off" placeholder={task.task_id} readOnly />
                                            </div>
                                        </div>


                                        <div className="form-group row" style={{marginRight:"10px"}}>
                                            <label htmlFor="taskowner_update" className="col-sm-3 col-form-label">Owner:</label>

                                            <div className="col-sm-7">
                                                <input id="taskowner_update" name="taskowner" className="form-control" type="text" autoComplete="off" placeholder={state.displaytaskowner} readOnly />
                                            </div>
                                        </div>

                                        <div className="form-group row" style={{marginRight:"10px"}}>
                                            <label htmlFor="taskname_update" className="col-sm-3 col-form-label">Name:</label>

                                            <div className="col-sm-7">
                                                <textarea value={task.task_name} id="taskname_update" name="taskname" className="form-control" autoComplete="off" rows="2" readOnly></textarea>
                                            </div>
                                        </div>

                                        <div className="form-group row" style={{marginRight:"10px"}}>
                                            <label htmlFor="taskdesc_update" className="col-sm-3 col-form-label">Description:</label>

                                            <div className="col-sm-7">
                                                <textarea value={task.task_description} id="taskdesc_update" name="taskdesc" className="form-control" autoComplete="off" rows="2" readOnly></textarea>
                                                
                                            </div>
                                        </div>

                                        <div className="form-group row" style={{marginRight:"10px"}}>
                                            <label htmlFor="taskplan_update" className="col-sm-3 col-form-label">Plan:</label>

                                            <div className="col-sm-7">
                                                <input id="taskplan_update" name="taskplan" className="form-control" type="text" autoComplete="off" placeholder={task.task_plan} readOnly />
                                            </div>
                                        </div>

                                        {state.isin_grp ? (
                                            <>
                                                <div className="form-group row">
                                                    <div className="col-sm-10 offset-sm-2 text-right">
                                                        <button style={{marginRight: "10px"}} onClick={handleSubmit2} className="btn btn-success">Acknowledge</button>
                                                    </div>
                                                </div>
                                            </>
                                        ) 
                                        : 
                                        (
                                            <>
                                            </>
                                        )}

                                    </form>
                                </td>

                                <td width="50%">
                                    {state.isin_grp ? 
                                        (<NotesArea notes={state.tasknotes} taskid={task.task_id} taskstate={task.task_state} onEditNotes={(newOwner) => dispatch({ type: "updateTaskOwner", value: newOwner })} />)
                                        : 
                                        (<NotesArea2 notes={state.tasknotes} />)}
                                        
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Modal>
        </>
        
    );
};

export default TaskCardTodo;