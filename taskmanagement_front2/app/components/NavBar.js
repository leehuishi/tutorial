import React, { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance"
import { removeAuthTokenCookie } from "../RemoveCookieUtils"

function NavBar(props){
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate()

    const initialState = {
        isadmin: false,
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "userIsAdmin":
                draft.isadmin = action.value
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)

    function handleHome(){
        navigate("/home")
    }

    function handleProfile(){
        navigate("/profile")
    }

    function handleUserManage(){
        navigate("/usermanage")
    }

    //=============================================================================
    //check if user is admin
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/user/isadmin")

                if(response.data.success){
                    const data = response.data.data
                    if(data.isAdmin){
                        dispatch({type: "userIsAdmin", value: data.isAdmin})
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
    
    return (
        <div className="mb-3" style={{ backgroundColor: '#292929' }}>
            <div className="container d-flex flex-column flex-md-row align-items-center p-3">
                <button onClick={handleHome} className="btn btn-secondary">
                    Home
                </button>
                <span className="pr-3"></span>
                <button onClick={handleProfile} className="btn btn-secondary">
                    Profile
                </button>
                
                {/* Conditionally render User Management button */}
                {state.isadmin ? <>
                                    <span className="pr-3"></span>
                                    <button onClick={handleUserManage} className="btn btn-secondary">
                                        User Management
                                    </button>
                                </> 
                    : <></>
                }
                
            </div>
        </div>
    )
}

export default NavBar