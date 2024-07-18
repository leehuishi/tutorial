import React, { useEffect, useState, useContext } from "react"
import Axiosinstance from '../AxiosInstance'; // Adjust the path as needed
import { setAuthTokenCookie } from "../Cookieutils";

// import Axios from 'axios';
import DispatchContext from "../DispatchContext"

function HeaderLoggedOut(props){
    const appDispatch = useContext(DispatchContext)
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    async function handleSubmit(e) {
        e.preventDefault()
        try{
            const response = await Axiosinstance.post("/login", {username: username, password: password})

            if(response.data.success){
                //set cookie after login
                setAuthTokenCookie(response.data.token)


                const userprofile = await Axiosinstance.get("/me")
                
                if(userprofile.data){
                    console.log(userprofile.data.data)
                    const user = {
                        "token": response.data.token,
                        "username": userprofile.data.data.username
                    }
    
                    //storing using reducer
                    appDispatch({ type: "login", data: user })
                    appDispatch({ type: "flashMessage", value: "Login Successful"})
                }
                else{
                    console.log("Incorrect username / password.")
                    appDispatch({ type: "flashMessage", value: "Invalid username / password."})
                }
                
            }
            else{
                console.log("Incorrect username / password.")
                appDispatch({ type: "flashMessage", value: "Invalid username / password."})
            }
            //-------------------------------------------------------
            // const response = {
            //     data: {
            //         "success": true,
            //         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNzE4MDc0MTQ2LCJleHAiOjE3MTg2Nzg5NDZ9._MpuuSlHRj0TwcSTqQERLhHk-rEWl7vF13lYHrWQOYk",
            //         "username": "John"
            //     }
            // }
            //---------------------------------------------
            // appDispatch({ type: "login", data: response.data })
        }
        catch(e){
            console.log("There was a problem." + e)
            appDispatch({ type: "flashMessage", value: "Invalid username / password."})
        }
    }

    return(
        <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
            <div className="row align-items-center">
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={e=>setUsername(e.target.value)} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
                </div>
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={e=>setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
                </div>
                <div className="col-md-auto">
                    <button className="btn btn-success btn-sm">Sign In</button>
                </div>
            </div>
        </form>
    )
}

export default HeaderLoggedOut