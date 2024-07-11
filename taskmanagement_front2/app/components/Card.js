import React, { useRef, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { useImmerReducer } from 'use-immer'
import axios from "axios"
import Axiosinstance from "../../AxiosInstance"
import DispatchContext from "../DispatchContext"
import { removeAuthTokenCookie } from "../RemoveCookieUtils"
import { CSSTransition } from "react-transition-group";
import Modal from 'react-modal';
import { useNavigate, Link } from "react-router-dom"

const Card = ({ app }) => {
    const truncateRef = useRef(null);
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate()

    //=============================================================================
    //format display date
    //=============================================================================
    const formattedDate = (dateString) => {
        // Assuming dateString is in UTC format (ends with 'Z')
        const date = new Date(dateString);
        
        // Format the date to 'dd MMM yyyy' format
        return format(date, 'dd MMM yyyy');
    }
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //prepare data for edit
    //=============================================================================
    const formattedDate2 = (dateString2) => {
        // Assuming dateString is in UTC format (ends with 'Z')
        const date2 = new Date(dateString2);
        
        return format(date2, 'yyyy-MM-dd');
    }

    const inputstart = formattedDate2(app.app_startdate);
    const inputend = formattedDate2(app.app_enddate);
    var inputcreate = "";
    var inputopen = "";
    var inputtodo = "";
    var inputdoing = "";
    var inputdone = "";

    if(app.app_permit_create !== null){
        inputcreate = app.app_permit_create;
    }
    
    if(app.app_permit_open !== null){
        inputopen = app.app_permit_open;
    }

    if(app.app_permit_todolist !== null){
        inputtodo = app.app_permit_todolist;
    }
    
    if(app.app_permit_doing !== null){
        inputdoing = app.app_permit_doing;
    }

    if(app.app_permit_done !== null){
        inputdone = app.app_permit_done;
    }

    //=============================================================================
    //=============================================================================

    const initialState = {
        ispl: false,
        modalIsOpen: false,
        isTruncated: false,
        startdate: {
            value: inputstart,
            hasErrors: false,
            message: ""
        },
        enddate: {
            value: inputend,
            hasErrors: false,
            message: ""
        },
        create_permit: {
            option: [],
            value: inputcreate
        },
        open_permit: {
            option: [],
            value: inputopen
        },
        todo_permit: {
            option: [],
            value: inputtodo
        },
        doing_permit: {
            option: [],
            value: inputdoing
        },
        done_permit: {
            option: [],
            value: inputdone
        },
        submitCount: 0,
        disp_startdate: {
            value: ""
        },
        disp_enddate: {
            value: ""
        }
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
            case "setIsTruncated":
                draft.isTruncated = true
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
                if(!draft.startdate.hasErrors && !draft.enddate.hasErrors){
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
            case "setDispSDate":
                draft.disp_startdate.value = action.value
                return
            case "setDispEDate":
                draft.disp_enddate.value = action.value
                return
            default:
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)


    //=============================================================================
    //set initial date
    //=============================================================================
    useEffect(() => {
        if(state.disp_startdate.value == ""){
            const f_startdate = formattedDate(app.app_startdate)
            dispatch({type: "setDispSDate", value: f_startdate})
        }
        if(state.disp_enddate.value == ""){
            const f_enddate = formattedDate(app.app_enddate)
            dispatch({type: "setDispEDate", value: f_enddate})
        }
    }, []);
    //=============================================================================
    //=============================================================================

    
    //=============================================================================
    //adjust truncated information
    //=============================================================================
    useEffect(() => {
        const element = truncateRef.current;
        if (element) {
            const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
            const maxHeight = 2 * lineHeight;
            element.style.maxHeight = `${maxHeight}px`;
            if (element.scrollHeight > maxHeight) {
                dispatch({type: "setIsTruncated"})
            }
        }
    }, [app.app_description]);
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
    //delay check
    //=============================================================================
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
    //submit edit app
    //=============================================================================
    useEffect(() => {
        if(state.submitCount){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function fetchResults(){
                try{
                    const bodydata = {
                        "appname": app.app_acronym,
                        "appsdate": state.startdate.value,
                        "appedate": state.enddate.value,
                        "appcreate": state.create_permit.value,
                        "appopen": state.open_permit.value,
                        "apptodo": state.todo_permit.value,
                        "appdoing": state.doing_permit.value,
                        "appdone": state.done_permit.value
                    }
                    
                    //submit request 
                    await Axiosinstance.put('/app/update', bodydata) //update app

                    appDispatch({ type: "flashMessage", value: "App updated successfully"})

                    var f2_startdate = formattedDate(state.startdate.value);
                    var f2_endate = formattedDate(state.enddate.value);
                    dispatch({type: "setDispSDate", value: f2_startdate})
                    dispatch({type: "setDispEDate", value: f2_endate})
                    dispatch({type: "closeModal"})
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "Update not successful. Update in access rights. Please kindly login again."})
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

    const linktoapp = "/app/" + app.app_acronym;

    //=============================================================================
    const handleEditClick = (event) => {
        event.stopPropagation(); // Stop the click event from propagating to the parent Link
        dispatch({ type: "openModal" }); // Dispatch your edit action
    };


    return (
        <>
            <div className="card">
                <div className="card-link">
                    {state.ispl ?
                        <div style={{ textAlign: 'right' }}>
                            <span className="pr-3"></span>
                            <button onClick={handleEditClick} className="btn btn-secondary">
                                Edit
                            </button>
                        </div>
                        : 
                        <></>
                    }
                    <Link to={linktoapp} className="link-card">
                        <div className="row2"><h2 className="card-title">Rnum: </h2><p className="card-content">{app.app_rnumber}</p></div>
                        <div className="row2"><h2 className="card-title">Name: </h2><p className="card-content">{app.app_acronym}</p></div>
                        <div className="row2">
                            <h2 className="card-title">Desc: </h2>
                            <p className={`card-content${state.isTruncated ? '-long' : ''}`} ref={truncateRef}>
                                {app.app_description}
                            </p>
                        </div>
                        <div className="row2"><h2 className="card-title">Duration: </h2><p className="card-content">{state.disp_startdate.value} - {state.disp_enddate.value}</p></div>
                    </Link>
                </div>
            </div>



            
            <Modal isOpen={state.modalIsOpen} onRequestClose={() => dispatch({type: "closeModal"})} style={customStyles} contentLabel="Create App Modal" ariaHideApp={false}>   
                <div style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => dispatch({type: "closeModal"})}>x</button>
                </div>
                
                <h1 style={{ textAlign: 'center', paddingBottom: '20px'}}>Edit App</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group row">
                        <label htmlFor="appname_create" className="col-sm-2 col-form-label">Name:</label>

                        <div className="col-sm-10">
                            {app.app_acronym}
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="rnum_create" className="col-sm-2 col-form-label">R number:</label>
                        
                        <div className="col-sm-10">
                            {app.app_rnumber}
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="desc_create" className="col-sm-2 col-form-label">Desc:</label>
                        
                        <div className="col-sm-10">
                            {app.app_description}
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
        
    );
};

export default Card;