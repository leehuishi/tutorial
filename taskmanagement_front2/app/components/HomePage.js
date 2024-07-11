import React, { useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import axios from "axios"
import Axiosinstance from "../../AxiosInstance"
import { removeAuthTokenCookie } from "../RemoveCookieUtils"
import { CSSTransition } from "react-transition-group";
import Page from "./Page"
import Header from "./Header"
import Modal from 'react-modal';
import Card from './Card';
  
function HomePage(){
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate()

    const initialState = {
        ispl: false,
        modalIsOpen: false,
        applist: [],
        appname: {
            value: "",
            hasErrors: false,
            message: "",
            isUnique: false,
            checkCount: 0
        },
        rnum: {
            value: "",
            hasErrors: false,
            message: ""
        },
        desc: {
            value: ""
        },
        startdate: {
            value: "",
            hasErrors: false,
            message: ""
        },
        enddate: {
            value: "",
            hasErrors: false,
            message: ""
        },
        create_permit: {
            option: [],
            value: ""
        },
        open_permit: {
            option: [],
            value: ""
        },
        todo_permit: {
            option: [],
            value: ""
        },
        doing_permit: {
            option: [],
            value: ""
        },
        done_permit: {
            option: [],
            value: ""
        },
        submitCount: 0
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "userIsPL":
                draft.ispl = action.value
                return
            case "openModal":
                draft.modalIsOpen = true
                return
            case "closeModal":
                draft.modalIsOpen = false
                return
            case "appnameImmediately":
                draft.appname.hasErrors = false
                draft.appname.value = action.value

                if(draft.appname.value && !/^[a-zA-Z0-9_]+$/.test(draft.appname.value)){
                    draft.appname.hasErrors = true
                    draft.appname.message = "App name can only include alphanumeric and underscore"
                }
                return
            case "appnameAfterDelay":
                if(!draft.appname.hasErrors){
                    //no error
                    draft.appname.checkCount++
                }
                return
            case "appnameUniqueResult":
                if(action.value){
                    draft.appname.hasErrors = true
                    draft.appname.isUnique = false
                    draft.appname.message = "That app name is already taken"
                }
                else{
                    draft.appname.isUnique = true
                }
                return
            case "rnumImmediately":
                draft.rnum.hasErrors = false
                draft.rnum.value = action.value
                if(!/^[1-9]\d*$/.test(draft.rnum.value)){
                    draft.rnum.hasErrors = true
                    draft.rnum.message = "Rnumber can only be positive integer and non-zero"
                }
                return
            case "descImmediately":
                draft.desc.hasErrors = false
                draft.desc.value = action.value
                return
            case "startdateImmediately":
                draft.startdate.hasErrors = false
                draft.startdate.value = action.value
                return
            case "startdateAfterDelay":
                if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.startdate.value)){
                    draft.startdate.hasErrors = true
                    draft.startdate.message = "Please enter a valid date (dd/mm/yyyy)"
                }
                return
            case "enddateImmediately":
                draft.enddate.hasErrors = false
                draft.enddate.value = action.value
                return
            case "enddateAfterDelay":
                if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.enddate.value)){
                    draft.enddate.hasErrors = true
                    draft.enddate.message = "Please enter a valid date (dd/mm/yyyy)"
                }
                return
            case "create_permitImmediately":
                draft.create_permit.value = action.value
                return
            case "open_permitImmediately":
                draft.open_permit.value = action.value
                return
            case "todo_permitImmediately":
                draft.todo_permit.value = action.value
                return
            case "doing_permitImmediately":
                draft.doing_permit.value = action.value
                return
            case "done_permitImmediately":
                draft.done_permit.value = action.value
                return
            case "submitForm":
                if(!draft.appname.hasErrors && draft.appname.isUnique && !draft.rnum.hasErrors && !draft.startdate.hasErrors && !draft.enddate.hasErrors){
                    draft.submitCount++
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "Invalid inputs"})
                }
                return
            case "setGrouplist":
                draft.create_permit.option = action.value
                draft.open_permit.option = action.value
                draft.todo_permit.option = action.value
                draft.doing_permit.option = action.value
                draft.done_permit.option = action.value
                return
            case "resetValue":
                draft.appname.value=""
                draft.rnum.value=""
                draft.desc.value=""
                draft.startdate.value=""
                draft.enddate.value=""
                draft.create_permit.value=""
                draft.open_permit.value=""
                draft.todo_permit.value=""
                draft.doing_permit.value=""
                draft.done_permit.value=""
                return
            case "setApplist":
                draft.applist = action.value
                return
            case "addApp":
                draft.applist.push(action.value);
                return;
            default:
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)

    //=============================================================================
    //delay check
    //=============================================================================
    //delay check for appname (to make sure user finish typing)
    useEffect(() => {
        if(state.appname.value){
            const delay = setTimeout(() => dispatch({type: "appnameAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.appname.value])

    //delay check for startdate (to make sure user finish typing)
    useEffect(() => {
        if(state.startdate.value){
            const delay = setTimeout(() => dispatch({type: "startdateAfterDelay"}), 1000)
            return () => clearTimeout(delay)
        }
    }, [state.startdate.value])

    //delay check for enddate (to make sure user finish typing)
    useEffect(() => {
        if(state.enddate.value){
            const delay = setTimeout(() => dispatch({type: "enddateAfterDelay"}), 1000)
            return () => clearTimeout(delay)
        }
    }, [state.enddate.value])
    
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //check if user is project lead
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/user/ispl")

                if(response.data.success){
                    const data = response.data.data
                    if(data.isPL){
                        dispatch({type: "userIsPL", value: data.isPL})
                    }
                }
                
            }
            catch(e){
                appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchData()
    }, [])
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //retrieve all app
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/app/all")

                if(response.data.success){
                    const data = response.data.data
                    dispatch({type: "setApplist", value: data})
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
    //get group list when modal is open
    //=============================================================================
    useEffect(() => {
        async function fetchData() {
            if(state.modalIsOpen){
                try{
                    const response = await Axiosinstance.get("/group/all")
    
                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "setGrouplist", value: data})
                    }
                    
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "Update in access rights. Please kindly login again."})
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
    //check if app exist
    //=============================================================================
    //check if appname exist
    useEffect(() => {
        if(state.appname.checkCount){
            async function fetchResults(){
                try{
                    const url = "/app/check/" + state.appname.value
                    const response = await Axiosinstance.get(url)

                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "appnameUniqueResult", value: data.appexist})
                    }
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "Update in access rights. Please kindly login again."})
                        removeAuthTokenCookie()
                        navigate('/');
                    }
                    else{
                        console.log("There was a problem or the request was cancelled")
                        appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                    }
                }

            }
            fetchResults()
        }
    }, [state.appname.checkCount])
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
    //submit create app
    //=============================================================================
    useEffect(() => {
        if(state.submitCount){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function fetchResults(){
                try{
                    const bodydata = {
                        "appname": state.appname.value,
                        "appdesc": state.desc.value,
                        "apprnum": state.rnum.value,
                        "appsdate": state.startdate.value,
                        "appedate": state.enddate.value,
                        "appcreate": state.create_permit.value,
                        "appopen": state.open_permit.value,
                        "apptodo": state.todo_permit.value,
                        "appdoing": state.doing_permit.value,
                        "appdone": state.done_permit.value
                    }
                    
                    //submit request 
                    await Axiosinstance.post('/app/new', bodydata) //create app
                    console.log("App was successfully created.")

                    appDispatch({ type: "flashMessage", value: "App created successfully"})

                    const newApp = {
                        "app_rnumber": state.rnum.value,
                        "app_acronym": state.appname.value,
                        "app_description": state.desc.value,
                        "app_startdate": state.startdate.value,
                        "app_enddate": state.enddate.value
                    }
                    
                    dispatch({type: "addApp", value: newApp})
                    dispatch({type: "resetValue"})
                    dispatch({type: "closeModal"})
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "App did not create. Update in access rights. Please kindly login again."})
                        removeAuthTokenCookie()
                        navigate('/');
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
        dispatch({type: "appnameImmediately", value: state.appname.value})
        dispatch({type: "appnameAfterDelay", value: state.appname.value})

        dispatch({type: "rnumImmediately", value: state.rnum.value})

        dispatch({type: "descImmediately", value: state.desc.value})

        dispatch({type: "startdateImmediately", value: state.startdate.value})
        dispatch({type: "startdateAfterDelay", value: state.startdate.value})

        dispatch({type: "enddateImmediately", value: state.enddate.value})
        dispatch({type: "enddateAfterDelay", value: state.enddate.value})

        dispatch({type: "create_permitImmediately", value: state.create_permit.value})
        dispatch({type: "open_permitImmediately", value: state.open_permit.value})
        dispatch({type: "todo_permitImmediately", value: state.todo_permit.value})
        dispatch({type: "doing_permitImmediately", value: state.doing_permit.value})
        dispatch({type: "done_permitImmediately", value: state.done_permit.value})

        dispatch({type: "submitForm"})
    }

    //=============================================================================


    return (
        <>
            <Header />
            <Page title="Application" wide={true} top={true}>
                <h1 style={{ textAlign: 'center' }}>Applications</h1>

                {/* Conditionally render User Management button */}
                {state.ispl ?
                    <div style={{ textAlign: 'right' }}>
                        <span className="pr-3"></span>
                        <button onClick={() => dispatch({type: "openModal"})} className="btn btn-secondary">
                            Create App
                        </button>
                    </div>
                    : 
                    <></>
                }
            </Page>
            
                {state.applist.length > 0 ? <div className="card-container">{state.applist.map((app, index) => (<Card key={app.app_acronym} app={app} />))}</div> : <h1 style={{textAlign:"center"}}>No App to display.</h1>}
            
            



            <Modal isOpen={state.modalIsOpen} onRequestClose={() => dispatch({type: "closeModal"})} style={customStyles} contentLabel="Create App Modal" ariaHideApp={false}>   
                <div style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => dispatch({type: "closeModal"})}>x</button>
                </div>
                
                <h1 style={{ textAlign: 'center', paddingBottom: '20px'}}>Create App</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group row">
                        <label htmlFor="appname_create" className="col-sm-2 col-form-label">Name:</label>

                        <div className="col-sm-10">
                            <input onChange={e => dispatch({type: "appnameImmediately", value: e.target.value})} value={state.appname.value} id="appname_create" name="appname" className="form-control" type="text" autoComplete="off" placeholder="Enter appname" />
                            <CSSTransition style={{marginTop: "10px"}} in={state.appname.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.appname.message}</div>
                            </CSSTransition>
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="rnum_create" className="col-sm-2 col-form-label">R number:</label>
                        
                        <div className="col-sm-10">
                            <input onChange={e => dispatch({type: "rnumImmediately", value: e.target.value})} value={state.rnum.value} id="rnum_create" name="rnum" className="form-control" type="number" autoComplete="off" placeholder="Enter rnum" min="1" />
                            <CSSTransition style={{marginTop: "10px"}} in={state.rnum.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.rnum.message}</div>
                            </CSSTransition>
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="desc_create" className="col-sm-2 col-form-label">Desc:</label>
                        
                        <div className="col-sm-10">
                            <textarea onChange={e => dispatch({type: "descImmediately", value: e.target.value})} value={state.desc.value} id="desc_create" name="desc" className="form-control" autoComplete="off" rows="5">Enter Description.</textarea>
                            <CSSTransition style={{marginTop: "10px"}} in={state.desc.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.desc.message}</div>
                            </CSSTransition>
                        </div>
                    </div>

                    <hr />

                    <div className="form-group row">
                        <label htmlFor="startdate_create" className="col-sm-2 col-form-label">Start:</label>
                        
                        <div className="col-sm-10">
                            <input onChange={e => dispatch({type: "startdateImmediately", value: e.target.value})} value={state.startdate.value} id="startdate_create" name="startdate" className="form-control" type="date" />
                            <CSSTransition style={{marginTop: "10px"}} in={state.startdate.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.startdate.message}</div>
                            </CSSTransition>
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="enddate_create" className="col-sm-2 col-form-label">End:</label>
                        
                        <div className="col-sm-10">
                            <input onChange={e => dispatch({type: "enddateImmediately", value: e.target.value})} value={state.enddate.value} id="enddate_create" name="enddate" className="form-control" type="date" />
                            <CSSTransition style={{marginTop: "10px"}} in={state.enddate.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.enddate.message}</div>
                            </CSSTransition>
                        </div>
                    </div>


                    <div className="form-group row">
                        <label htmlFor="create_permit_create" className="col-sm-2 col-form-label">Create:</label>
                        
                        <div className="col-sm-10">
                                {state.create_permit.option.length > 0 ? 
                                    (
                                        <select id="create_permit_create" value={state.create_permit.value} onChange={e => dispatch({type: "create_permitImmediately", value: e.target.value})} className="form-control" name="create_permit">
                                            <option value="">Select...</option>
                                            {state.create_permit.option.map((option, index) => (<option key={option} value={option}>{option}</option>))}
                                        </select>
                                    ) 
                                    : 
                                    (
                                        <p className="form-control">No options available. Please approach admin.</p>
                                    ) 
                                }
                        </div>
                    </div>


                    <div className="form-group row">
                        <label htmlFor="open_permit_create" className="col-sm-2 col-form-label">Open:</label>
                        
                        <div className="col-sm-10">
                                {state.open_permit.option.length > 0 ? 
                                    (
                                        <select id="open_permit_create" value={state.open_permit.value} onChange={e => dispatch({type: "open_permitImmediately", value: e.target.value})} className="form-control" name="open_permit">
                                            <option value="">Select...</option>
                                            {state.open_permit.option.map((option, index) => (<option key={option} value={option}>{option}</option>))}
                                        </select>
                                    ) 
                                    : 
                                    (
                                        <p className="form-control">No options available. Please approach admin.</p>
                                    ) 
                                }
                        </div>
                    </div>


                    <div className="form-group row">
                        <label htmlFor="todo_permit_create" className="col-sm-2 col-form-label">Todo:</label>
                        
                        <div className="col-sm-10">
                                {state.todo_permit.option.length > 0 ? 
                                    (
                                        <select id="todo_permit_create" value={state.todo_permit.value} onChange={e => dispatch({type: "todo_permitImmediately", value: e.target.value})} className="form-control" name="todo_permit">
                                            <option value="">Select...</option>
                                            {state.todo_permit.option.map((option, index) => (<option key={option} value={option}>{option}</option>))}
                                        </select>
                                    ) 
                                    : 
                                    (
                                        <p className="form-control">No options available. Please approach admin.</p>
                                    ) 
                                }
                        </div>
                    </div>


                    <div className="form-group row">
                        <label htmlFor="doing_permit_create" className="col-sm-2 col-form-label">Doing:</label>
                        
                        <div className="col-sm-10">
                                {state.doing_permit.option.length > 0 ? 
                                    (
                                        <select id="doing_permit_create" value={state.doing_permit.value} onChange={e => dispatch({type: "doing_permitImmediately", value: e.target.value})} className="form-control" name="doing_permit">
                                            <option value="">Select...</option>
                                            {state.doing_permit.option.map((option, index) => (<option key={option} value={option}>{option}</option>))}
                                        </select>
                                    ) 
                                    : 
                                    (
                                        <p className="form-control">No options available. Please approach admin.</p>
                                    ) 
                                }
                        </div>
                    </div>


                    <div className="form-group row">
                        <label htmlFor="done_permit_create" className="col-sm-2 col-form-label">Done:</label>
                        
                        <div className="col-sm-10">
                                {state.done_permit.option.length > 0 ? 
                                    (
                                        <select id="done_permit_create" value={state.done_permit.value} onChange={e => dispatch({type: "done_permitImmediately", value: e.target.value})} className="form-control" name="done_permit">
                                            <option value="">Select...</option>
                                            {state.done_permit.option.map((option, index) => (<option key={option} value={option}>{option}</option>))}
                                        </select>
                                    ) 
                                    : 
                                    (
                                        <p className="form-control">No options available. Please approach admin.</p>
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
            </Modal>
        </>
    )
}

export default HomePage