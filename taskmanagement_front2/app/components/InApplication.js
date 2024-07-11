import React, { useEffect, useContext } from "react"
import { useNavigate,useParams } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance"
import Page from "./Page"
import Header from "./Header"
import TasksAll from "./TasksAll";
import InAppPlan from "./InAppPlan";
import InCreateTask from "./InCreateTask"
  
function InApplication(){
    const appDispatch = useContext(DispatchContext)
    let { appid } = useParams();

    const initialState = {
        appdetails: {
            "app_acronym": "",
            "app_description": "",
            "app_rnumber": "",
            "app_startdate": "",
            "app_enddate": "",
            "app_permit_create": "",
            "app_permit_open": "",
            "app_permit_todolist": "",
            "app_permit_doing": "",
            "app_permit_done": ""
        },
        ispm: false,
        isgrp: {
            group: "",
            count: 0,
            for: ""
        },
        app_permit_create: {
            ingrp: false
        },
        modalIsOpen: false,
        modalIsOpen2: false,
        tasklist: [],
        changeintasklist: 0,
        addintasklist:0
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "setAppDetails":
                draft.appdetails = action.value
                return
            case "userIsPM":
                draft.ispm = action.value
                return
            case "userIsInGrp":
                if(draft.isgrp.for === "app_permit_create"){
                    draft.app_permit_create.ingrp = action.value 
                }
                return
            case "triggerCheckGrp":
                draft.isgrp.group = action.value
                draft.isgrp.for = action.value2
                draft.isgrp.count++
                return
            case "openModal":
                draft.modalIsOpen = true
                draft.modalIsOpen2 = false
                return
            case "closeModal":
                draft.modalIsOpen = false
                return
            case "openModal2":
                draft.modalIsOpen2 = true
                draft.modalIsOpen = false
                return
            case "closeModal2":
                draft.modalIsOpen2 = false
                return
            case "setTasklist":
                draft.tasklist = action.value
                return
            case "addTask":
                draft.tasklist.push(action.value);
                draft.addintasklist++
                return;
            case "ChangeTasklist":
                draft.changeintasklist++
                return
            default:
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)

    //=============================================================================
    //app info
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            try{
                const url = "/app/" + appid;
                const response = await Axiosinstance.get(url);

                if(response.data.success){
                    const data = response.data.data
                    dispatch({type: "setAppDetails", value: data})
                }
                
            }
            catch(e){
                appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchData()
    }, [state.addintasklist])
    //=============================================================================
    //=============================================================================


    //=============================================================================
    //check if user is in group
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/user/ispm")

                if(response.data.success){
                    const data = response.data.data
                    if(data.isPM){
                        dispatch({type: "userIsPM", value: data.isPM})
                    }

                    dispatch({type: "triggerCheckGrp", value: state.appdetails.app_permit_create, value2: "app_permit_create"})
                }
                
            }
            catch(e){
                appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchData()
    }, [state.appdetails])
    //=============================================================================
    //=============================================================================
    

    //=============================================================================
    //check if user is in create grp
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            if(state.isgrp.count > 0 && state.isgrp.group !== ""){
                try{
                    const url2 = "/user/checkinggrp/" + state.isgrp.group
                    const response = await Axiosinstance.get(url2)

                    if(response.data.success){
                        const data = response.data.data
                        if(data.isInGrp){
                            dispatch({type: "userIsInGrp", value: data.isInGrp})
                        }
                    }
                }
                catch(e){
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }
            }
        }
        fetchData()
    }, [state.isgrp.count])
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //retrieve all tasks
    //=============================================================================
    useEffect(() => {
        async function fetchTask() {
            try{
                const url1 = "/task/all/" + appid
                const response = await Axiosinstance.get(url1)

                if(response.data.success){
                    const data = response.data.data
                    dispatch({type: "setTasklist", value: data})
                }
                
            }
            catch(e){
                appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchTask()
    }, [state.changeintasklist])
    //=============================================================================
    //=============================================================================

    return (
        <>
            <Header />
            <Page title="Application" wide={true} top={true}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                    <div style={{ flex: '1' }}>
                        {/* Placeholder for left side content */}
                    </div>

                    <h1 style={{ textAlign: 'center', flex: '1' }}>{appid}<span style={{paddingRight: "20px"}}></span>{state.appdetails.app_rnumber}</h1>
                    
                    {/* Conditionally render User Management button */}
                    <div style={{ flex: '1', textAlign: 'right' }}>
                        {state.app_permit_create.ingrp ?
                            <button onClick={() => dispatch({type: "openModal2"})} style={{marginRight: "10px"}} className="btn btn-secondary">
                                Create Task
                            </button>
                            : 
                            <></>
                        }

                        {state.ispm ?
                            
                                <button onClick={() => dispatch({type: "openModal"})} className="btn btn-secondary">
                                    Plans
                                </button>
                            : 
                            <></>
                        }
                    </div>

                </div>
                <br />
                <div style={{ textAlign: 'center' }}>
                    {state.appdetails.app_description}
                </div>
                <br />
                
            </Page>
            <TasksAll tasks={state.tasklist} appdetails={ state.appdetails } onTaskEdit={() => dispatch({ type: "ChangeTasklist" })} />
            <InAppPlan isOpen={state.modalIsOpen} closeModal={() => dispatch({ type: 'closeModal' })} appid={appid} />
            <InCreateTask isOpen2={state.modalIsOpen2} closeModal2={() => dispatch({ type: 'closeModal2' })} appid2={appid} app_permit_create2={state.appdetails.app_permit_create} onTaskAdd={(newTask) => dispatch({ type: "addTask", value: newTask })} />
        </>
    )
}

export default InApplication