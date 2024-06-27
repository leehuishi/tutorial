import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance";
import axios from "axios";
import { CSSTransition } from "react-transition-group";
import Select from "react-select";

function EachUser(props){
    const appDispatch = useContext(DispatchContext)

    const initialState = {
        editmode : false,
        email: {
            value: props.user.email,
            hasErrors: false,
            message: ""
        },
        password: {
            value: "",
            hasErrors: false,
            message: ""
        },
        status: {
            value: props.user.status
        },
        groups:{
            value: props.user.groups,
            options:[],
            selected: []
        },
        submitCount: 0,

        reademail: {
            value: props.user.email
        },
        readstatus: {
            value: props.user.status
        },
        readgroup: {
            value: props.user.groups
        }

    }

    function ourReducer(draft, action){
        switch (action.type){
            case "editing":
                draft.editmode = true;
                return
            case "save":
                draft.editmode = false;
                return
            case "emailImmediately":
                draft.email.hasErrors = false
                draft.email.value = action.value
                return
            case "emailAfterDelay":
                if(!/^\S+@\S+$/.test(draft.email.value)){
                    draft.email.hasErrors = true
                    draft.email.message = "You must provide a valid email address."
                }
                return
            case "passwordImmediately":
                draft.password.hasErrors = false
                draft.password.value = action.value

                if(draft.password.value.length > 10){
                    draft.password.hasErrors = true
                    draft.password.message = "Password cannot exceed 10 characters."
                }
                return
            case "passwordAfterDelay":
                if(draft.password.value.length < 8){
                    draft.password.hasErrors = true
                    draft.password.message = "Password must be at least 8 characters."
                }
                return
            case "statusImmediately":
                draft.status.value = action.value
                return
            case "submitForm":
                if(!draft.email.hasErrors && !draft.password.hasErrors){
                    draft.submitCount++
                }
                return
            case "resetvalue":
                draft.email.value=props.user.email
                draft.password.value=""
                draft.status.value=props.user.status
                draft.groups.selected = props.user.groups.map(option => ({ value: option, label: option }));
                return
            case "updatevalue":
                draft.reademail.value=draft.email.value
                draft.readstatus.value=draft.status.value
                draft.readgroup.value = action.value
                draft.groups.selected = action.value.map(option => ({ value: option, label: option }));
                return
            case "groupsImmediately":
                draft.groups.selected = action.value
                return
            case "groupsOptionsUpdate":
                draft.groups.options = action.value.map(option => ({ value: option, label: option }));
                return;
            case "groupsInitiateSelected":
                draft.groups.selected = action.value.map(option => ({ value: option, label: option }));
                return;
            default:
                return;
        }
    }
    
    const [state, dispatch] = useImmerReducer(ourReducer, initialState)
    
    //=============================================================================
    //delay check for email (to make sure user finish typing)
    useEffect(() => {
        if(state.email.value){
            const delay = setTimeout(() => dispatch({type: "emailAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.email.value])

    //delay check for password (to make sure user finish typing)
    useEffect(() => {
        if(state.password.value){
            const delay = setTimeout(() => dispatch({type: "passwordAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.password.value])
    
    //=============================================================================

    //=============================================================================
    //submit update user
    useEffect(() => {
        if(state.submitCount){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function fetchResults(){
                try{
                    //submit update request
                    const url = '/user/' + props.user.username

                    await Axiosinstance.put(url, {email: state.email.value, status: state.status.value, password: state.password.value}) //update user
                    console.log("User details updated.")
                    appDispatch({type: "flashMessage", value: "User update successful"})

                    const url2 = '/group/' + props.user.username

                    //prepare groups array
                    const usergrplist = [];

                    state.groups.selected.forEach((value, index) => {
                        usergrplist.push(value.value)
                    })

                    if(!usergrplist.includes("admin") && props.user.username == "admin"){
                        usergrplist.push("admin")
                    }

                    // console.log(usergrplist)
                    await Axiosinstance.post(url2, {groups: usergrplist}) //assign user to groups
                    console.log("User added in groups.")
                    appDispatch({type: "flashMessage", value: "User update successful"})

                    switchmode()
                    
                    dispatch({type: "updatevalue", value: usergrplist})

                }
                catch(e){
                    console.log("There was a problem " + e)
                }

            }
            fetchResults()
            return () => ourRequest.cancel()
        }
    }, [state.submitCount])
   
    //=============================================================================

    //=============================================================================
    //format grouplist as options when groupslist changes
    useEffect(() => {
        dispatch({ type: "groupsOptionsUpdate", value: props.groupslist });
    }, [props.groupslist]);
    //---------------------------------------------------------
    useEffect(() => {
        if(props.user.groups.length > 0){
            dispatch({ type: "groupsInitiateSelected", value: props.user.groups })
        }
    }, [])
    //=============================================================================

    //=============================================================================
    async function handleSubmit(e){
        e.preventDefault()

        dispatch({type: "emailImmediately", value: state.email.value})
        dispatch({type: "emailAfterDelay", value: state.email.value})

        if(state.password.value !== ""){
            dispatch({type: "passwordImmediately", value: state.password.value})
            dispatch({type: "passwordAfterDelay", value: state.password.value})
        }
        

        dispatch({type: "statusImmediately", value: state.status.value})
        dispatch({type: "groupsImmediately", value: state.groups.selected})

        dispatch({type: "submitForm"})
    }

    //=============================================================================

    async function switchmode(e){
        if(state.editmode){
            dispatch({type: "save"})
        }
        else{
            dispatch({type: "editing"})
        }
    }
    
    async function switchmode2(e){
        console.log(state.submitCount);
        if(state.submitCount > 0){
            dispatch({type: "save"})
            console.log(state.readgroup.value)
            dispatch({type: "updatevalue", value: state.readgroup.value})
        }
        else{
            dispatch({type: "save"})
            dispatch({type: "resetvalue"})
        }
        
    }
    //=============================================================================


    return(
        <>
            { state.editmode ? 
            (
                <tr key={props.user.username}>
                    <td>{props.user.username}</td>
                    <td>
                        <input onChange={e => dispatch({type: "emailImmediately", value: e.target.value})} value={state.email.value} id="email_update" name="email" className="form-control" type="text" autoComplete="off" placeholder="Enter email" />
                        <CSSTransition in={state.email.hasErrors} timeout={330} unmountOnExit>
                            <div className="alert alert-danger small">{state.email.message}</div>
                        </CSSTransition>
                    </td>

                    <td>
                        <input onChange={e => dispatch({type: "passwordImmediately", value: e.target.value})} value={state.password.value} id="password_update" name="password" className="form-control" type="password" autoComplete="off" placeholder="Enter password" />
                        <CSSTransition in={state.password.hasErrors} timeout={330} unmountOnExit>
                            <div className="alert alert-danger small">{state.password.message}</div>
                        </CSSTransition>
                    </td>
                    
                    <td>
                        {state.status.value == 1 ? 
                            (
                                <input onChange={e => dispatch({type: "statusImmediately", value: e.target.checked ? 1 : 0 })} id="status_update" name="status" className="form-control" type="checkbox" checked disabled={props.user.username=="admin"} />
                            ) 
                            : 
                            (
                                <input onChange={e => dispatch({type: "statusImmediately", value: e.target.checked ? 1 : 0 })} id="status_update" name="status" className="form-control" type="checkbox" />
                            ) 
                        }
                        
                    </td>
                    
                    <td>
                        <Select
                            value={state.groups.selected}
                            onChange={selectedOptions => dispatch({ type: "groupsImmediately", value: selectedOptions })}
                            options={state.groups.options}
                            isMulti={true}
                        />
                    </td>
                    
                    <td style={{width: "300px"}}>
                        <button  className="btn btn-success" style={{width:'100px', marginRight: '10px' }} onClick={handleSubmit}>Save</button>
                        <button  className="btn btn-danger" style={{width:'100px'}} onClick={switchmode2}>Cancel</button>
                    </td>
                </tr>
            ) 
            : 
            (
                <tr key={props.user.username}>

                    <td>{props.user.username}</td>

                    <td>{state.reademail.value}</td>

                    <td>*************</td>

                    <td>{(state.readstatus.value === 1 ? ("Active"): ("Deactivate"))}</td>

                    <td>{state.readgroup.value.map((group, index) => (
                        <>{group} {index==state.readgroup.value.length-1 ? ("") : (", ")}</>
                    ))}</td>

                    <td style={{width: "300px"}}><button style={{width:'100px'}} className="btn btn-primary" onClick={switchmode}>Edit</button></td>
                </tr>
            )}
        </>
    )
}

export default EachUser