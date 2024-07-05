import React, { useEffect, useContext } from "react"
import { useNavigate,useParams } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import axios from "axios"
import Axiosinstance from "../../AxiosInstance"
import { removeAuthTokenCookie } from "../RemoveCookieUtils"
import { CSSTransition } from "react-transition-group";
import { format } from 'date-fns';
import Page from "./Page"
import Header from "./Header"
import Modal from 'react-modal';
import TasksAll from "./TasksAll";
import InAppPlan from "./InAppPlan"
  
function InApplication(){
    const appDispatch = useContext(DispatchContext)
    let { appid } = useParams();
    const navigate = useNavigate();

    

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
        modalIsOpen: false
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
                return
            case "closeModal":
                draft.modalIsOpen = false
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
                if(e.response.status === 403){
                    appDispatch({ type: "flashMessageError", value: "User you no longer have access. Please approach your admin for more information."})
                    removeAuthTokenCookie()
                    navigate('/');
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }
            }
        }
        fetchData()
    }, [])
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
                if(e.response.status === 403){
                    appDispatch({ type: "flashMessageError", value: "User you no longer have access. Please approach your admin for more information."})
                    removeAuthTokenCookie()
                    navigate('/');
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }
            }
        }
        fetchData()
    }, [state.appdetails])
    //=============================================================================
    //=============================================================================


    //=============================================================================
    //check if user is project lead
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
                }
                
            }
            catch(e){
                if(e.response.status === 403){
                    appDispatch({ type: "flashMessageError", value: "User you no longer have access. Please approach your admin for more information."})
                    removeAuthTokenCookie()
                    navigate('/');
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }
            }
        }
        fetchData()
    }, [])
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //check if user is in particular group
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
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "User you no longer have access. Please approach your admin for more information."})
                        removeAuthTokenCookie()
                        navigate('/');
                    }
                    else{
                        appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                    }
                }
            }
        }
        fetchData()
    }, [state.isgrp.count])
    //=============================================================================
    //=============================================================================


    //=============================================================================
    async function onClickCreateTask(e){
        e.preventDefault();
        var url3 = '/createtask/' + state.appdetails.app_acronym
        navigate(url3);
    }

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
                            <button onClick={onClickCreateTask} style={{marginRight: "10px"}} className="btn btn-secondary">
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
                <TasksAll />
            </Page>

            <InAppPlan isOpen={state.modalIsOpen} closeModal={() => dispatch({ type: 'closeModal' })} appid={appid} modalIsOpen={state.modalIsOpen} />
        </>
    )
}

export default InApplication