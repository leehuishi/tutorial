import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance";
import axios from "axios";
import { CSSTransition } from "react-transition-group";
import Select from "react-select";
import { useNavigate } from "react-router-dom"

function CreateUser({ onUserAdd, groupslist }){
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate()

    const initialState = {
        username: {
            value: "",
            hasErrors: false,
            message: "",
            isUnique: false,
            checkCount: 0
        },
        email: {
            value: "",
            hasErrors: false,
            message: ""
        },
        password: {
            value: "",
            hasErrors: false,
            message: ""
        },
        groups: {
            options: [],
            value: []
        },
        submitCount: 0
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "usernameImmediately":
                draft.username.hasErrors = false
                draft.username.value = action.value

                if(draft.username.value.length > 32){
                    draft.username.hasErrors = true
                    draft.username.message = "Username cannot exceed 32 characters."
                }
                if(draft.username.value && !/^[a-zA-Z0-9_]+$/.test(draft.username.value)){
                    draft.username.hasErrors = true
                    draft.username.message = "Username can only alphanumeric and underscore"
                }
                return
            case "usernameAfterDelay":
                if(draft.username.value.length < 4){
                    draft.username.hasErrors = true
                    draft.username.message = "Username must be at least 4 characters."
                }

                if(!draft.username.hasErrors){
                    //no error
                    draft.username.checkCount++
                }
                return
            case "usernameUniqueResult":
                if(action.value){
                    draft.username.hasErrors = true
                    draft.username.isUnique = false
                    draft.username.message = "That username is already taken"
                }
                else{
                    draft.username.isUnique = true
                }
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
                if(!/(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])/.test(draft.password.value)){
                    draft.password.hasErrors = true
                    draft.password.message = "Password must contain at least one letter, one number and one special character"
                }
                return
            case "submitForm":
                if(!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && !draft.password.hasErrors){
                    draft.submitCount++
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "Invalid inputs"})
                }
                return
            case "resetValue":
                draft.username.value=""
                draft.email.value=""
                draft.password.value=""
                draft.groups.value=[]
                return
            case "groupsImmediately":
                draft.groups.value = action.value
                return
            case "groupsOptionsUpdate":
                draft.groups.options = action.value.map(option => ({ value: option, label: option }));
                return;
            default:
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)
    
    //=============================================================================
    //delay check for usename (to make sure user finish typing)
    useEffect(() => {
        if(state.username.value){
            const delay = setTimeout(() => dispatch({type: "usernameAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.username.value])

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
    //check if username exist
    useEffect(() => {
        if(state.username.checkCount){
            async function fetchResults(){
                try{
                    const url = "/user/" + state.username.value
                    const response = await Axiosinstance.get(url)

                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "usernameUniqueResult", value: data.usernameexist})
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
    }, [state.username.checkCount])
    //-----------------------------------------------
    //submit create user
    useEffect(() => {
        if(state.submitCount){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function fetchResults(){
                try{
                    //submit request 
                    await Axiosinstance.post('/user/new', {username: state.username.value, email: state.email.value, password: state.password.value}) //create user
                    console.log("User was successfully created.")

                    const url = '/group/' + state.username.value

                    //prepare groups array
                    const usergrplist = [];
                    state.groups.value.forEach((value, index) => {
                        usergrplist.push(value.value)
                    })

                    // console.log(usergrplist)
                    await Axiosinstance.post(url, {groups: usergrplist}) //assign user to groups
                    console.log("User added in groups.")
                    appDispatch({type: "flashMessage", value: "New user created"})


                    const newUser = {
                        "username": state.username.value,
                        "email": state.email.value,
                        "status": 1,
                        "groups": usergrplist
                    }
                    
                    onUserAdd(newUser);
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
    //format grouplist as options when groupslist changes
    useEffect(() => {
        dispatch({ type: "groupsOptionsUpdate", value: groupslist });
    }, [groupslist]);
    //=============================================================================

    //=============================================================================
    async function handleSubmit(e){
        e.preventDefault()
        dispatch({type: "usernameImmediately", value: state.username.value})
        dispatch({type: "usernameAfterDelay", value: state.username.value})

        dispatch({type: "emailImmediately", value: state.email.value})
        dispatch({type: "emailAfterDelay", value: state.email.value})

        dispatch({type: "passwordImmediately", value: state.password.value})
        dispatch({type: "passwordAfterDelay", value: state.password.value})

        dispatch({type: "groupsImmediately", value: state.groups.value})

        dispatch({type: "submitForm"})
    }

    //=============================================================================

    return(
        <tr>
            <td>
                <input onChange={e => dispatch({type: "usernameImmediately", value: e.target.value})} value={state.username.value} id="username_create" name="username" className="form-control" type="text" autoComplete="off" placeholder="Enter username" />
                <CSSTransition in={state.username.hasErrors} timeout={330} unmountOnExit>
                    <div className="alert alert-danger small">{state.username.message}</div>
                </CSSTransition>
            </td>

            <td>
                <input onChange={e => dispatch({type: "emailImmediately", value: e.target.value})} value={state.email.value} id="email_create" name="email" className="form-control" type="text" autoComplete="off" placeholder="Enter email" />
                <CSSTransition in={state.email.hasErrors} timeout={330} unmountOnExit>
                    <div className="alert alert-danger small">{state.email.message}</div>
                </CSSTransition>
            </td>

            <td>
                <input onChange={e => dispatch({type: "passwordImmediately", value: e.target.value})} value={state.password.value} id="password_create" name="password" className="form-control" type="password" autoComplete="off" placeholder="Enter password" />
                <CSSTransition in={state.password.hasErrors} timeout={330} unmountOnExit>
                    <div className="alert alert-danger small">{state.password.message}</div>
                </CSSTransition>
            </td>
            <td>
                -
            </td>
            <td>
                <Select
                    value={state.groups.value}
                    onChange={selectedOptions => dispatch({ type: "groupsImmediately", value: selectedOptions })}
                    options={state.groups.options}
                    isMulti={true}
                />
            </td>
            <td>
                <button type="submit" onClick={handleSubmit}>+</button>
            </td>
        </tr>
    )
}

export default CreateUser