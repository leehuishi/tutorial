import React, { useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance"
import { removeAuthTokenCookie } from "../RemoveCookieUtils"
import { CSSTransition } from "react-transition-group";
import Page from "./Page"
import Header from "./Header"
import Modal from 'react-modal';
  
function HomePage(props){
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate()

    const initialState = {
        ispl: false,
        modalIsOpen: false,
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
                    draft.startdate.message = "Please enter a valid date (YYYY-MM-DD)"
                }
                return
            case "enddateImmediately":
                draft.enddate.hasErrors = false
                draft.enddate.value = action.value
                return
            case "enddateAfterDelay":
                if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.enddate.value)){
                    draft.enddate.hasErrors = true
                    draft.enddate.message = "Please enter a valid date (YYYY-MM-DD)"
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
    //check and submit for create app
    //=============================================================================
    //check if appname exist
    useEffect(() => {
        if(state.appname.checkCount){
            async function fetchResults(){
                try{
                    const url = "/user/" + state.appname.value
                    const response = await Axiosinstance.get(url)

                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "appnameUniqueResult", value: data.appnameexist})
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
    }, [state.appname.checkCount])
    //-----------------------------------------------

    //=============================================================================
    //=============================================================================


    //=============================================================================
    //for modal
    //=============================================================================
    const customStyles = {
        content: {
            top: '20%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width: '50%',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };

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



            <Modal isOpen={state.modalIsOpen} onRequestClose={() => dispatch({type: "closeModal"})} style={customStyles} contentLabel="Create App Modal" >   
                <div style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => dispatch({type: "closeModal"})}>x</button>
                </div>
                
                <h1 style={{ textAlign: 'center', paddingBottom: '20px'}}>Create App</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="appname_create" className="col-sm-2 col-form-label">Name:</label>
                        <input onChange={e => dispatch({type: "appnameImmediately", value: e.target.value})} value={state.appname.value} id="appname_create" name="appname" className="col-sm-10 form-control-lg" type="text" autoComplete="off" placeholder="Enter appname" />
                    </div>
                    <CSSTransition in={state.appname.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                        <div className="alert alert-danger small col-sm-10">{state.appname.message}</div>
                    </CSSTransition>
                </form>
            </Modal>
        </>
    )
}

export default HomePage