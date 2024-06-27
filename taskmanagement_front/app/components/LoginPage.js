import React, { useEffect, useState, useContext } from "react"
import Page from './Page'
import Axiosinstance from "../../AxiosInstance";
import { setAuthTokenCookie } from "../../CookieUtils";
import { removeAuthTokenCookie } from "../RemoveCookieUtils";
import { useNavigate } from "react-router-dom";

// // import Axios from 'axios';
import DispatchContext from "../DispatchContext"

function LoginPage(props){
    const navigate = useNavigate()
    const appDispatch = useContext(DispatchContext)
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()


    async function handleSubmit(e) {
        e.preventDefault()

        if(!username){
            appDispatch({ type: "flashMessageError", value: "Please enter your username"})
            return
        }
        
        if (!password){
            appDispatch({ type: "flashMessageError", value: "Please enter your password"})
            return
        }

        try{
            const response = await Axiosinstance.post("/login", {username: username, password: password})
            
            if(response.data.success){
                //set cookie after login

                setAuthTokenCookie(response.data.token)

                //storing using reducer
                appDispatch({ type: "login" })
                appDispatch({ type: "flashMessage", value: "Login Successful"})
                navigate('/home')

                
            }
            else{
                appDispatch({ type: "flashMessageError", value: "Invalid Login."})
            }
        }
        catch(e){
            if(e.code === "ERR_BAD_REQUEST"){
                appDispatch({ type: "flashMessageError", value: "Invalid Login."})
            }
            else{
                appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
            }
        }
    }

    return(
        <Page title="Welcome" wide={true} top={true} className={'container--wide'} style={{width: "90%"}}>
            <div className="row align-items-center">
                <div>
                    <h1 className="display-3">Task Management System</h1>
                    <br/>
                    <p className="lead text-muted ml-3">TMS is a collaboration platform for users to work together to manage their project.</p>
                </div>

                <div className="col-lg-5 pb-3 py-lg-5">
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username" className="text-muted mb-1">
                                <small>Username</small>
                            </label>
                            <input onChange={e=>setUsername(e.target.value)} id="username" name="username" className="form-control" type="text" autoFocus autoComplete="off" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="text-muted mb-1">
                                <small>Password</small>
                            </label>
                            <input onChange={e=>setPassword(e.target.value)} id="password" name="password" className="form-control" type="password" />
                        </div>

                        <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
                            Login
                        </button>
                    </form>

                </div>
            </div>
        </Page>
    )
}

export default LoginPage