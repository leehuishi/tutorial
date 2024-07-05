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
  
function InCreateTask(){
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
        modalIsOpen: false,
        planname: {
            value: "",
            hasErrors: false,
            message: "",
            isUnique: false,
            checkCount: 0
        },
        planstartdate: {
            value: "",
            hasErrors: false,
            message: ""
        },
        planenddate: {
            value: "",
            hasErrors: false,
            message: ""
        },
        plans: [],
        submitCount: 0
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
            case "plannameImmediately":
                draft.planname.hasErrors = false
                draft.planname.value = action.value
                return
            case "plannameAfterDelay":
                if(!draft.planname.hasErrors){
                    //no error
                    draft.planname.checkCount++
                }
                return
            case "plannameUniqueResult":
                if(action.value){
                    draft.planname.hasErrors = true
                    draft.planname.isUnique = false
                    draft.planname.message = "That plan name is already taken"
                }
                else{
                    draft.planname.isUnique = true
                }
                return
            case "planstartdateImmediately":
                draft.planstartdate.hasErrors = false
                draft.planstartdate.value = action.value
                return
            case "planstartdateAfterDelay":
                if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.planstartdate.value)){
                    draft.planstartdate.hasErrors = true
                    draft.planstartdate.message = "Please enter a valid date (dd/mm/yyyy)"
                }
                return
            case "planenddateImmediately":
                draft.planenddate.hasErrors = false
                draft.planenddate.value = action.value
                return
            case "planenddateAfterDelay":
                if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.planenddate.value)){
                    draft.planenddate.hasErrors = true
                    draft.planenddate.message = "Please enter a valid date (dd/mm/yyyy)"
                }
                return
            case "submitForm":
                if(!draft.planname.hasErrors && draft.planname.isUnique && !draft.planstartdate.hasErrors && !draft.planenddate.hasErrors){
                    draft.submitCount++
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "Invalid inputs"})
                }
                return
            case "setPlans":
                draft.plans = action.value
                return
            case "addPlan":
                draft.plans.push(action.value);
                return;
            case "resetValue":
                draft.planname.value=""
                draft.planstartdate.value=""
                draft.planenddate.value=""
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
    //delay check
    //=============================================================================
    //delay check for planname (to make sure user finish typing)
    useEffect(() => {
        if(state.planname.value){
            const delay = setTimeout(() => dispatch({type: "plannameAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.planname.value])

    //delay check for planstartdate (to make sure user finish typing)
    useEffect(() => {
        if(state.planstartdate.value){
            const delay = setTimeout(() => dispatch({type: "planstartdateAfterDelay"}), 1000)
            return () => clearTimeout(delay)
        }
    }, [state.planstartdate.value])

    //delay check for planenddate (to make sure user finish typing)
    useEffect(() => {
        if(state.planenddate.value){
            const delay = setTimeout(() => dispatch({type: "planenddateAfterDelay"}), 1000)
            return () => clearTimeout(delay)
        }
    }, [state.planenddate.value])
    
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //get plan list when modal is open
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            if(state.modalIsOpen){
                try{

                    const url5 = "/plan/all/" + state.appdetails.app_acronym
                    const response = await Axiosinstance.get(url5)
    
                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "setPlans", value: data})
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
    }, [state.modalIsOpen])
    //=============================================================================
    //=============================================================================


    //=============================================================================
    //check if plan exist
    //=============================================================================
    //check if planname exist
    useEffect(() => {
        if(state.planname.checkCount){
            async function fetchResults(){
                try{
                    const url = "/plan/check?planname=" + state.planname.value +  "&appname=" + state.appdetails.app_acronym
                    const response = await Axiosinstance.get(url)

                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "plannameUniqueResult", value: data.planexist})
                    }
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "User you no longer have access. Please approach your admin for more information."})
                        navigate('/home');
                    }
                    else{
                        console.log("There was a problem or the request was cancelled")
                        appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                    }
                }

            }
            fetchResults()
        }
    }, [state.planname.checkCount])
    //-----------------------------------------------

    //=============================================================================
    //=============================================================================

    //=============================================================================
    //for modal
    //=============================================================================
    const customStyles = {
        content: {
            top: '45%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width: '50%',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '80vh', // Adjust as needed
            overflowY: 'auto'
        },
    };

    //=============================================================================
    //=============================================================================


    //=============================================================================
    //submit create plan
    //=============================================================================
    useEffect(() => {
        if(state.submitCount){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function fetchResults(){
                try{
                    const bodydata = {
                        "planname": state.planname.value,
                        "planstartdate": state.planstartdate.value,
                        "planenddate": state.planenddate.value,
                    }
                    
                    const url4 = 'plan/new/' + state.appdetails.app_acronym;

                    //submit request 
                    await Axiosinstance.post(url4, bodydata) //create plan
                    console.log("Plan was successfully created.")

                    appDispatch({ type: "flashMessage", value: "App created successfully"})

                    const newPlan = {
                        "planname": state.planname.value,
                        "planstartdate": state.planstartdate.value,
                        "planenddate": state.planenddate.value,
                    }
                    
                    dispatch({type: "addPlan", value: newPlan})
                    dispatch({type: "resetValue"})
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "User you no longer have access. Please approach your admin for more information."})
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
    async function onClickCreateTask(e){
        e.preventDefault();
        var url3 = '/createtask/' + state.appdetails.app_acronym
        navigate(url3);
    }

    //=============================================================================

    //=============================================================================
    async function handleSubmit(e){
        e.preventDefault()
        dispatch({type: "plannameImmediately", value: state.planname.value})
        dispatch({type: "plannameAfterDelay", value: state.planname.value})

        dispatch({type: "planstartdateImmediately", value: state.planstartdate.value})
        dispatch({type: "planstartdateAfterDelay", value: state.planstartdate.value})

        dispatch({type: "planenddateImmediately", value: state.planenddate.value})
        dispatch({type: "planenddateAfterDelay", value: state.planenddate.value})

        dispatch({type: "submitForm"})
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
            </Page>
            

            <Modal isOpen={state.modalIsOpen} onRequestClose={() => dispatch({type: "closeModal"})} style={customStyles} contentLabel="Plan Modal" ariaHideApp={false}>   
                <div style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => dispatch({type: "closeModal"})}>x</button>
                </div>
                
                <h1 style={{ textAlign: 'center', paddingBottom: '20px'}}>Plans</h1>

                <div className="table-container">
                    <table className="table table2 table-bordered">
                        <thead>
                            <tr>
                                <th>Plan Name</th>
                                <th>Start</th>
                                <th>End</th>
                            </tr>
                        </thead>
                        <tbody>
                        {state.plans.map((plan, index) => (
                            <tr>
                                <td>{plan.planname}</td>
                                <td>{formattedDate(plan.planstartdate)}</td>
                                <td>{formattedDate(plan.planenddate)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                

                <form onSubmit={handleSubmit}>
                    <div className="form-group row">
                        <label htmlFor="planname_create" className="col-sm-3 col-form-label">Plan Name:</label>

                        <div className="col-sm-5">
                            <input onChange={e => dispatch({type: "plannameImmediately", value: e.target.value})} value={state.planname.value} id="planname_create" name="planname" className="form-control" type="text" autoComplete="off" placeholder="Enter plan name" />
                            <CSSTransition style={{marginTop: "10px"}} in={state.planname.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.planname.message}</div>
                            </CSSTransition>
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="planstartdate_create" className="col-sm-3 col-form-label">Plan Start Date:</label>
                        
                        <div className="col-sm-5">
                            <input onChange={e => dispatch({type: "planstartdateImmediately", value: e.target.value})} value={state.planstartdate.value} id="planstartdate_create" name="planstartdate" className="form-control" type="date" />
                            <CSSTransition style={{marginTop: "10px"}} in={state.planstartdate.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.planstartdate.message}</div>
                            </CSSTransition>
                        </div>
                    </div>


                    <div className="form-group row">
                        <label htmlFor="planenddate_create" className="col-sm-3 col-form-label">Plan End Date:</label>
                        
                        <div className="col-sm-5">
                            <input onChange={e => dispatch({type: "planenddateImmediately", value: e.target.value})} value={state.planenddate.value} id="planenddate_create" name="planenddate" className="form-control" type="date" />
                            <CSSTransition style={{marginTop: "10px"}} in={state.planenddate.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.planenddate.message}</div>
                            </CSSTransition>
                        </div>
                    </div>


                    <div className="form-group row">
                        <div className="col-sm-10 offset-sm-2 text-right">
                            <button type="submit" className="btn btn-success">Submit</button>
                        </div>
                    </div>

                </form>
            </Modal>
        </>
    )
}

export default InCreateTask