import React, { useEffect, useContext } from "react"
import { useNavigate,useParams } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import axios from "axios"
import Axiosinstance from "../../AxiosInstance"
import { removeAuthTokenCookie } from "../RemoveCookieUtils"
import { CSSTransition } from "react-transition-group";
import { format } from 'date-fns';
import Modal from 'react-modal';

function InAppPlan({ isOpen, closeModal, appid, modalIsOpen }){
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate();

    const initialState = {
        ispm: false,
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
            case "userIsPM":
                draft.ispm = action.value
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
    //format display date
    //=============================================================================
    const formattedDate = (dateString) => {
        // Assuming dateString is in UTC format (ends with 'Z')
        const date = new Date(dateString);
        
        // Format the date to 'dd MMM yyyy' format
        return format(date, 'dd/MM/yyyy');
    }
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
                }
                
            }
            catch(e){
                if(e.response.status === 403){
                    appDispatch({ type: "flashMessageError", value: "User you no longer have access. Please approach your admin for more information."})
                    removeAuthTokenCookie()
                    navigate('/app/' + appid);
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
            try{

                const url5 = "/plan/all/" + appid
                const response = await Axiosinstance.get(url5)
                console.log(response)
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
        fetchData()
    }, [])
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
                    const url = "/plan/check?planname=" + state.planname.value +  "&appname=" + appid
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
                    
                    const url4 = 'plan/new/' + appid;

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
        <Modal isOpen={isOpen} onRequestClose={closeModal} style={customStyles} contentLabel="Plan Modal" ariaHideApp={false}>   
            <div style={{ textAlign: 'right' }}>
                <button className="btn btn-secondary" onClick={closeModal}>x</button>
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
    )
}

export default InAppPlan