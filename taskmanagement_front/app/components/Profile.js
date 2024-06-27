import React, { useEffect, useContext } from "react"
import Page from "./Page"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance";
import Axios from 'axios'
import { CSSTransition } from 'react-transition-group';
import Header from "./Header";




function Profile(){
    const appDispatch = useContext(DispatchContext)

    const initialState = {
        profileData:{
            username: "...",
            email: "..."
        },
        password: {
            value: "",
            hasErrors: false,
            message: "",
        },
        submitPassCount: 0 ,
        email: {
            value: "",
            hasErrors: false,
            message: "",
        },
        submitEmailCount: 0,
        afterEmailhaserror: false,
        aftersubmitEmail: 0
    }


    function ourReducer(draft, action){
        switch (action.type){
            case "getUsername":
                draft.profileData.username = action.value
                return
            case "getEmail":
                draft.profileData.email = action.value
                return
            case "passwordImmediately":
                draft.password.hasErrors = false
                draft.password.value = action.value
                if(draft.password.value.length > 10 ){
                    draft.password.hasErrors = true
                    draft.password.message = "Password cannot exceed 10 characters"
                }
                return
            case "passwordAfterDelay":
                const p_regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])[A-Za-z\d\S]{8,10}$/;

                if(draft.password.value.length < 8){
                    draft.password.hasErrors = true
                    draft.password.message = "Password must be at least 8 characters"
                }
                else if(!p_regex.test(draft.password.value)){
                    draft.password.hasErrors = true
                    draft.password.message = "Password must contain at least 1 alphabet, number and special character"
                }
                return
            case "submitPass":
                if(!draft.password.hasErrors){
                    draft.submitPassCount++
                }
                return
            case "resetPassField":
                draft.password.value = ""
                return
            case "emailImmediately":
                draft.email.hasErrors = false
                draft.email.value = action.value
                return
            case "emailAfterDelay":
                const e_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if(!e_regex.test(draft.email.value)){
                    draft.email.hasErrors = true
                    draft.email.message = "You must provide a valid email address."
                }
                return
            case "submitEmail":
                if(!draft.email.hasErrors){
                    draft.submitEmailCount++
                }
                return
            case "aftersubmitEmail":
                if(!draft.afterEmailhaserror){
                    draft.aftersubmitEmail++
                }
                return
            case "catchEmailerror":
                draft.afterEmailhaserror= true
                return
            case "resetEmailField":
                draft.email.value = ""
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)

    //=============================================================================
    //get user profile
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/user/me")

                if(response.data.success){
                    const data = response.data
                    dispatch({type: "getUsername", value: data.data[0].username})
                    dispatch({type: "getEmail", value: data.data[0].email})
                }

                if(state.aftersubmitEmail){
                    dispatch({type: "resetEmailField"})
                }
                
            }
            catch(e){
                appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchData()
    }, [state.aftersubmitEmail])
    
    //=============================================================================
    //delay check for password (to make sure user finish typing)
    useEffect(() => {
        if(state.password.value){
            const delay = setTimeout(() => dispatch({type: "passwordAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.password.value])

    //delay check for email (to make sure user finish typing)
    useEffect(() => {
        if(state.email.value){
            const delay = setTimeout(() => dispatch({type: "emailAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.email.value])

    //=============================================================================
    //update password
    useEffect(() => {
        if(state.submitPassCount){
            //in case cancel
            const ourRequest = Axios.CancelToken.source()

            async function fetchResults(){
                try{
                    await Axiosinstance.put('/user/update/password', {password: state.password.value}) //update user password
                    appDispatch({type: "flashMessage", value: "Password update successful"})
                    dispatch({type: "resetPassField"})

                }
                catch(e){
                    console.log("There was a problem " + e)
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }

            }
            fetchResults()
            return () => ourRequest.cancel()
        }
    }, [state.submitPassCount])

    //=============================================================================
    //update email
    useEffect(() => {
        if(state.submitEmailCount){
            //in case cancel
            const ourRequest = Axios.CancelToken.source()

            async function fetchResults(){
                try{
                    await Axiosinstance.put('/user/update/email', {email: state.email.value}) //update user email
                    appDispatch({type: "flashMessage", value: "Email update successful"})
                    dispatch({type: "aftersubmitEmail"})

                }
                catch(e){
                    dispatch({type: "catchEmailerror"})
                    console.log("There was a problem " + e)
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }

            }
            fetchResults()
            return () => ourRequest.cancel()
        }
    }, [state.submitEmailCount])

    //=============================================================================
    //after form submit password
    async function handleSubmitPass(e){
        e.preventDefault()

        dispatch({type: "passwordImmediately", value: state.password.value})
        dispatch({type: "passwordAfterDelay", value: state.password.value})

        dispatch({type: "submitPass"})
    }

    //=============================================================================
    //after form submit password
    async function handleSubmitEmail(e){
        e.preventDefault()

        dispatch({type: "emailImmediately", value: state.email.value})
        dispatch({type: "emailAfterDelay", value: state.email.value, noRequest: true})

        dispatch({type: "submitEmail"})
    }

     //=============================================================================


    return(
        <>
            <Header />
            <Page title="Profile" wide={true} top={false}>
                <div className="row align-items-center">
                    <div className="col-lg-5 pb-3 py-lg-5">

                        <div style={{ marginBottom: '20px' }}>
                            <table style={{ borderBottom: '1px solid #000' }}>
                                <tbody>
                                    <tr>
                                        <td style={{paddingRight: '20px'}}>
                                            <h1><b>Username: </b></h1> 
                                        </td>
                                        <td>
                                            <h1>{state.profileData.username} </h1>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={{paddingRight: '20px', paddingBottom: '20px' }}>
                                            <h1><b>Email: </b></h1> 
                                        </td>
                                        <td style={{paddingBottom: '20px' }}>
                                            <h1>{state.profileData.email} </h1>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            
                            <form onSubmit={handleSubmitPass}>
                                <div className="form-group">
                                    <label htmlFor="password" className="text-muted mb-1">
                                        <h3>Change Password:</h3>
                                    </label>
                                    <input value={state.password.value} onChange={e => dispatch({type: "passwordImmediately", value: e.target.value})} id="password" name="password" className="form-control" type="password" />
                                    
                                    <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                                        <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
                                    </CSSTransition>
                                </div>

                                <button type="submit" className="btn btn-lg btn-success">
                                    Change
                                </button>
                            </form>
                        </div>

                        <hr style={{ width: '100%', marginBottom: '20px' }} />

                        <div style={{ marginBottom: '20px' }}>
                            <form onSubmit={handleSubmitEmail}>
                                <div className="form-group">
                                    <label htmlFor="email" className="text-muted mb-1">
                                        <h3>Change Email:</h3>
                                    </label>
                                    <input value={state.email.value} onChange={e => dispatch({type: "emailImmediately", value: e.target.value})} id="email" name="email" className="form-control" type="text" autoComplete="off" />
                                    
                                    <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                                        <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
                                    </CSSTransition>
                                </div>

                                <button type="submit" className="btn btn-lg btn-success">
                                    Change
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </Page>
        </>
    )
}

export default Profile